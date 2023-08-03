function getArguments() {
  const { program } = require('commander');

  program
    .description('Getter for react native design mode')
    .option(
      '-c, --config-path <path>',
      'The path to your config folder relative to your project-dir',
      './.designer'
    )
    .option('-a, --absolute', 'Use absolute paths for design imports');

  program.parse();

  return program.opts();
}

module.exports = { getArguments };
