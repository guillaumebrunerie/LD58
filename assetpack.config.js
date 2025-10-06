import { pixiPipes } from "@assetpack/core/pixi";

export default {
	entry: "./assets",
	pipes: [
		...pixiPipes({
			cacheBust: false,
			compress: {},
			manifest: {
				output: "./src/manifest.json",
				createShortcuts: true,
				trimExtensions: true,
			},
			texturePacker: {
				removeFileExtensions: true,
			},
		}),
	],
};
