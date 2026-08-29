# TuffNode Release Notes Template

Use this structure when publishing a GitHub Release. The release automation reads the structured sections below and generates the machine-readable changelog automatically.

```markdown
Short user-facing summary of this release.

## Highlights
- Optional headline improvement or feature
- Optional second highlight

## Added
- New functionality

## Changed
- Behavior or workflow changes

## Improved
- Performance, UX or reliability improvements

## Fixed
- Bug fixes

## Removed
- Removed or deprecated functionality

## Breaking Changes
- Only include this section when relevant
```

Empty sections can be omitted.

## Tag convention

Use a product-prefixed release tag:

```text
community-v0.3.0
core-v1.0.0
launcher-v1.0.0
orchestrator-v1.0.0
```

## Assets

Attach installers and archives to the GitHub Release itself. Do not commit binaries into the repository.

Preferred asset order for automatic download selection:

1. `.exe`
2. `.msi` / `.msix`
3. `.zip`
