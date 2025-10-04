import { Graphics } from "pixi.js";
import { Container } from "../../PausableContainer";
import { Game } from "../game/Game";

export class Lifebar extends Container {
	background: Graphics;
	life: Graphics;

	fullWidth = 500;
	fullHeight = 20;

	constructor() {
		super();
		this.background = this.addChild(
			new Graphics()
				.rect(0, 0, this.fullWidth, this.fullHeight)
				.fill("red"),
		);
		this.background.position.set(-this.fullWidth / 2, -this.fullHeight / 2);

		this.life = this.addChild(
			new Graphics()
				.rect(0, 0, this.fullWidth, this.fullHeight)
				.fill("green"),
		);
		this.life.position.set(-this.fullWidth / 2, -this.fullHeight / 2);
	}

	updateLife(amount: number) {
		this.life
			.clear()
			.rect(0, 0, amount * this.fullWidth, this.fullHeight)
			.fill("green");
	}
}

export class HUD extends Container {
	game: Game;
	lifebar: Lifebar;

	constructor(options: { game: Game }) {
		super();
		this.game = options.game;
		this.lifebar = this.addChild(new Lifebar());
	}

	resize(width: number, height: number) {
		this.lifebar.position.set(width / 2, 30);
	}

	updateLife(amount: number) {
		this.lifebar.updateLife(amount);
	}
}
