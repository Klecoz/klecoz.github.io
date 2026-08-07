import { readdir, readFile, stat, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * Deletes files in `dist/_astro/` that nothing in the build references.
 *
 * Why any exist: `image()` in a content-collection schema (see
 * src/content.config.ts) resolves each entry's `image` field to real
 * ImageMetadata at build time. Astro can't know whether a consumer will read
 * `.src` directly, so it emits the original file as well as the `<Image>`
 * derivatives. Nothing on this site reads `.src` — every screenshot goes
 * through `<Image>` — so all ten originals shipped unreferenced, and they were
 * 1.35 MB of a 1.9 MB artifact. The headshot is the tell: it's a plain ESM
 * import in Nav.astro rather than a collection field, and it has no orphan.
 *
 * Deleting rather than shrinking the sources is deliberate — it keeps the
 * screenshots exactly as they are on disk and fixes the shipped bytes only.
 */
export default function pruneAssets() {
  return {
    name: 'prune-unreferenced-assets',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const assetDir = path.join(distDir, '_astro');

        let assets;
        try {
          assets = await readdir(assetDir);
        } catch {
          return; // No _astro/ at all — nothing to do.
        }

        // A JS chunk could build an asset URL at runtime by concatenating
        // strings, which a static scan would never see. The site ships zero
        // chunks today, so the scan is complete; if that ever changes, say so
        // loudly and prune nothing rather than delete a file that is genuinely
        // in use.
        const chunks = assets.filter((f) => f.endsWith('.js'));
        if (chunks.length > 0) {
          logger.warn(
            `Skipping prune: ${chunks.length} JS chunk(s) in _astro/ could reference assets ` +
              `dynamically. Re-verify by hand before trusting this step again.`
          );
          return;
        }

        // Every text output, not just HTML — the sitemap and any emitted CSS or
        // JSON can carry an asset path too. Stylesheets are inlined into the
        // pages, so HTML already covers CSS url() references.
        const TEXT = new Set(['.html', '.css', '.xml', '.json', '.txt', '.js']);
        const haystack = [];
        const walk = async (folder) => {
          for (const entry of await readdir(folder, { withFileTypes: true })) {
            const full = path.join(folder, entry.name);
            if (entry.isDirectory()) {
              if (full !== assetDir) await walk(full);
              continue;
            }
            if (TEXT.has(path.extname(entry.name))) haystack.push(await readFile(full, 'utf8'));
          }
        };
        await walk(distDir);
        const corpus = haystack.join('\n');

        let removed = 0;
        let freed = 0;
        for (const name of assets) {
          if (corpus.includes(name)) continue;
          const full = path.join(assetDir, name);
          freed += (await stat(full)).size;
          await unlink(full);
          removed++;
        }

        if (removed > 0) {
          logger.info(
            `Pruned ${removed} unreferenced asset${removed === 1 ? '' : 's'} ` +
              `(${(freed / 1024).toFixed(0)} KB) from _astro/`
          );
        }
      },
    },
  };
}
