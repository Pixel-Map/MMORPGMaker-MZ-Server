import esbuild from 'rollup-plugin-esbuild';
import externalGlobals from 'rollup-plugin-external-globals';
import { readFileSync } from 'fs';

const prettier = require('rollup-plugin-prettier');
import generate from '@comuns-rpgmaker/plugin-metadata';

const pluginList = ['MMO_Core', 'MMO_Core_Player', 'MMO_Core_NPCs', 'PixelMap_Yarn_Spinner', 'PixelMap_TileHouse'];

function getMetadata(name) {
    return readFileSync(`${__dirname}/src/plugins/generated/${name}_metadata.js`) + '\n' + readFileSync('header.js', 'utf-8');
}

// Generate metadata
for (const plugin of pluginList) {
    generate(`src/plugins/${plugin}.yaml`, `src/plugins/generated/${plugin}_metadata.js`);
}

let conf = [];
for (const plugin of pluginList) {
    conf.push({
        external: ['socket.io-client', './MMO_Core', './MMO_Core_Player', './MMO_Core_NPCs'],
        input: `src/plugins/${plugin}.ts`,
        output: [
            {
                file: `../js/plugins/${plugin}.js`,
                name: `${plugin}`,
                format: 'iife',
                sourcemap: false,
                banner: getMetadata(plugin),
            },
        ],
        plugins: [
            esbuild({
                target: 'es2022',
            }),
            externalGlobals({
                'rmmz': 'window',
                'socket.io-client': 'io',
                './MMO_Core': 'MMO_Core',
                './MMO_Core_Player': 'MMO_Core_Player',
                './MMO_Core_NPCs': 'MMO_Core_NPCs',
                'yarn-bound': 'YarnBound',
            }),
            prettier({
                tabWidth: 4,
                useTabs: false,
                singleQuote: true,
                parser: 'babel',
            }),
        ],
    });
}
export default conf;


