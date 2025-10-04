import { Graphics, Point } from "pixi.js";
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
		this.touchArea.on("pointerdown", (e) =>
			this.pointerDown(e.getLocalPosition(this.touchArea)),
		);
		this.touchArea.on("pointermove", (e) => {
			this.pointerMove(e.getLocalPosition(this.touchArea));
		});
		this.touchArea.on("pointerup", () => this.pointerUp());

		this.hud = this.addChild(new HUD({ game: this.game }));
	}

	resize(width: number, height: number) {
		this.gameContainer.position.set(width / 2, height / 2);
		this.touchArea.clear().rect(0, 0, width, height).fill("#00000001");
		this.hud.resize(width, height);
	}

	pointerPosition?: Point;
	downTime = 0;
	pointerDown(position: Point) {
		this.pointerPosition = position;
		this.downTime = Date.now();
	}
	pointerMove(newPosition: Point) {
		if (this.pointerPosition) {
			this.game.position = this.game.position.add(
				newPosition.subtract(this.pointerPosition),
			);
			this.pointerPosition = newPosition;
		}
	}
	pointerUp() {
		const tapDelay = 200;
		if (this.pointerPosition && Date.now() - this.downTime < tapDelay) {
			this.game.click(
				this.pointerPosition
					?.subtract(this.gameContainer.position)
					.subtract(this.game.position),
			);
		}
		this.pointerPosition = undefined;
		this.downTime = 0;
	}
}
