import { Container } from "../../PausableContainer";
import { FancyButton } from "@pixi/ui";
import { Label } from "../ui/Label";
import { GameScreen } from "./GameScreen";
import { engine } from "../getEngine";
import { Graphics } from "pixi.js";

export class StartScreen extends Container {
	public static assetBundles = ["main"];

	startButton: FancyButton;

	constructor() {
		super();

		this.addChild(new Graphics().rect(0, 0, 1920, 1920).fill("darkblue"));
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
		this.startButton.position.set(width / 2, height / 2);
	}

	async startGame() {
		await engine().navigation.showScreen(GameScreen);
	}

	async hide() {
		await this.animate(this.startButton, { alpha: 0 }, { duration: 1 });
	}
}
