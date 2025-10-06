import {
	FederatedPointerEvent,
	FederatedWheelEvent,
	Graphics,
	Point,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { Game } from "../game/Game";
import { HUD } from "../ui/HUD";
import { clamp } from "../../engine/utils/maths";
import { Thread } from "../game/Thread";
import { levels } from "../game/levels";
import { FancyButton } from "@pixi/ui";
import { Label } from "../ui/Label";
import { userSettings } from "../utils/userSettings";
import { engine } from "../getEngine";
import { SoundButton } from "./SoundButton";
export class GameScreen extends Container {
	public static assetBundles = ["main"];

	gameContainer: Container;
	game: Game;
	hud: HUD;
	touchArea: Graphics;
	level: number = Math.min(userSettings.getLevel(), levels.length - 1);
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
		this.touchArea.on("pointermove", (e) => this.pointerMove(e));
		this.touchArea.on("pointerup", (e) => this.pointerUp(e));
		this.touchArea.on("pointerupoutside", (e) => this.pointerUp(e));
		this.touchArea.on("wheel", (e) => this.wheel(e));

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
			new HUD({ game: this.game, level: this.level }),
		);
		this.game.hud = this.hud;

		this.soundButton = this.addChild(new SoundButton());
	}

	async show() {
		// Move player away
		const playerY = this.game.player.y;
		this.game.player.y -= this.isLandscape ? 600 : 1000;

		// Fade from black
		const rectangle = this.addChild(
			new Graphics().rect(0, 0, 1920, 1920).fill("black"),
		);
		await this.animate(rectangle, { alpha: 0 }, { duration: 0.5 });
		rectangle.destroy();

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
		await this.animate(this.game.player, { y: playerY }, options);
		this.game.start();
		thread.destroy();
	}

	async hide() {
		// Fade to black
		const rectangle = this.addChild(
			new Graphics().rect(0, 0, 1920, 1920).fill("black"),
		);
		rectangle.alpha = 0;
		await this.animate(rectangle, { alpha: 1 }, { duration: 0.5 });
		rectangle.destroy();
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
	win() {
		setTimeout(() => {
			engine().audio.playSound("CompleteLevel");
			this.nextLevelButton = this.addChild(
				new FancyButton({
					text: new Label({
						text: `Next Level`,
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
			this.nextLevelButton.on("pointertap", () => {
				this.nextLevelButton?.destroy();
				this.nextLevel();
				engine().audio.playSound("Click");
			});
		}, 1000);
	}

	nextLevel() {
		userSettings.setLevel(this.level + 1);
		engine().navigation.showScreen(GameScreen);
	}

	pointers: {
		[id: string]: {
			position: Point;
			initialPosition: Point;
			downTime: number;
		};
	} = {};

	pointerDown(event: FederatedPointerEvent) {
		const position = event.getLocalPosition(this.touchArea);
		this.pointers[event.pointerId] = {
			position,
			initialPosition: position,
			downTime: Date.now(),
		};
	}

	pointerMove(event: FederatedPointerEvent) {
		return;
		const pointerData = this.pointers[event.pointerId];
		if (!pointerData) {
			return;
		}

		const oldPosition = pointerData.position;
		const newPosition = event.getLocalPosition(this.touchArea);
		pointerData.position = newPosition;
		const pointerIds = Object.keys(this.pointers);
		if (pointerIds.length == 2) {
			const otherPointerId = pointerIds.find(
				(id) => id != `${event.pointerId}`,
			);
			const otherPointerData = this.pointers[otherPointerId!];
			const otherPosition = otherPointerData.position;
			const previousVector = otherPosition.subtract(oldPosition);
			const previousDistance = previousVector.magnitude();
			const previousAngle = Math.atan2(
				previousVector.y,
				previousVector.x,
			);
			const newVector = otherPosition.subtract(newPosition);
			const newDistance = newVector.magnitude();
			const newAngle = Math.atan2(newVector.y, newVector.x);
			const scaleFactor = newDistance / previousDistance;
			const otherPositionL = this.game.toLocal(
				otherPosition,
				this.touchArea,
			);
			this.multiplyScale(scaleFactor);
			this.game.rotation =
				this.game.rotation + (newAngle - previousAngle);
			const otherPositionL2 = this.game.toLocal(
				otherPosition,
				this.touchArea,
			);
			const delta2 = this.gameContainer
				.toLocal(otherPositionL2, this.game)
				.subtract(
					this.gameContainer.toLocal(otherPositionL, this.game),
				);
			this.game.position = this.game.position.add(delta2);
		} else {
			this.game.position = this.game.position.add(
				newPosition.subtract(oldPosition),
			);
		}
	}

	multiplyScale(factor: number) {
		const newScale = clamp(this.game.scale.x * factor, 1, 3);
		this.game.scale.set(newScale);
	}

	pointerUp(event: FederatedPointerEvent) {
		const pointerData = this.pointers[event.pointerId];
		if (!pointerData) {
			return;
		}

		const tapDelay = 300;
		const posThreshold = 50;
		const deltaT = Date.now() - pointerData.downTime;
		const deltaPos = pointerData
			.position!.subtract(pointerData.initialPosition!)
			.magnitude();
		if (
			Object.keys(this.pointers).length === 1 &&
			pointerData.position &&
			deltaT < tapDelay &&
			deltaPos < posThreshold
		) {
			this.game.click(event.getLocalPosition(this.game));
		}

		delete this.pointers[event.pointerId];
	}

	wheel(event: FederatedWheelEvent) {
		// const position = event.getLocalPosition(this.touchArea);
		// const otherPositionL = this.game.toLocal(position, this.touchArea);
		// this.multiplyScale(1 - event.deltaY * 0.001);
		// const otherPositionL2 = this.game.toLocal(position, this.touchArea);
		// const delta2 = this.gameContainer
		// 	.toLocal(otherPositionL2, this.game)
		// 	.subtract(this.gameContainer.toLocal(otherPositionL, this.game));
		// this.game.position = this.game.position.add(delta2);
	}
}
