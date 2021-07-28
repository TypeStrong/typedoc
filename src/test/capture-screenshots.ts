import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as Path from 'path';
import {sync as glob} from 'glob';
import PQueue from 'p-queue';

const concurrency = 10;
const baseDirectory = Path.join(__dirname, '../../dist/tmp/test');
const outputDirectory = Path.join(__dirname, '../../dist/tmp/__screenshots__');
const globPattern = '**/*.html';
const viewport = { width: 1024, height: 768 };

async function main() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  const queue = new PQueue({autoStart: true, concurrency});
  for(const file of glob(globPattern, {cwd: baseDirectory})) {
    queue.add(async () => {
        const absPath = Path.resolve(baseDirectory, file);
        const outputPath = Path.resolve(outputDirectory, Path.format({...Path.parse(file), ext: '.png', base: undefined}));
        fs.mkdirSync(Path.dirname(outputPath), {recursive: true});

        const page = await browser.newPage();
        await page.setViewport(viewport);
        await page.goto(`file://${ absPath }`, {
            waitUntil: 'domcontentloaded' // 'load' 'networkidle0' 'networkidle2'
        });
        await new Promise(res => setTimeout(() => res(undefined), 300));
        await page.screenshot({ path: outputPath, fullPage: true });

        await page.close();
    });
  }
  await queue.onIdle();

  await browser.close();
}

void main();
