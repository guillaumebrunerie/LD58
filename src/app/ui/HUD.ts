import {
	AnimatedSprite,
	Assets,
	Graphics,
	Sprite,
	ViewContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { Game, InsectType } from "../game/Game";

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

export class BlueprintItem extends Container {
	bg: AnimatedSprite;
	icon: Sprite;

	constructor(options: ViewContainerOptions & { type: InsectType }) {
		super(options);
		this.bg = this.addChild(
			new AnimatedSprite({
				textures: Object.values(Assets.get("InventoryLoop").textures),
				autoPlay: true,
				anchor: 0.5,
				animationSpeed: 15 / 60,
			}),
		);
		this.icon = this.addChild(
			new Sprite({
				texture: Assets.get(options.type),
				anchor: 0.5,
			}),
		);
	}

	complete() {
		this.animate<BlueprintItem>(
			this,
			{ alpha: 0.9999 },
			{ duration: 0.5 },
		).then(() => {
			this.bg.destroy();
			this.bg = this.addChild(
				new AnimatedSprite({
					textures: Object.values(
						Assets.get("InventoryEnd").textures,
					),
					anchor: 0.5,
					animationSpeed: 15 / 60,
					loop: false,
				}),
			);
			this.bg.play();
			this.bg.onComplete = () => {
				this.destroy();
			};
			this.animate(this.icon, { alpha: 0 }, { duration: 1 });
		});
	}
}

export class Blueprint extends Container {
	readonly combination: string;
	insectTypes: InsectType[];
	items: BlueprintItem[];
	isComplete = false;

	constructor(options: ViewContainerOptions & { insectTypes: InsectType[] }) {
		super(options);

		options.insectTypes.sort();
		this.insectTypes = options.insectTypes;
		this.combination = this.insectTypes.join("/");

		this.items = this.insectTypes.map((type) =>
			this.addChild(
				new BlueprintItem({
					type,
				}),
			),
		);
		const gap = 105;
		if (this.items.length == 2) {
			this.items[0].x = -gap;
			this.items[1].x = gap;
		} else if (this.items.length == 3) {
			this.items[0].x = -gap;
			this.items[0].y = (gap * Math.sqrt(3)) / 2;
			this.items[1].x = gap;
			this.items[1].y = (gap * Math.sqrt(3)) / 2;
			this.items[2].y = (-gap * Math.sqrt(3)) / 2;
		}
	}

	complete() {
		this.isComplete = true;
		for (const item of this.items) {
			item.complete();
		}
	}
}

export class HUD extends Container {
	game: Game;
	blueprints: Container<Blueprint>;

	constructor(options: { game: Game }) {
		super();
		this.game = options.game;

		this.blueprints = this.addChild(new Container<Blueprint>());
		this.game.wantedConfigurations.forEach((itemTypes) =>
			this.blueprints.addChild(
				new Blueprint({
					insectTypes: itemTypes,
					scale: 0.4,
				}),
			),
		);
	}

	resize(width: number, height: number) {
		if (width < height) {
			// Portrait
			this.blueprints.position.set(0, 1690);

			const gap = 1080 / this.blueprints.children.length;
			this.blueprints.children.forEach((blueprint, i) => {
				blueprint.x = gap * (i + 1 / 2);
				blueprint.y = 0;
			});
		} else {
			// Landscape
			this.blueprints.position.set(1690, 0);
			const gap = 1080 / this.blueprints.children.length;
			this.blueprints.children.forEach((blueprint, i) => {
				blueprint.x = 0;
				blueprint.y = gap * (i + 1 / 2);
			});
		}
	}
}
