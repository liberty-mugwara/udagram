/* eslint-disable @typescript-eslint/no-var-requires */
const { writeFileSync, readFileSync, unlinkSync } = require('node:fs');

const tsConfig = JSON.parse(readFileSync('./tsconfig.json').toString());
const buildDir = tsConfig.compilerOptions.outDir;
console.log('build-cleanup.js >> ', { buildDir, source: 'tsconfig.json' });

const package = JSON.parse(
  readFileSync(`./${buildDir}/package.json`).toString(),
);

// remove dev scripts
const { start, ..._ } = package.scripts;
package.scripts = { start };
console.log(
  'build-cleanup.js >> removed dev scripts from package.json. New scripts: ',
  { start },
);

// remove lint-staged
delete package['lint-staged'];
console.log('build-cleanup.js >> removed lint-staged');

// remove devDependencies
delete package.devDependencies;
console.log('build-cleanup.js >> removed devDependencies');

// handle volta
const volta = package.volta;
package.engines = volta;
delete package.volta;
console.log('build-cleanup.js >> changed "volta" to "engine"');

// write the new package.json file
writeFileSync(`./${buildDir}/package.json`, JSON.stringify(package, null, 4));
