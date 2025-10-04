import { FederatedPointerEvent, Graphics, Point } from "pixi.js";
import { Container } from "../../PausableContainer";
import { Game } from "../game/Game";
import { HUD } from "../ui/HUD";

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

		this.hud = this.addChild(new HUD({ game: this.game }));
		this.game.hud = this.hud;
	}

	resize(width: number, height: number) {
		this.gameContainer.position.set(width / 2, height / 2);
		this.touchArea.clear().rect(0, 0, width, height).fill("#00000001");
		this.hud.resize(width, height);
	}

	pointers: {
		[id: number]: {
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
		// if (Object.keys(this.pointers).length == 2) {

		const pointerData = this.pointers[event.pointerId];
		if (pointerData) {
			const newPosition = event.getLocalPosition(this.touchArea);
			this.game.position = this.game.position.add(
				newPosition.subtract(pointerData.position),
			);
			pointerData.position = newPosition;
		}
	}

	pointerUp(event: FederatedPointerEvent) {
		const pointerData = this.pointers[event.pointerId];

		const tapDelay = 300;
		const posThreshold = 10;
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
			this.game.click(
				pointerData.position
					?.subtract(this.gameContainer.position)
					.subtract(this.game.position),
			);
		}

		delete this.pointers[event.pointerId];
	}
}
