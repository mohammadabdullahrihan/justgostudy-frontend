import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const PORT = 4173;
const routePath = process.argv[2] || '/';
const url = `http://localhost:${PORT}${routePath}`;

const waitForServer = (target, timeoutMs = 30000) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = async () => {
      try {
        await fetch(target);
        return resolve();
      } catch {
        if (Date.now() - start > timeoutMs) return reject(new Error('Preview server did not start in time'));
        setTimeout(tick, 500);
      }
    };
    tick();
  });

async function main() {
  const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'inherit',
  });

  try {
    await waitForServer(`http://localhost:${PORT}`);

    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new'] });
    const result = await lighthouse(url, {
      port: chrome.port,
      output: ['html', 'json'],
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });
    await chrome.kill();

    mkdirSync('lighthouse-reports', { recursive: true });
    const slug = routePath === '/' ? 'home' : routePath.replace(/^\//, '').replace(/\//g, '-');
    writeFileSync(`lighthouse-reports/${slug}.html`, result.report[0]);
    writeFileSync(`lighthouse-reports/${slug}.json`, result.report[1]);

    console.log(`\nLighthouse scores for ${url}:`);
    for (const category of Object.values(result.lhr.categories)) {
      console.log(`  ${category.title}: ${Math.round(category.score * 100)}`);
    }
    console.log(`\nFull report: lighthouse-reports/${slug}.html`);
  } finally {
    preview.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
