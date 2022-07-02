import typescript from '@rollup/plugin-typescript';
import externalGlobals from "rollup-plugin-external-globals";
import {readFileSync} from 'fs';

function getMetadata(name) {
	return readFileSync(`${__dirname}/dist/${name}_metadata.js`) + '\n' + readFileSync('header.js', 'utf-8')
}


export default [
	{
		external: ["socket.io-client"],
		input: 'src/plugins/mmo_core.ts',
		output: [
			{
				file: `../js/plugins/MMO_Core.js`,
				name: 'MMO_Core',
				format: 'iife',
				sourcemap: false,
				banner: getMetadata("mmo_core"),
			}
		],
		plugins: [
			typescript(),
			externalGlobals({
				"rmmz": "window",
				"socket.io-client": "io"
			})
		]
	},
	{
		external: ["socket.io-client"],
		input: 'src/plugins/mmo_core_player.ts',
		output: [
			{
				file: `../js/plugins/MMO_Core_Player.js`,
				name: 'MMO_Core_Player',
				format: 'iife',
				sourcemap: false,
				banner: getMetadata("mmo_core_player"),
			}
		],
		plugins: [
			typescript(),
			externalGlobals({
				"rmmz": "window",
				"socket.io-client": "io"
			})
		]
	}
];

