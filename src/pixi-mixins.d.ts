import type { PlayOptions } from "@pixi/sound";
import type { BGM, SFX } from "./engine/audio/audio";
import type { Navigation } from "./engine/navigation/navigation";
import type {
	CreationResizePluginOptions,
	DeepRequired,
} from "./engine/resize/ResizePlugin";

declare global {
	namespace PixiMixins {
		interface Application
			extends DeepRequired<CreationResizePluginOptions> {
			audio: {
				bgm: BGM;
				sfx: SFX;
				playMusic: (alias: string, options?: PlayOptions) => void;
				stopMusic: () => void;
				pauseMusic: () => void;
				resumeMusic: () => void;
				playSound: (alias: string, options?: PlayOptions) => void;
				getMasterVolume: () => number;
				setMasterVolume: (volume: number) => void;
			};
			navigation: Navigation;
		}
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface ApplicationOptions extends CreationResizePluginOptions {}
	}
}

export {};
