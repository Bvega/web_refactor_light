#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const chalk = require('chalk');
const ingest = require('../lib/ingest');
const generate = require('../lib/generate');

yargs(hideBin(process.argv))
  .command(
    'ingest',
    'Ingest a template ZIP file',
    (yargs) => {
      return yargs
        .option('zip', { type: 'string', demandOption: true, describe: 'Path to ZIP file' })
        .option('slug', { type: 'string', describe: 'Template slug (auto-detected if omitted)' })
        .option('variant', { type: 'string', describe: 'Variant name (auto-detected if omitted)' });
    },
    async (argv) => {
      try {
        await ingest(argv);
        console.log(chalk.green('✓ Ingestion complete'));
      } catch (err) {
        console.error(chalk.red('✗ Ingestion failed:'), err.message);
        process.exit(1);
      }
    }
  )
  .command(
    'generate',
    'Generate a MERN kit from a template variant',
    (yargs) => {
      return yargs
        .option('slug', { type: 'string', demandOption: true, describe: 'Template slug' })
        .option('variant', { type: 'string', default: 'default', describe: 'Variant name' })
        .option('out', { type: 'string', demandOption: true, describe: 'Output folder in kits/' });
    },
    async (argv) => {
      try {
        await generate(argv);
        console.log(chalk.green('✓ MERN kit generated'));
      } catch (err) {
        console.error(chalk.red('✗ Generation failed:'), err.message);
        process.exit(1);
      }
    }
  )
  .demandCommand(1, 'You must specify a command')
  .help()
  .argv;