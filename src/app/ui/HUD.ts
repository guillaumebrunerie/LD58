import { Graphics } from "pixi.js";
import { Container } from "../../PausableContainer";
import { Game } from "../game/Game";

export class Lifebar extends Container {
	constructor() {
		super();
		// Create lifebar graphics here
		const width = 500;
		const height = 20;
		const bar = this.addChild(
			new Graphics().rect(0, 0, width, height).fill("green"),
		);
		bar.position.set(-width / 2, -height / 2);
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
		// Resize HUD elements here if needed
		this.lifebar.position.set(width / 2, 30);
	}
}
