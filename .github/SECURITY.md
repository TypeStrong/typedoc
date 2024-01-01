# Security Policy

## Supported Versions

The TypeDoc team supports the latest minor version. For one minor version prior to the latest,
pull requests providing patches to fix security vulnerabilities will be accepted. Support for the
previous minor version relies completely on community pull requests.

| Version | Status             |
| ------- | ------------------ |
| 0.25.x  | :white_check_mark: |
| 0.24.x  | :warning:          |
| < 0.24  | :x:                |

## Patching LTS Versions

If you depend on the prior minor version of TypeDoc and want to submit a fix, submit a pull request
to the `lts` branch. When merged, a new version will be automatically published with your patch.

Be sure to include an update to the version field in `package.json`.

Note: Only pull requests which fix security vulnerabilities will be accepted. Additional features and bug fixes are out of scope for old versions.
