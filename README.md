# Check if `package.json` version is bumped

This action checks if `package.json` was bumped only in pull requests.

## Inputs

### `token`
_Optional_. Required for private repositories for retrieving `package.json` file from base sha

## Outputs
_None_

## Example usage
```yaml
- uses: del-systems/check-if-version-bumped@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```
