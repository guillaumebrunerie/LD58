import { FancyButton } from "@pixi/ui";
import { Assets, Container, ViewContainerOptions } from "pixi.js";
import { engine } from "../getEngine";
import { PausePopup } from "../popups/PausePopup";

export class PauseButton extends Container {
	private button: FancyButton;
	constructor(options?: ViewContainerOptions) {
		super(options);
		this.button = this.addChild(
			new FancyButton({
				defaultView: Assets.get("PauseButton.png"),
			}),
		);
		this.button.anchor.set(0.5);
		this.button.onPress.connect(() => {
			engine().navigation.presentPopup(PausePopup);
			engine().navigation.currentScreen?.pause?.();
		});
	}
}
