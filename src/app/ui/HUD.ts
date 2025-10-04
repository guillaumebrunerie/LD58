import { Graphics, ViewContainerOptions } from "pixi.js";
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

type InventoryItemType = "empty" | "battery";

export class InventoryItem extends Container {
	constructor(options?: ViewContainerOptions & { type: InventoryItemType }) {
		super(options);
		if (options?.type === "battery") {
			this.addChild(new Graphics().rect(-20, -20, 40, 40).fill("white"));
		}
	}
}

export class Inventory extends Container {
	items: InventoryItem[];
	constructor(options?: ViewContainerOptions) {
		super(options);

		const background = this.addChild(
			new Graphics().rect(0, 0, 600, 200).fill("blue"),
		);
		background.position.set(-300, -100);

		this.items = [
			this.addChild(new InventoryItem({ x: -250, type: "battery" })),
			this.addChild(new InventoryItem({ x: 0, type: "battery" })),
			this.addChild(new InventoryItem({ x: 250, type: "battery" })),
		];
	}
}

export class HUD extends Container {
	game: Game;
	lifebar: Lifebar;
	inventory: Inventory;

	constructor(options: { game: Game }) {
		super();
		this.game = options.game;
		this.lifebar = this.addChild(new Lifebar());
		this.inventory = this.addChild(new Inventory());
	}

	resize(width: number, height: number) {
		this.lifebar.position.set(width / 2, 30);
		this.inventory.position.set(width / 2, height - 150);
	}

	updateLife(amount: number) {
		this.lifebar.updateLife(amount);
	}
}
