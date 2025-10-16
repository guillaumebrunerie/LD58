import { FancyButton } from "@pixi/ui";
import { Assets, Container, ViewContainerOptions } from "pixi.js";
import { userSettings } from "../utils/userSettings";

export class SoundButton extends Container {
	private button: FancyButton;
	constructor(options?: ViewContainerOptions) {
		super(options);
		this.button = new FancyButton({});
		this.button.onPress.connect(() => {
			this.toggleSound();
		});
		this.updateButton();
		this.addChild(this.button);
	}

	resize(width: number, _height: number) {
		this.position.set(width - 60, 70);
	}

	isSoundOn() {
		return userSettings.getMasterVolume() > 0.5;
	}

	updateButton() {
		this.button.anchor.set(0.5);
		this.button.defaultView =
			this.isSoundOn() ?
				Assets.get("SoundOnButton.png")
			:	Assets.get("SoundOffButton.png");
	}

	prepare() {}

	toggleSound() {
		if (this.isSoundOn()) {
			userSettings.setMasterVolume(0);
		} else {
			userSettings.setMasterVolume(1);
		}
		this.updateButton();
	}
}
