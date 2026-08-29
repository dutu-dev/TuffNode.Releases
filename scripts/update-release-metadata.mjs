import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const rawRelease = process.env.RELEASE_JSON;
if (!rawRelease) throw new Error("RELEASE_JSON is required.");

const release = JSON.parse(rawRelease);
const tag = String(release.tag_name || "").trim();

function parseIdentity(value) {
  const productTag = value.match(/^(community|core|launcher|orchestrator)-v?(.+)$/i);
  if (productTag) {
    return {
      product: productTag[1].toLowerCase(),
      version: productTag[2],
    };
  }

  const legacyCommunity = value.match(/^v?(\d+(?:\.\d+){1,3}(?:[-+][0-9A-Za-z.-]+)?)$/);
  if (legacyCommunity) {
    return { product: "community", version: legacyCommunity[1] };
  }

  throw new Error(`Unsupported release tag: ${value}. Use <product>-v<version>.`);
}

const { product, version } = parseIdentity(tag);
const versionLabel = version.startsWith("v") ? version : `v${version}`;
const channel = release.prerelease ? "prerelease" : "stable";
const publishedAt = release.published_at || release.created_at;

if (!publishedAt) throw new Error("Release does not contain a publication timestamp.");

function isDownloadAsset(asset) {
  return /\.(exe|msi|msix|zip)$/i.test(asset.name || "");
}

function assetPriority(asset) {
  const name = String(asset.name || "").toLowerCase();
  if (name.endsWith(".exe")) return 0;
  if (name.endsWith(".msi") || name.endsWith(".msix")) return 1;
  if (name.endsWith(".zip")) return 2;
  return 9;
}

const assets = (release.assets || [])
  .filter(isDownloadAsset)
  .map((asset) => ({
    name: asset.name,
    url: asset.browser_download_url,
    size: asset.size,
    contentType: asset.content_type || null,
    digest: asset.digest || null,
  }))
  .sort((a, b) => assetPriority(a) - assetPriority(b));

const manifestPath = path.resolve(`manifests/${product}.json`);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

manifest[channel] = {
  version,
  tag,
  publishedAt: new Date(publishedAt).toISOString(),
  releaseUrl: release.html_url,
  downloadUrl: assets[0]?.url || null,
  assets,
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Updated ${channel} manifest for ${product} ${version}.`);

const CHANGE_TYPES = ["added", "changed", "improved", "fixed", "removed"];

function parseChangelog(markdown) {
  const sections = Object.fromEntries(CHANGE_TYPES.map((type) => [type, []]));
  let current = null;

  for (const line of String(markdown || "").split(/\r?\n/)) {
    const heading = line.match(/^#{1,6}\s+(Added|Changed|Improved|Fixed|Removed)\s*$/i);
    if (heading) {
      current = heading[1].toLowerCase();
      continue;
    }

    const bullet = line.match(/^\s*[-*+]\s+(.+?)\s*$/);
    if (current && bullet) sections[current].push(bullet[1]);
  }

  return sections;
}

const sections = parseChangelog(release.body || "");
const hasStructuredChangelog = CHANGE_TYPES.some((type) => sections[type].length > 0);

if (hasStructuredChangelog) {
  const changelogDir = path.resolve(`changelog/${product}`);
  await mkdir(changelogDir, { recursive: true });

  const changelogEntry = {
    schemaVersion: 1,
    product,
    version: versionLabel,
    tag,
    publishedAt: new Date(publishedAt).toISOString(),
    ...sections,
  };

  await writeFile(
    path.join(changelogDir, `${versionLabel.toLowerCase().replace(/[^a-z0-9._-]/g, "-")}.json`),
    `${JSON.stringify(changelogEntry, null, 2)}\n`,
    "utf8",
  );

  await rebuildCumulativeChangelog();
  console.log(`Updated public changelog for ${product} ${versionLabel}.`);
} else {
  console.log("No Added/Changed/Improved/Fixed/Removed sections found; changelog JSON was not generated.");
}

async function rebuildCumulativeChangelog() {
  const root = path.resolve("changelog");
  const entries = [];

  async function walk(directory) {
    for (const item of await readdir(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, item.name);
      if (item.isDirectory()) {
        await walk(fullPath);
      } else if (item.isFile() && item.name.endsWith(".json")) {
        const parsed = JSON.parse(await readFile(fullPath, "utf8"));
        if (parsed?.schemaVersion === 1 && parsed?.product && parsed?.version) entries.push(parsed);
      }
    }
  }

  await walk(root);
  entries.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

  const lines = [
    "# TuffNode Changelog",
    "",
    "This is the cumulative public changelog for released TuffNode products.",
    "",
  ];

  if (!entries.length) {
    lines.push("No public releases have been published yet.", "");
  }

  for (const entry of entries) {
    const date = entry.publishedAt ? new Date(entry.publishedAt).toISOString().slice(0, 10) : "";
    lines.push(`## ${entry.product} ${entry.version}${date ? ` — ${date}` : ""}`, "");

    for (const type of CHANGE_TYPES) {
      if (!entry[type]?.length) continue;
      lines.push(`### ${type[0].toUpperCase()}${type.slice(1)}`, "");
      for (const item of entry[type]) lines.push(`- ${item}`);
      lines.push("");
    }
  }

  await writeFile(path.resolve("CHANGELOG.md"), `${lines.join("\n").trimEnd()}\n`, "utf8");
}
