import { Assets, Graphics, Sprite, ViewContainerOptions } from "pixi.js";
import { Container } from "../../PausableContainer";
import { Game } from "../game/Game";

export class Lifebar extends Container {
	background: Sprite;
	life: Sprite;
	barMask: Graphics;

	fullWidth = 500;
	fullHeight = 20;

	constructor() {
		super();

		this.background = this.addChild(
			new Sprite({
				texture: Assets.get("EnergyBarBack.png"),
				anchor: 0.5,
			}),
		);

		this.life = this.addChild(
			new Sprite({
				texture: Assets.get("EnergyBar.png"),
				anchor: 0.5,
			}),
		);
		this.barMask = this.addChild(
			new Graphics()
				.rect(
					-this.life.width / 2,
					-this.life.height / 2,
					this.life.width,
					this.life.height,
				)
				.fill("white"),
		);
		this.life.mask = this.barMask;

		// this.background = this.addChild(
		// 	new Graphics()
		// 		.rect(0, 0, this.fullWidth, this.fullHeight)
		// 		.fill("red"),
		// );
		// this.background.position.set(-this.fullWidth / 2, -this.fullHeight / 2);

		// this.life = this.addChild(
		// 	new Graphics()
		// 		.rect(0, 0, this.fullWidth, this.fullHeight)
		// 		.fill("green"),
		// );
		// this.life.position.set(-this.fullWidth / 2, -this.fullHeight / 2);
	}

	updateLife(amount: number) {
		this.barMask
			.clear()
			.rect(
				-this.life.width / 2,
				-this.life.height / 2,
				this.life.width * amount,
				this.life.height,
			)
			.fill("white");
	}
}

type InventoryItemType = string;

export class InventoryItem extends Container {
	constructor(options: ViewContainerOptions & { type: InventoryItemType }) {
		super(options);
		this.addChild(
			new Sprite({ texture: Assets.get("Inventory.png"), anchor: 0.5 }),
		);
		this.addChild(
			new Sprite({
				texture: Assets.get(options.type),
				anchor: 0.5,
			}),
		);
	}
}

export class Inventory extends Container {
	items: InventoryItem[];
	constructor(options?: ViewContainerOptions) {
		super(options);

		const gap = 115;
		this.items = [
			this.addChild(new InventoryItem({ x: -gap, type: "Fly_05.png" })),
			this.addChild(
				new InventoryItem({
					x: 0,
					y: -(gap * Math.sqrt(3)),
					type: "Fly_02.png",
				}),
			),
			this.addChild(new InventoryItem({ x: gap, type: "Fly_04.png" })),
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
		this.inventory = this.addChild(new Inventory({ scale: 0.75 }));
	}

	resize(width: number, height: number) {
		this.lifebar.position.set(width / 2, 80);
		this.inventory.position.set(width / 2, height - 100);
	}

	updateLife(amount: number) {
		this.lifebar.updateLife(amount);
	}
}
