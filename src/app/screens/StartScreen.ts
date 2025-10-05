import { Container } from "../../PausableContainer";
import { FancyButton } from "@pixi/ui";
import { Label } from "../ui/Label";
import { GameScreen } from "./GameScreen";
import { engine } from "../getEngine";

export class StartScreen extends Container {
	public static assetBundles = ["main"];

	startButton: FancyButton;

	constructor() {
		super();

		this.startButton = this.addChild(
			new FancyButton({
				text: new Label({
					text: "Start game",
					style: {
						fontFamily: "Amatic SC",
						fill: "white",
						fontSize: 100,
						// fontWeight: "bold",
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
}
