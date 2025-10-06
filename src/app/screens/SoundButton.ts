import { FancyButton } from "@pixi/ui";
import { Assets, Container, ViewContainerOptions } from "pixi.js";
import { userSettings } from "../utils/userSettings";

export class SoundButton extends Container {
	private button: FancyButton;
	constructor(options?: ViewContainerOptions) {
		super(options);
		this.button = new FancyButton({});
		this.position.set(120, 70);
		this.button.onPress.connect(() => {
			this.toggleSound();
		});
		this.updateButton();
		this.addChild(this.button);
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
		// this.button.textView = new Label({
		// 	text: this.isSoundOn() ? "SOUND ON" : "SOUND OFF",
		// 	style: {
		// 		// stroke: {
		// 		// 	width: 3,
		// 		// 	color: "#333",
		// 		// },
		// 		align: "center",
		// 		fontWeight: "bold",
		// 		fontSize: 60,
		// 		fontFamily: "SueEllenFrancisco",
		// 		fill: this.isSoundOn() ? "#DDD" : "#448",
		// 		dropShadow: {
		// 			angle: 90,
		// 			distance: 3,
		// 		},
		// 	},
		// });
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
