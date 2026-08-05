import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const vaultDir = path.resolve('content/academia');
const publicVault = path.resolve('public/vault');

const MediaExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif', '.ico',
  '.pdf', '.mp4', '.mp3', '.webm', '.wav', '.zip', '.excalidraw',
]);

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(absolute, out);
    } else {
      out.push(absolute);
    }
  }
  return out;
}

await rm(publicVault, { recursive: true, force: true });

let count = 0;
for (const file of await walk(vaultDir)) {
  if (!MediaExtensions.has(path.extname(file).toLowerCase())) continue;
  const target = path.join(publicVault, path.relative(vaultDir, file));
  await mkdir(path.dirname(target), { recursive: true });
  await cp(file, target);
  count++;
}

console.log(`[sync-vault] copied ${count} media files to ${publicVault}`);
