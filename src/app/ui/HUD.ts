import {
	AnimatedSprite,
	Assets,
	Sprite,
	Text,
	ViewContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { Game, InsectType } from "../game/Game";
import { getAnimation, getIdleAnimation } from "../utils/animation";
import { FancyButton } from "@pixi/ui";
import { userSettings } from "../utils/userSettings";
import { engine } from "../getEngine";
import { GameScreen } from "../screens/GameScreen";

export class BlueprintItem extends Container {
	bg: AnimatedSprite;
	icon: Sprite;

	constructor(options: ViewContainerOptions & { type: InsectType }) {
		super(options);
		this.bg = this.addChild(
			new AnimatedSprite({
				textures: getIdleAnimation("InventoryLoop"),
				autoPlay: true,
				anchor: 0.5,
				animationSpeed: 15 / 60,
			}),
		);
		this.icon = this.addChild(
			new Sprite({
				texture: Assets.get(`${options.type}.png`),
				anchor: 0.5,
				scale: 0.65,
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
					textures: getAnimation("InventoryEnd"),
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
		// if (this.items.length == 2) {
		// 	this.items[0].x = -gap;
		// 	this.items[1].x = gap;
		// } else if (this.items.length == 3) {
		// 	this.items[0].x = -gap;
		// 	this.items[0].y = (gap * Math.sqrt(3)) / 2;
		// 	this.items[1].x = gap;
		// 	this.items[1].y = (gap * Math.sqrt(3)) / 2;
		// 	this.items[2].y = (-gap * Math.sqrt(3)) / 2;
		// 	// this.items[0].x = -gap * 2;
		// 	// this.items[2].x = gap * 2;
		// } else if (this.items.length == 4) {
		// 	this.items[0].x = -gap * 3;
		// 	this.items[1].x = -gap;
		// 	this.items[2].x = gap;
		// 	this.items[3].x = gap * 3;
		// } else if (this.items.length == 5) {
		// 	const newGap = gap * 0.85;
		// 	this.items[0].x = -newGap * 4;
		// 	this.items[1].x = -newGap * 2;
		// 	this.items[3].x = newGap * 2;
		// 	this.items[4].x = newGap * 4;
		// 	for (const item of this.items) {
		// 		item.scale.set(0.85);
		// 	}
		// }
	}

	resize(uimode: "portrait" | "landscape") {
		let scale = 1;
		if (uimode == "landscape") {
			this.items.forEach((item, i) => {
				scale = this.items.length <= 4 ? 1 : 0.85;
				const gap = 45 * scale;
				item.position.set(
					-gap * (this.items.length - 1) + i * gap * 2,
					0,
				);
			});
		} else {
			switch (this.items.length) {
				case 1: {
					this.items[0].position.set(0, 0);
					break;
				}
				case 2: {
					const gap = 45;
					this.items[0].position.set(-gap, 0);
					this.items[1].position.set(gap, 0);
					break;
				}
				case 3: {
					const gap = 45;
					this.items[0].position.set(-gap, (gap * Math.sqrt(3)) / 2);
					this.items[1].position.set(0, (-gap * Math.sqrt(3)) / 2);
					this.items[2].position.set(gap, (gap * Math.sqrt(3)) / 2);
					break;
				}
				case 4: {
					const gap = 45;
					this.items[0].position.set(-gap, -gap);
					this.items[1].position.set(-gap, gap);
					this.items[2].position.set(gap, -gap);
					this.items[3].position.set(gap, gap);
					break;
				}
				case 5: {
					scale = 0.85;
					const gap = 45 * scale * Math.sqrt(2);
					this.items[0].position.set(0, 0);
					this.items[1].position.set(-gap, -gap);
					this.items[2].position.set(-gap, gap);
					this.items[3].position.set(gap, -gap);
					this.items[4].position.set(gap, gap);
					break;
				}
			}
			// item.x = 0;
			// item.y = -gap * (this.items.length - 1) + i * gap * 2;
		}
		this.items.forEach((item) => {
			item.scale.set(scale);
		});
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
	levelText: Text;
	resetButton: FancyButton;
	restartButton: FancyButton;

	constructor(options: { game: Game; level: number }) {
		super();
		this.game = options.game;

		this.blueprints = this.addChild(new Container<Blueprint>());
		this.game.wantedConfigurations.forEach((itemTypes) =>
			this.blueprints.addChild(
				new Blueprint({
					insectTypes: itemTypes,
				}),
			),
		);

		this.levelText = this.addChild(
			new Text({
				text: `Level ${options.level + 1}`,
				x: 0,
				y: -500,
				anchor: 0.5,
				style: {
					fontFamily: "SueEllenFrancisco",
					fill: "white",
					fontSize: 100,
				},
			}),
		);

		this.restartButton = this.addChild(
			new FancyButton({
				text: new Text({
					text: `Restart`,
					style: {
						fontFamily: "SueEllenFrancisco",
						fill: "white",
						fontSize: 100,
					},
				}),
			}),
		);
		this.restartButton.on("pointertap", () => {
			engine().audio.playSound("Click");
			engine().navigation.showScreen(GameScreen);
		});

		this.resetButton = this.addChild(
			new FancyButton({
				text: new Text({
					text: `Reset`,
					style: {
						fontFamily: "SueEllenFrancisco",
						fill: "red",
						fontSize: 50,
						fontWeight: "bold",
					},
				}),
			}),
		);
		this.resetButton.on("pointertap", () => {
			engine().audio.playSound("Click");
			userSettings.resetLevel();
			engine().navigation.showScreen(GameScreen);
		});
	}

	resize(width: number, height: number) {
		if (width < height) {
			// Portrait
			this.blueprints.position.set(0, 1690);

			const gap = 1080 / this.blueprints.children.length;
			this.blueprints.children.forEach((blueprint, i) => {
				blueprint.x = gap * (i + 1 / 2);
				blueprint.y = 0; //i % 2 == 0 ? -75 : 75;
				blueprint.resize("portrait");
			});

			this.levelText.position.set(250, 300);

			this.resetButton.position.set(width / 4, 50);
			this.resetButton.visible = false;

			this.restartButton.position.set(1080 - 250, 300);
		} else {
			// Landscape
			this.blueprints.position.set(1690, 0);
			const gap = 1080 / (this.blueprints.children.length + 1);
			this.blueprints.children.forEach((blueprint, i) => {
				blueprint.x = 0;
				blueprint.y = gap * (i + 1);
				blueprint.resize("landscape");
			});

			this.levelText.position.set(200, 400);

			this.resetButton.position.set(200, height - 200);
			this.resetButton.visible = false;

			this.restartButton.position.set(200, height - 300);
		}
	}
}
