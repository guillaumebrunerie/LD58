import { Assets, Graphics, Sprite, ViewContainerOptions } from "pixi.js";
import { Container } from "../../PausableContainer";
import { Game, ItemType } from "../game/Game";

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
	itemTypes: ItemType[];
	items: InventoryItem[];
	constructor(options: ViewContainerOptions & { itemTypes: ItemType[] }) {
		super(options);

		this.itemTypes = options.itemTypes;

		this.items = this.itemTypes.map((type) =>
			this.addChild(
				new InventoryItem({
					type: `Fly_0${type}.png`,
				}),
			),
		);
		const gap = 115;
		if (this.items.length == 2) {
			this.items[0].x = -gap;
			this.items[1].x = gap;
		} else if (this.items.length == 3) {
			this.items[0].x = -gap;
			this.items[1].x = gap;
			this.items[2].y = -gap * Math.sqrt(3);
		}
	}
}

export class HUD extends Container {
	game: Game;
	// lifebar: Lifebar;
	inventories: Container<Inventory>;

	constructor(options: { game: Game }) {
		super();
		this.game = options.game;
		// this.lifebar = this.addChild(new Lifebar());

		this.inventories = this.addChild(new Container<Inventory>());
		this.game.wantedConfigurations.forEach((itemTypes) =>
			this.inventories.addChild(
				new Inventory({
					itemTypes,
					scale: 0.4,
				}),
			),
		);
	}

	resize(width: number, height: number) {
		// this.lifebar.position.set(width / 2, 80);
		this.inventories.position.set(0, height - 100);

		const gap = width / (this.inventories.children.length + 1);
		this.inventories.children.forEach((inventory, i) => {
			inventory.x = gap * (i + 1);
		});
	}

	// updateLife(amount: number) {
	// 	this.lifebar.updateLife(amount);
	// }
}
