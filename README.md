# TuffNode Releases

Official public distribution repository for the TuffNode ecosystem.

This repository contains public release metadata, changelogs and GitHub Release assets for TuffNode products. TuffNode source code is maintained privately and is **not open source**.

## What lives here

- official GitHub Releases and downloadable binaries
- stable and prerelease manifests used by TuffNode and tuffnode.com
- public changelog metadata
- release automation

Binaries such as `.exe`, `.msi` and `.zip` files belong in **GitHub Release Assets**, not in Git history.

## Products

- TuffNode Community
- TuffNode Core
- TuffNode Launcher
- TuffNode Orchestrator

A product being listed here does not mean it is publicly available. Availability is determined by its release manifest.

## Release tags

Use product-prefixed tags so versions from different products cannot collide:

```text
community-v0.3.0
core-v1.0.0
launcher-v1.0.0
orchestrator-v1.0.0
```

Legacy tags such as `v0.3.0` are interpreted as Community releases, but product-prefixed tags are preferred.

## Repository structure

```text
TuffNode.Releases/
├── CHANGELOG.md
├── manifests/
│   ├── community.json
│   ├── core.json
│   ├── launcher.json
│   └── orchestrator.json
├── changelog/
│   └── <product>/<version>.json
└── .github/workflows/
```

For example, `community-v0.3.0` produces `changelog/community/v0.3.0.json` when the release notes contain structured changelog sections.

`manifests/*.json` are machine-readable and can be consumed by the website or by TuffNode update checks. `CHANGELOG.md` is the human-readable cumulative changelog.

## Distribution model

A published GitHub Release updates the corresponding public manifest. Release assets remain attached to GitHub Releases and are referenced by URL from the manifest.

The TuffNode website consumes this repository as the public authority for releases, downloads and changelog data.

## Source availability

TuffNode is independently developed and is **not open source**. This repository is a distribution and release-metadata repository only; it does not contain the TuffNode application source code.

## Trademark / affiliation

TuffNode is an independent project and is not affiliated with, endorsed by, or associated with Mojang Studios, Microsoft, or the Minecraft server software projects it supports.
