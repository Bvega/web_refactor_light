const fs = require('fs-extra');
const path = require('path');
const extract = require('extract-zip');
const chalk = require('chalk');
const { globby } = require('globby');

const ROOT = path.resolve(__dirname, '../..');
const TMP_DIR = path.join(ROOT, '.tmp');
const PUBLIC_TEMPLATE_DIR = path.join(ROOT, 'previewer/public/template');
const MANIFEST_PATH = path.join(PUBLIC_TEMPLATE_DIR, 'manifest.json');

async function ingest({ zip, slug, variant }) {
  console.log(chalk.blue('→ Ingesting template...'));
  
  const zipPath = path.resolve(zip);
  if (!fs.existsSync(zipPath)) {
    throw new Error(`ZIP file not found: ${zipPath}`);
  }

  // Auto-detect slug from ZIP filename if not provided
  if (!slug) {
    slug = path.basename(zipPath, '.zip').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    console.log(chalk.dim(`  Auto-detected slug: ${slug}`));
  }

  const tmpExtract = path.join(TMP_DIR, slug);
  await fs.remove(tmpExtract);
  await fs.ensureDir(tmpExtract);

  // Extract ZIP
  console.log(chalk.dim('  Extracting...'));
  await extract(zipPath, { dir: tmpExtract });

  // Detect variants
  const entries = await fs.readdir(tmpExtract);
  let variants = [];
  let sourceMapping = {};

  if (variant) {
    // User specified variant - use entire extracted content as single variant
    variants = [variant];
    sourceMapping[variant] = tmpExtract;
  } else {
    // Auto-detect: look for subfolders with index.html
    const potentialVariants = [];
    for (const entry of entries) {
      const entryPath = path.join(tmpExtract, entry);
      const stat = await fs.stat(entryPath);
      if (stat.isDirectory()) {
        const hasIndex = await fs.pathExists(path.join(entryPath, 'index.html'));
        if (hasIndex) {
          potentialVariants.push({ name: entry, path: entryPath });
        }
      }
    }

    if (potentialVariants.length > 0) {
      // Multiple variant folders detected
      variants = potentialVariants.map(v => v.name);
      potentialVariants.forEach(v => {
        sourceMapping[v.name] = v.path;
      });
      console.log(chalk.dim(`  Detected variants: ${variants.join(', ')}`));
    } else {
      // Single variant, use 'default'
      variants = ['default'];
      sourceMapping['default'] = tmpExtract;
      console.log(chalk.dim('  Using default variant'));
    }
  }

  // Copy to public/template/<slug>/<variant>/
  for (const variantName of variants) {
    const destDir = path.join(PUBLIC_TEMPLATE_DIR, slug, variantName);
    await fs.ensureDir(destDir);
    await fs.copy(sourceMapping[variantName], destDir, { overwrite: true });
    console.log(chalk.dim(`  Copied ${variantName} → public/template/${slug}/${variantName}/`));
  }

  // Detect pages (HTML files in first variant)
  const firstVariantDir = path.join(PUBLIC_TEMPLATE_DIR, slug, variants[0]);
  const htmlFiles = await globby('*.html', { cwd: firstVariantDir });
  const pages = htmlFiles.sort();

  // Update manifest
  await updateManifest(slug, slug, variants, pages);

  console.log(chalk.green(`  ✓ Ingested ${slug} with ${variants.length} variant(s)`));
}

async function updateManifest(slug, label, variants, pages) {
  await fs.ensureFile(MANIFEST_PATH);
  let manifest = { templates: [] };
  
  try {
    const content = await fs.readFile(MANIFEST_PATH, 'utf8');
    if (content.trim()) {
      manifest = JSON.parse(content);
    }
  } catch (err) {
    // Empty or invalid, start fresh
  }

  // Remove existing entry for this slug
  manifest.templates = manifest.templates.filter(t => t.slug !== slug);

  // Add new entry
  manifest.templates.push({
    slug,
    label: label.charAt(0).toUpperCase() + label.slice(1),
    variants,
    pages
  });

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(chalk.dim('  Updated manifest.json'));
}

module.exports = ingest;