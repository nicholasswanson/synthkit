#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDataset } from './generate-dataset.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASETS_DIR = path.join(__dirname, '..', 'datasets');
const FILENAME_PATTERN = /^scenario-.*-(\d+)\.json$/;

async function refreshAll() {
  const entries = fs.readdirSync(DATASETS_DIR)
    .filter((name) => FILENAME_PATTERN.test(name))
    .map((name) => {
      const full = path.join(DATASETS_DIR, name);
      let meta;
      try {
        const parsed = JSON.parse(fs.readFileSync(full, 'utf8'));
        meta = parsed?._metadata;
      } catch (err) {
        return { name, skip: `unreadable (${err.message})` };
      }
      if (!meta?.businessType || !meta?.stage) {
        return { name, skip: 'missing _metadata.businessType or _metadata.stage' };
      }
      const match = name.match(FILENAME_PATTERN);
      const scenarioId = parseInt(match[1], 10);
      return { name, businessType: meta.businessType, stage: meta.stage, scenarioId };
    });

  const refreshable = entries.filter((e) => !e.skip);
  const skipped = entries.filter((e) => e.skip);

  console.log(`Found ${entries.length} scenario files (${refreshable.length} to refresh, ${skipped.length} skipped)`);
  for (const s of skipped) console.log(`  skip ${s.name}: ${s.skip}`);

  const failures = [];
  for (const { name, businessType, stage, scenarioId } of refreshable) {
    console.log(`\n→ ${name}  [${businessType} / ${stage} / ${scenarioId}]`);
    const result = await generateDataset(businessType, stage, scenarioId, name);
    if (!result.success) {
      console.error(`  FAILED: ${result.error}`);
      failures.push({ name, error: result.error });
    }
  }

  console.log(`\nRefreshed ${refreshable.length - failures.length}/${refreshable.length} datasets.`);
  if (failures.length) {
    console.error('Failures:');
    for (const f of failures) console.error(`  ${f.name}: ${f.error}`);
    process.exit(1);
  }
}

refreshAll().catch((err) => {
  console.error('Refresh aborted:', err);
  process.exit(1);
});
