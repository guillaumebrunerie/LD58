// vite.config.mts
import type { AssetPackConfig } from "@assetpack/core";
import { AssetPack } from "@assetpack/core";
import type { Plugin, ResolvedConfig } from "vite";
import assetPackConfig from "../assetpack.config.js";

export function assetpackPlugin() {
	const apConfig = assetPackConfig as AssetPackConfig;

	let mode: ResolvedConfig["command"];
	let ap: AssetPack | undefined;

	return {
		name: "vite-plugin-assetpack",
		configResolved(resolvedConfig) {
			mode = resolvedConfig.command;
			if (!resolvedConfig.publicDir) return;
			if (apConfig.output) return;
			// remove the root from the public dir
			const publicDir = resolvedConfig.publicDir.replace(
				process.cwd(),
				"",
			);

			if (process.platform === "win32") {
				apConfig.output = `${publicDir}/assets/`;
			} else {
				apConfig.output = `.${publicDir}/assets/`;
			}
		},
		buildStart: async () => {
			if (mode === "serve") {
				if (ap) return;
				ap = new AssetPack(apConfig);
				await ap.watch();
			} else {
				await new AssetPack(apConfig).run();
			}
		},
		buildEnd: async () => {
			if (ap) {
				await ap.stop();
				ap = undefined;
			}
		},
	} as Plugin;
}
