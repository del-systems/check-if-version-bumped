# Check if `package.json` version is bumped

This action checks if `package.json` was bumped only in pull requests.

## Inputs

### `token`
_Optional_. Required for private repositories for retrieving `package.json` file from base sha

### `path`
_Optional_. Specify where to obtain `package.json` file. Path is relative to git root. Do not start with `/` (slash). Defaults to `package.json`

## Outputs
_None_

## Releases and node versions
Release|Node version
------|--------
2.x | Node 20
1.x | Node 16

## Example usage
```yaml
- uses: del-systems/check-if-version-bumped@v2
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    path: "server/package.json"
```
