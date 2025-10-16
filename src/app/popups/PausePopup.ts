import { animate } from "motion";
import { BlurFilter, Container, Graphics, Point } from "pixi.js";

import { engine } from "../getEngine";
import { Label } from "../ui/Label";
import { FancyButton } from "@pixi/ui";
import { Thread } from "../game/Thread";
import { userSettings } from "../utils/userSettings";
import { GameScreen } from "../screens/GameScreen";

/** Popup that shows up when gameplay is paused */
export class PausePopup extends Container {
	constructor() {
		super();

		const width = 800;
		const height = 300;
		const x = 0;
		const y = 0;

		const bg = this.addChild(
			new Graphics()
				.rect(-1920 / 2, -1920 / 2, 1920, 1920)
				.fill("#00000080")
				.rect(x - width / 2, y - height / 2, width, height)
				.cut(),
		);
		bg.cursor = "pointer";
		bg.interactive = true;
		bg.on("pointertap", () => engine().navigation.dismissPopup());

		this.addChild(
			new Graphics()
				.rect(x - width / 2, y - height / 2, width, height)
				.fill("#ffffff40"),
		);

		const a = new Point(x - width / 2, y - height / 2);
		const b = new Point(x + width / 2, y - height / 2);
		const c = new Point(x + width / 2, y + height / 2);
		const d = new Point(x - width / 2, y + height / 2);
		this.addChild(
			new Thread({ from: a, to: b }),
			new Thread({ from: b, to: c }),
			new Thread({ from: c, to: d }),
			new Thread({ from: d, to: a }),
		);

		const resumeButton = this.addChild(
			new FancyButton({
				text: new Label({
					text: `Resume`,
					style: {
						fontFamily: "SueEllenFrancisco",
						fill: "white",
						// stroke: { color: "black", width: 6 },
						fontSize: 70,
					},
				}),
			}),
		);
		resumeButton.y = -75;
		resumeButton.on("pointertap", () => engine().navigation.dismissPopup());

		const resetButton = this.addChild(
			new FancyButton({
				text: new Label({
					text: `Reset all progress`,
					style: {
						fontFamily: "SueEllenFrancisco",
						fill: "red",
						// stroke: { color: "black", width: 6 },
						fontSize: 70,
					},
				}),
			}),
		);
		resetButton.y = 75;
		resetButton.on("pointertap", () => {
			engine().audio.playSound("Click");
			userSettings.resetLevel();
			engine().navigation.dismissPopup();
			engine().navigation.showScreen(GameScreen);
		});
	}

	/** Resize the popup, fired whenever window size changes */
	public resize(width: number, height: number) {
		this.x = width / 2;
		this.y = height / 2;
	}

	/** Present the popup, animated */
	public async show() {
		const currentEngine = engine();
		if (currentEngine.navigation.currentScreen) {
			currentEngine.navigation.currentScreen.filters = [
				new BlurFilter({ strength: 5 }),
			];
		}
		this.alpha = 0;
		await animate<PausePopup>(
			this,
			{ alpha: 1 },
			{ duration: 0.2, ease: "linear" },
		);
	}

	/** Dismiss the popup, animated */
	public async hide() {
		const currentEngine = engine();
		if (currentEngine.navigation.currentScreen) {
			currentEngine.navigation.currentScreen.filters = [];
		}
		await animate<PausePopup>(
			this,
			{ alpha: 0 },
			{ duration: 0.2, ease: "linear" },
		);
	}
}
