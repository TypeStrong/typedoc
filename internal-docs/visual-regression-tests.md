# Running the Visual Regression Tests

When making changes to the themes, it is useful to be able to compare screenshots
from the new/old runs.

1. Build some documentation project to `./docs`
2. Run `node scripts/capture_screenshots.mjs`
3. Run `node scripts/accept_visual_regression.js`
4. Make the UI change
5. Build the same documentation project to `./docs`
6. Run `./scripts/compare_screenshots.sh`
7. Open `./tmp/output/index.html` in a browser.
