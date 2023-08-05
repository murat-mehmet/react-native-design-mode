#!/usr/bin/env node

const {program} = require('commander');
const {version} = require('../package.json');

program
  .name('designer')
  .description('React Native Design Mode CLI')
  .version(version)

program
  .command('update')
  .description('Update designs from your project')
  .option(
    '-c, --config-path <path>',
    'The path to your config folder relative to your project-dir',
    './.designer'
  )
  .option('-a, --absolute', 'Use absolute paths for design imports')
  .action((args) => {
    const {writeRequires} = require("./get-designs");
    writeRequires(args);
  });

program
  .command('install')
  .description('Initialize and scaffold designer files')
  .option(
    '-c, --config-path <path>',
    'The path to your config folder relative to your project-dir',
    './.designer'
  )
  .option('-a, --absolute', 'Use absolute paths for design imports')
  .action((args) => {
    const {createDesigner} = require("./init-designer");
    createDesigner(args);
  })

program.parse();
