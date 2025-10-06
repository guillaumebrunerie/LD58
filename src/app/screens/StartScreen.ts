import { Container } from "../../PausableContainer";
import { FancyButton } from "@pixi/ui";
import { Label } from "../ui/Label";
import { GameScreen } from "./GameScreen";
import { engine } from "../getEngine";
import { Background } from "../game/Background";
import { Assets, Graphics, Sprite } from "pixi.js";

export class StartScreen extends Container {
	public static assetBundles = ["main"];

	background: Background;
	logo: Sprite;
	startButton: FancyButton;

	constructor() {
		super();

		this.background = this.addChild(new Background());
		this.logo = this.addChild(
			new Sprite({
				texture: Assets.get("Logo.png"),
				anchor: 0.5,
			}),
		);
		this.startButton = this.addChild(
			new FancyButton({
				text: new Label({
					text: "Start game",
					style: {
						fontFamily: "Amatic SC",
						fill: "white",
						fontSize: 100,
					},
				}),
			}),
		);
		this.startButton.on("pointertap", () => this.startGame());
	}

	resize(width: number, height: number) {
		this.startButton.position.set(width / 2, (2 * height) / 3);
		this.logo.position.set(width / 2, height / 3);
		this.background.position.set(width / 2, height / 2);
	}

	async startGame() {
		engine().audio.playMusic("Music", { volume: 0.3 });
		engine().audio.playSound("Click");
		await engine().navigation.showScreen(GameScreen);
	}

	async hide() {
		const rectangle = this.addChild(
			new Graphics().rect(0, 0, 1920, 1920).fill("black"),
		);
		rectangle.alpha = 0;
		await this.animate(rectangle, { alpha: 1 }, { duration: 0.5 });
		rectangle.destroy();
	}
}
