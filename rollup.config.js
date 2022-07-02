import typescript from 'rollup-plugin-typescript2';
import externalGlobals from "rollup-plugin-external-globals";
import {readFileSync} from 'fs';

function getMetadata(name) {
	return readFileSync(`${__dirname}/dist/${name}_metadata.js`) + '\n' + readFileSync('header.js', 'utf-8')
}

const pluginList = ['MMO_Core', 'MMO_Core_Player']
let conf = []
for (const plugin of pluginList) {
	conf.push({
		external: ["socket.io-client", "./mmo_core"],
		input: `src/plugins/${plugin}.ts`,
		output: [
			{
				file: `../js/plugins/${plugin}.js`,
				name: `${plugin}`,
				format: 'iife',
				sourcemap: false,
				banner: getMetadata(plugin),
			}
		],
		plugins: [
			typescript({
				tsconfigOverride: {
					compilerOptions: {
						target: "es2022"
					}
				}
			}),
			externalGlobals({
				"rmmz": "window",
				"socket.io-client": "io",
				"./mmo_core": "MMO_Core"
			}),
		]
	})
}
export default conf


