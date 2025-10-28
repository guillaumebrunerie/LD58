import {
	AnimatedSprite,
	Assets,
	Graphics,
	Sprite,
	Text,
	ViewContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { Game, InsectType } from "../game/Game";
import { getAnimation, getIdleAnimation } from "../utils/animation";
import { FancyButton } from "@pixi/ui";
import { engine } from "../getEngine";
import { GameScreen } from "../screens/GameScreen";
import { userSettings } from "../utils/userSettings";
import { levels } from "../game/levels";
import { Label } from "./Label";

export class BlueprintItem extends Container {
	type: InsectType;
	bg: AnimatedSprite;
	icon: Sprite;
	isComplete = false;

	constructor(options: ViewContainerOptions & { type: InsectType }) {
		super(options);
		this.type = options.type;
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
				texture: Assets.get(`${this.type}.png`),
				anchor: 0.5,
				scale: 0.65,
			}),
		);
	}

	complete() {
		this.isComplete = true;
		this.animate<BlueprintItem>(
			this,
			{ alpha: 0.9999 },
			{ duration: 0.0005 },
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

	cross: Graphics | null = null;
	crossOut(crossOut: boolean) {
		if (this.isComplete) {
			return;
		}
		if (!crossOut) {
			this.cross?.destroy();
			this.cross = null;
			return;
		}
		if (!this.cross) {
			const d = 40;
			this.cross = this.addChild(
				new Graphics()
					.moveTo(-d, -d)
					.lineTo(d, d)
					.moveTo(-d, d)
					.lineTo(d, -d)
					.stroke({
						color: "#DD0000",
						cap: "round",
						width: 10,
					}),
			);
			this.cross.alpha = 0;
			this.animate(this.cross, { alpha: 1 }, { duration: 0.5 });
		}
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
				item.position?.set(
					-gap * (this.items.length - 1) + i * gap * 2,
					0,
				);
			});
		} else {
			switch (this.items.length) {
				case 1: {
					this.items[0].position?.set(0, 0);
					break;
				}
				case 2: {
					const gap = 45;
					this.items[0].position?.set(-gap, 0);
					this.items[1].position?.set(gap, 0);
					break;
				}
				case 3: {
					const gap = 45;
					this.items[0].position?.set(-gap, (gap * Math.sqrt(3)) / 2);
					this.items[1].position?.set(0, (-gap * Math.sqrt(3)) / 2);
					this.items[2].position?.set(gap, (gap * Math.sqrt(3)) / 2);
					break;
				}
				case 4: {
					const gap = 45;
					this.items[0].position?.set(-gap, -gap);
					this.items[1].position?.set(-gap, gap);
					this.items[2].position?.set(gap, -gap);
					this.items[3].position?.set(gap, gap);
					break;
				}
				case 5: {
					scale = 0.85;
					const gap = 45 * scale * Math.sqrt(2);
					this.items[0].position?.set(0, 0);
					this.items[1].position?.set(-gap, -gap);
					this.items[2].position?.set(-gap, gap);
					this.items[3].position?.set(gap, -gap);
					this.items[4].position?.set(gap, gap);
					break;
				}
			}
			// item.x = 0;
			// item.y = -gap * (this.items.length - 1) + i * gap * 2;
		}
		this.items.forEach((item) => {
			item.scale?.set(scale);
		});
	}

	complete() {
		this.isComplete = true;
		for (const item of this.items) {
			item.complete();
		}
	}

	crossOutType(type: InsectType, crossOut: boolean) {
		for (const item of this.items) {
			if (item.type == type) {
				item.crossOut(crossOut);
			}
		}
	}
}

export class HUD extends Container {
	game: Game;
	blueprints: Container<Blueprint>;
	levelTextContainer: Container;
	restartButtonContainer: Container;

	constructor(options: { game: Game; level: number; maxLevel: number }) {
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

		this.levelTextContainer = this.addChild(new Container());
		this.levelTextContainer.addChild(
			new Text({
				text: `Level ${options.level + 1} / ${levels.length}`,
				anchor: 0.5,
				style: {
					fontFamily: "SueEllenFrancisco",
					fill: "white",
					fontSize: 70,
				},
			}),
		);

		const previousLevelButton = this.levelTextContainer.addChild(
			new FancyButton({
				defaultView: Assets.get("PreviousLevelButton.png"),
				anchor: 0.5,
			}),
		);
		if (options.level == 0) {
			previousLevelButton.enabled = false;
			previousLevelButton.alpha = 0.5;
		}
		previousLevelButton.x = -60;
		previousLevelButton.y = 100;
		previousLevelButton.on("pointertap", () => {
			engine().audio.playSound("Click");
			if (options.level > 0) {
				userSettings.setCurrentLevel(options.level - 1);
				engine().navigation.showScreen(GameScreen, { instant: true });
			}
		});

		const nextLevelButton = this.levelTextContainer.addChild(
			new FancyButton({
				defaultView: Assets.get("NextLevelButton.png"),
				anchor: 0.5,
			}),
		);
		if (options.level == options.maxLevel) {
			nextLevelButton.enabled = false;
			nextLevelButton.alpha = 0.5;
		}
		nextLevelButton.x = 60;
		nextLevelButton.y = 100;
		nextLevelButton.on("pointertap", () => {
			engine().audio.playSound("Click");
			if (options.level < options.maxLevel) {
				userSettings.setCurrentLevel(options.level + 1);
				engine().navigation.showScreen(GameScreen, { instant: true });
			}
		});

		this.restartButtonContainer = this.addChild(new Container());
		const restartButton = this.restartButtonContainer.addChild(
			new FancyButton({
				defaultView: Assets.get("RestartButton.png"),
				anchor: 0.5,
			}),
		);
		restartButton.on("pointertap", () => {
			engine().audio.playSound("Click");
			engine().navigation.showScreen(GameScreen);
		});
		const restartText = this.restartButtonContainer.addChild(
			new FancyButton({
				text: new Label({
					y: 120,
					text: `Restart`,
					style: {
						fontFamily: "SueEllenFrancisco",
						fill: "white",
						// stroke: { color: "black", width: 6 },
						fontSize: 70,
					},
				}),
			}),
		);
		restartText.on("pointertap", () => {
			engine().audio.playSound("Click");
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
				blueprint.y = 0;
				blueprint.resize("portrait");
			});

			this.levelTextContainer.position.set(250, 250);

			this.restartButtonContainer.position.set(1080 - 250, 250);
		} else {
			// Landscape
			this.blueprints.position.set(1690, 0);
			const gap = 1080 / (this.blueprints.children.length + 1);
			this.blueprints.children.forEach((blueprint, i) => {
				blueprint.x = 0;
				blueprint.y = gap * (i + 1);
				blueprint.resize("landscape");
			});

			this.levelTextContainer.position.set(230, 300);

			this.restartButtonContainer.position.set(230, height - 350);
		}
	}

	crossOutType(type: InsectType, crossOut = true) {
		for (const blueprint of this.blueprints.children) {
			blueprint.crossOutType(type, crossOut);
		}
	}
}
