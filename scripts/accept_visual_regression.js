//@ts-check

import fs from "fs/promises";
import { join } from "path";

const expectedDir = join(__dirname, "../tmp/baseline");
const outputDir = join(__dirname, "../tmp/screenshots");

await fs.rm(expectedDir, { recursive: true, force: true });
await fs.cp(outputDir, expectedDir, { recursive: true, force: true });
