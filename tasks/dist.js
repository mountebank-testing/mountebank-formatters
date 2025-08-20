'use strict';

const run = require('./run').run,
    fs = require('fs-extra');

async function distPackage (source, destination, packageTransformer) {
    fs.ensureDirSync(`dist/${destination}`);
    const pkg = JSON.parse(fs.readFileSync(`${source}/package.json`));

    pkg.files.forEach(file => {
        fs.copySync(`${source}/${file}`, `dist/${destination}/${file}`);
    });

    packageTransformer(pkg);
    fs.writeFileSync(`dist/${destination}/package.json`, JSON.stringify(pkg, null, 2));

    await run('npm', ['install', '--production'], { cwd: `dist/${destination}` });
    await run('npm', ['pack'], { cwd: `dist/${destination}` });
}

async function packageMountebankFormatters() {
    await distPackage('.', 'mountebank-formatters', pkg => {
        delete pkg.devDependencies;
        delete pkg.scripts;
    });
}

fs.removeSync('dist');
packageMountebankFormatters()
    .then(() => console.log('package available in dist directory'))
    .catch(error => {
        console.error(error);
        process.exit(1); // eslint-disable-line no-process-exit
    });