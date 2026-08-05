import 'dotenv/config';
import { execSync } from 'node:child_process';
import { rm } from 'node:fs/promises';
import path from 'node:path';

const repo = process.env.ACADEMIA_URL;
if (!repo) {
  console.error('[sync] ACADEMIA_URL env var is required');
  process.exit(1);
}
const target = path.resolve('content/academia');

await rm(target, { recursive: true, force: true });

execSync(`git clone --depth 1 "${repo}" "${target}"`, { stdio: 'inherit' });

await rm(path.join(target, '.git'), { recursive: true, force: true });

console.log(`[sync] pulled dulranga/academia into ${target}`);
