import crypto from "node:crypto";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import {
  lstat,
  mkdir,
  readlink,
  rename,
  symlink,
} from "node:fs/promises";

const projectDir = process.cwd();
const nextDir = path.join(projectDir, ".next");
const devDir = path.join(nextDir, "dev");
const projectHash = crypto
  .createHash("sha256")
  .update(projectDir)
  .digest("hex")
  .slice(0, 8);
const cacheDir =
  process.env.NEXT_DEV_CACHE_DIR ||
  path.join(os.tmpdir(), "next-dev-cache", `${path.basename(projectDir)}-${projectHash}`);

async function pathExists(filePath) {
  try {
    return await lstat(filePath);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function uniqueBackupPath() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  let candidate = path.join(nextDir, `dev-on-slow-filesystem-${stamp}`);
  let suffix = 1;

  while (await pathExists(candidate)) {
    candidate = path.join(nextDir, `dev-on-slow-filesystem-${stamp}-${suffix}`);
    suffix += 1;
  }

  return candidate;
}

await mkdir(cacheDir, { recursive: true });
await mkdir(nextDir, { recursive: true });

const current = await pathExists(devDir);

if (current) {
  if (current.isSymbolicLink()) {
    const linkTarget = await readlink(devDir);
    const resolvedTarget = path.resolve(nextDir, linkTarget);

    if (resolvedTarget === path.resolve(cacheDir)) {
      console.log(`Next dev cache already points to ${cacheDir}`);
      process.exit(0);
    }
  }

  const backup = await uniqueBackupPath();
  await rename(devDir, backup);
  console.log(`Moved existing .next/dev to ${path.relative(projectDir, backup)}`);
}

await symlink(cacheDir, devDir, process.platform === "win32" ? "junction" : "dir");
console.log(`Next dev cache now points to ${cacheDir}`);
