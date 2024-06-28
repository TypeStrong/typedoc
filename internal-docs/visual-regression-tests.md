# Running the Visual Regression Tests

When making changes to the themes, it is useful to be able to compare screenshots
from the new/old runs.

1. Run `node scripts/visual_regression.js`
2. Make the UI change
3. Run `node scripts/visual_regression.js`

The visual regression script accepts several arguments to control what it does,
run it with `--help` to see a summary of the available options.
