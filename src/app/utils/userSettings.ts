import { storage } from "../../engine/utils/storage";
import { engine } from "../getEngine";

// Keys for saved items in storage
const KEY_VOLUME_MASTER = "volume-master";
const KEY_VOLUME_BGM = "volume-bgm";
const KEY_VOLUME_SFX = "volume-sfx";

/**
 * Persistent user settings of volumes.
 */
class UserSettings {
	public init() {
		engine().audio.setMasterVolume(this.getMasterVolume());
		engine().audio.bgm.setVolume(this.getBgmVolume());
		engine().audio.sfx.setVolume(this.getSfxVolume());
	}

	/** Overall sound volume */
	public getMasterVolume() {
		return storage.getNumber(KEY_VOLUME_MASTER) ?? 0.5;
	}
	public setMasterVolume(value: number) {
		engine().audio.setMasterVolume(value);
		storage.setNumber(KEY_VOLUME_MASTER, value);
	}

	/** Background music volume */
	public getBgmVolume() {
		return storage.getNumber(KEY_VOLUME_BGM) ?? 1;
	}
	public setBgmVolume(value: number) {
		engine().audio.bgm.setVolume(value);
		storage.setNumber(KEY_VOLUME_BGM, value);
	}

	/** Sound effects volume */
	public getSfxVolume() {
		return storage.getNumber(KEY_VOLUME_SFX) ?? 1;
	}
	public setSfxVolume(value: number) {
		engine().audio.sfx.setVolume(value);
		storage.setNumber(KEY_VOLUME_SFX, value);
	}
}

/** SHared user settings instance */
export const userSettings = new UserSettings();
