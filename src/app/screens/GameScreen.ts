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

export class GameScreen extends Container {
	public static assetBundles = ["main"];

	gameContainer: Container;
	game: Game;
	hud: HUD;
	touchArea: Graphics;

	constructor() {
		super();

		this.gameContainer = this.addChild(new Container());
		this.game = this.gameContainer.addChild(new Game());

		this.touchArea = this.addChild(
			new Graphics().rect(0, 0, 100, 100).fill("#00000001"),
		);
		this.touchArea.interactive = true;
		this.touchArea.on("pointerdown", (e) => this.pointerDown(e));
		this.touchArea.on("pointermove", (e) => this.pointerMove(e));
		this.touchArea.on("pointerup", (e) => this.pointerUp(e));
		this.touchArea.on("wheel", (e) => this.wheel(e));

		this.hud = this.addChild(new HUD({ game: this.game }));
		this.game.hud = this.hud;
	}

	resize(width: number, height: number) {
		this.gameContainer.position.set(width / 2, height / 2);
		this.touchArea.clear().rect(0, 0, width, height).fill("#00000001");
		this.hud.resize(width, height);
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
