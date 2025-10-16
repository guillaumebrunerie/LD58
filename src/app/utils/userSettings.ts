import { storage } from "../../engine/utils/storage";
import { engine } from "../getEngine";

// Keys for saved items in storage
const KEY_VOLUME_MASTER = "volume-master";
const KEY_VOLUME_BGM = "volume-bgm";
const KEY_VOLUME_SFX = "volume-sfx";
const KEY_MAX_LEVEL = "max-level";
const KEY_CURRENT_LEVEL = "current-level";

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

	/** Levels */
	public getMaxLevel() {
		const maxLevel = storage.getNumber(KEY_MAX_LEVEL) ?? 0;
		if (maxLevel < 0) {
			return 0;
		} else {
			return Math.round(maxLevel);
		}
	}
	public getCurrentLevel() {
		const currentLevel = storage.getNumber(KEY_CURRENT_LEVEL) ?? 0;
		const maxLevel = this.getMaxLevel();
		if (currentLevel < 0) {
			return 0;
		} else if (currentLevel > maxLevel) {
			return maxLevel;
		} else {
			return Math.round(currentLevel);
		}
	}
	public setCurrentLevel(value: number) {
		const maxLevel = this.getMaxLevel();
		storage.setNumber(
			KEY_CURRENT_LEVEL,
			Math.min(Math.max(0, Math.round(value)), maxLevel),
		);
	}
	public setLevelAndUnlock(value: number) {
		const newCurrentLevel = Math.max(0, Math.round(value));
		const newMaxLevel = Math.max(this.getMaxLevel(), newCurrentLevel);
		storage.setNumber(KEY_CURRENT_LEVEL, newCurrentLevel);
		storage.setNumber(KEY_MAX_LEVEL, newMaxLevel);
	}
	public resetLevels() {
		storage.reset(KEY_CURRENT_LEVEL);
		storage.reset(KEY_MAX_LEVEL);
	}
}

/** SHared user settings instance */
export const userSettings = new UserSettings();
