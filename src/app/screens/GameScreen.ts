import { FederatedPointerEvent, Graphics, Point } from "pixi.js";
import { Container } from "../../PausableContainer";
import { Game } from "../game/Game";
import { HUD } from "../ui/HUD";
import { Thread } from "../game/Thread";
import { levels } from "../game/levels";
import { FancyButton } from "@pixi/ui";
import { Label } from "../ui/Label";
import { userSettings } from "../utils/userSettings";
import { engine } from "../getEngine";
import { SoundButton } from "./SoundButton";
import { PauseButton } from "./PauseButton";
import { PausePopup } from "../popups/PausePopup";

export class GameScreen extends Container {
	public static assetBundles = ["main"];

	gameContainer: Container;
	game: Game;
	hud: HUD;
	touchArea: Graphics;
	level: number = userSettings.getCurrentLevel();
	maxLevel: number = userSettings.getMaxLevel();
	pauseButton: PauseButton;
	soundButton: SoundButton;

	constructor() {
		super();

		this.gameContainer = this.addChild(new Container());
		this.game = this.gameContainer.addChild(
			new Game({ level: levels[this.level] }),
		);

		this.touchArea = this.addChild(
			new Graphics().rect(0, 0, 100, 100).fill("#00000001"),
		);
		this.touchArea.interactive = true;
		this.touchArea.on("pointerdown", (e) => this.pointerDown(e));

		this.gameContainer.addChild(
			new Graphics({ alpha: 0.3 })
				.rect(-1000, -1000, 2000, 2000)
				.fill("black")
				.rect(-500, -500, 1000, 1000)
				.cut(),
		);
		const a = new Point(-500, -500);
		const b = new Point(+500, -500);
		const c = new Point(+500, 500);
		const d = new Point(-500, 500);
		this.gameContainer.addChild(
			new Thread({ from: a, to: b }),
			new Thread({ from: b, to: c }),
			new Thread({ from: c, to: d }),
			new Thread({ from: d, to: a }),
		);

		this.hud = this.addChild(
			new HUD({
				game: this.game,
				level: this.level,
				maxLevel: this.maxLevel,
			}),
		);
		this.game.hud = this.hud;

		this.pauseButton = this.addChild(
			new PauseButton({
				x: 60,
				y: 60,
			}),
		);
		this.soundButton = this.addChild(new SoundButton());
	}

	async show({ instant = false } = {}) {
		// Move player away
		const playerY = this.game.player.y;
		this.game.player.y -= this.isLandscape ? 600 : 1000;

		if (!instant) {
			// Fade from black
			const rectangle = this.addChild(
				new Graphics().rect(0, 0, 1920, 1920).fill("black"),
			);
			await this.animate(rectangle, { alpha: 0 }, { duration: 0.5 });
			rectangle.destroy();
		}

		// Play sound
		setTimeout(() => {
			engine().audio.playSound("WebStart");
		}, 500);

		// Add thread
		const thread = this.game.threads.addChild(
			new Thread({
				from: this.game.player.position.clone(),
				to: this.game.player.position.clone(),
			}),
		);

		// Move player and thread back
		const options = {
			delay: 0.5,
			duration: this.isLandscape ? 0.6 : 1,
			type: "spring",
			bounce: 0.5,
		} as const;
		this.animate(thread, { to_y_redraw: playerY }, options);
		this.animate(this.game.player, { y: playerY }, options).then(() => {
			this.game.start();
			thread.destroy();
		});
	}

	async hide({ instant = false } = {}) {
		if (!instant) {
			// Fade to black
			const rectangle = this.addChild(
				new Graphics().rect(0, 0, 1920, 1920).fill("black"),
			);
			rectangle.alpha = 0;
			await this.animate(rectangle, { alpha: 1 }, { duration: 0.5 });
			rectangle.destroy();
		}
	}

	blur() {
		if (!engine().navigation.currentPopup) {
			engine().navigation.presentPopup(PausePopup);
		}
	}

	isLandscape = true;
	resize(width: number, height: number) {
		this.gameContainer.position.set(width / 2, height / 2);
		this.touchArea.clear().rect(0, 0, width, height).fill("#00000001");
		this.hud.resize(width, height);
		this.isLandscape = width > height;
		this.soundButton.resize(width, height);
		this.positionNextLevelButton();
	}

	positionNextLevelButton() {
		if (this.nextLevelButton) {
			if (this.isLandscape) {
				this.nextLevelButton.position.set(1690, 1080 / 2);
			} else {
				this.nextLevelButton.position.set(1080 / 2, 1690);
			}
		}
	}

	nextLevelButton?: FancyButton;
	hasWon = false;
	win() {
		if (this.hasWon) {
			return;
		}
		this.hasWon = true;
		setTimeout(() => {
			const isLastLevel = this.level == levels.length - 1;
			engine().audio.playSound("CompleteLevel");
			this.nextLevelButton = this.addChild(
				new FancyButton({
					text: new Label({
						text: isLastLevel ? "Congratulations!" : `Next Level`,
						style: {
							fontFamily: "SueEllenFrancisco",
							fill: "white",
							// stroke: { color: "black", width: 6 },
							fontSize: 70,
						},
					}),
				}),
			);
			this.positionNextLevelButton();
			if (isLastLevel) {
				this.nextLevelButton.enabled = false;
			} else {
				this.nextLevelButton.on("pointertap", () => {
					this.nextLevelButton?.destroy();
					this.nextLevel();
					engine().audio.playSound("Click");
				});
			}
		}, 1000);
	}

	nextLevel() {
		userSettings.setLevelAndUnlock(this.level + 1);
		engine().navigation.showScreen(GameScreen);
	}

	pointerDown(event: FederatedPointerEvent) {
		this.game.click(event.getLocalPosition(this.game));
	}
}
