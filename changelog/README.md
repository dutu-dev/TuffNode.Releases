# Machine-readable changelog

Each published product release may have a JSON changelog at:

```text
changelog/<product>/<version>.json
```

For a release tagged `community-v0.3.0`, the changelog path is:

```text
changelog/community/v0.3.0.json
```

Example:

```json
{
  "schemaVersion": 1,
  "product": "community",
  "version": "v0.3.0",
  "tag": "community-v0.3.0",
  "publishedAt": "2026-08-29T12:00:00Z",
  "added": [],
  "changed": [],
  "improved": [],
  "fixed": [],
  "removed": []
}
```

The website prefers this machine-readable changelog when present. If it is missing, release notes may be used as a fallback.
