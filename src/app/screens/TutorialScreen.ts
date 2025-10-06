import { Container } from "../../PausableContainer";
import { Background } from "../game/Background";
import { Assets, Graphics, Sprite, Text, TextStyleOptions } from "pixi.js";
import { engine } from "../getEngine";
import { GameScreen } from "./GameScreen";
import { SoundButton } from "./SoundButton";

const style: TextStyleOptions = {
	fontFamily: "SueEllenFrancisco", //"Amatic SC",
	fill: "white",
	fontSize: 70,
	wordWrap: true,
	wordWrapWidth: 1000,
	align: "center",
};

const instructions = [
	"Click / tap to move the spider",
	"Keep clicking to make the spider web grow",
	"Surround some insects to catch them",
	"Make sure to follow the patterns",
];

export class TutorialScreen extends Container {
	public static assetBundles = ["main"];

	background: Background;
	page: Sprite;
	pageIndex: number = 1;
	text: Text;

	constructor() {
		super();

		this.background = this.addChild(new Background());
		this.page = this.addChild(
			new Sprite({
				texture: Assets.get(`Instruction_Page_0${this.pageIndex}.png`),
				anchor: 0.5,
			}),
		);
		this.text = this.page.addChild(
			new Text({
				text: instructions[this.pageIndex - 1] || "",
				style,
				anchor: { x: 0.5, y: 0 },
				y: 200,
			}),
		);

		const touchArea = this.addChild(
			new Graphics().rect(0, 0, 1920, 1920).fill("#00000001"),
		);
		touchArea.interactive = true;
		touchArea.cursor = "pointer";
		touchArea.on("pointertap", () => this.nextPage());

		this.addChild(new SoundButton());
	}

	nextPage() {
		if (this.pageIndex >= instructions.length) {
			engine().navigation.showScreen(GameScreen);
			return;
		}
		this.pageIndex++;
		this.page.texture = Assets.get(
			`Instruction_Page_0${this.pageIndex}.png`,
		);
		this.text.text = instructions[this.pageIndex - 1] || "";
	}

	resize(width: number, height: number) {
		if (width < height) {
			// Portrait
			this.page.position.set(width / 2, 850);
			this.page.scale.set(1.1);
		} else {
			// Landscape
			this.page.position.set(width / 2, 450);
			this.page.scale.set(1);
		}
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
