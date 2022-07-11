import esbuild from 'rollup-plugin-esbuild';
import externalGlobals from 'rollup-plugin-external-globals';
import { readFileSync } from 'fs';

function getMetadata(name) {
    return readFileSync(`${__dirname}/dist/${name}_metadata.js`) + '\n' + readFileSync('header.js', 'utf-8');
}

const pluginList = ['MMO_Core', 'MMO_Core_Player', 'MMO_Core_NPCs'];
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
            }),
        ],
    });
}
export default conf;


