#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const prettier = require('prettier');
const {writeRequires} = require("./get-designs");

const cwd = process.cwd();

function createDesigner(args) {
  const {configPath} = args;
  // create the designer folder, exit if it already exists
  const designerFolder = path.resolve(cwd, configPath);
  if (fs.existsSync(designerFolder)) {
    console.error(`Designer folder already exists: ${configPath}`);
    console.error(`Delete it and run this command again`);
    process.exit(1);
    return;
  }
  fs.mkdirSync(designerFolder);

  // create main js in designer folder
  const mainJs = path.resolve(designerFolder, 'main.js');
  const mainJsContent = `
  module.exports = {
      designs: [
          "../src/**/*.design.@(js|jsx|ts|tsx)",
      ],
  }
    `;
  const formattedMainJsContent = prettier.format(mainJsContent, {parser: 'babel'});
  fs.writeFileSync(mainJs, formattedMainJsContent);

  // create preview js in designer folder
  const previewJs = path.resolve(designerFolder, 'preview.js');
  const previewJsContent = `
    import React from "react";
    import {SafeAreaProvider} from "react-native-safe-area-context";

    export const decorators = [
      // Add SafeAreaProvider to all designs
      (Component) => (
        <SafeAreaProvider>
          <Component />
        </SafeAreaProvider>
      ),
    ];
    `;
  const formattedPreviewJsContent = prettier.format(previewJsContent, {parser: 'babel'});
  fs.writeFileSync(previewJs, formattedPreviewJsContent);

  // create index.js in designer folder
  const indexJs = path.resolve(designerFolder, 'index.js');
  const indexJsContent = `
    import {getDesignModeUI} from "react-native-design-mode";

    if (__DEV__) {
      require('./designer.requires');
    }

    const Designer = getDesignModeUI();
    export default Designer;
    `;
  const formattedIndexJsContent = prettier.format(indexJsContent, {parser: 'babel'});
  fs.writeFileSync(indexJs, formattedIndexJsContent);

  // create designer.requires.js in designer folder
  writeRequires(args);

  // read package.json in parent of designer folder
  // add "designer update" as a prestart command,
  // check prestart script and append designer update if not present
  const packageJson = path.resolve(designerFolder, '../package.json');
  if (!fs.existsSync(packageJson)) {
    console.error(`Could not find package.json in ${path.resolve(designerFolder, '..')}`);
    process.exit(1);
    return;
  }
  const packageContent = fs.readFileSync(packageJson, 'utf8');
  const packageObj = JSON.parse(packageContent);
  if (!packageObj.scripts) {
    packageObj.scripts = {};
  }
  let cmd = 'designer update';
  if (configPath !== './.designer') {
    cmd += ` --config ${configPath}`;
  }
  if (!packageObj.scripts.prestart) {
    packageObj.scripts.prestart = cmd;
  }
  if (!packageObj.scripts.prestart.includes(cmd)) {
    packageObj.scripts.prestart += ' && ' + cmd;
  }
  fs.writeFileSync(packageJson, JSON.stringify(packageObj, null, 2));

  console.log(`
      Designer installed in ${configPath}
      To display the designer add the following in your index.js or App.js:
            import Designer from "./.designer";
      and use it in App.js:
            <Designer />
      or in index.js:
            AppRegistry.registerComponent(appName, () => Designer);
    `);
}

module.exports = {
  createDesigner,
}
