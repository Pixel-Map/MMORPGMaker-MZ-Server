import typescript from '@rollup/plugin-typescript';
import externalGlobals from "rollup-plugin-external-globals";
import {readFileSync} from 'fs';


const mmo_core_metadata_header = readFileSync(`${__dirname}/dist/mmo_core_metadata.js`)
	+ '\n'
	+ readFileSync('header.js', 'utf-8');

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
				banner: mmo_core_metadata_header
			}
		],
		plugins: [
			typescript(),
			externalGlobals({
				"rmmz": "window",
			})
		]
	}
];
