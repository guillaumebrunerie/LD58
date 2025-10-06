import { Container } from "../../PausableContainer";
import { Background } from "../game/Background";
import { Assets, Graphics, Sprite, Text, TextStyleOptions } from "pixi.js";
import { engine } from "../getEngine";
import { GameScreen } from "./GameScreen";

const style: TextStyleOptions = {
	fontFamily: "Amatic SC",
	fill: "black",
	fontSize: 70,
	wordWrap: true,
	wordWrapWidth: 1000,
	align: "center",
};

const instructions = [
	"Click/tap to move the spider",
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
		this.text = this.addChild(
			new Text({
				text: instructions[this.pageIndex - 1] || "",
				style,
				anchor: 0.5,
			}),
		);

		const touchArea = this.addChild(
			new Graphics().rect(0, 0, 1920, 1920).fill("#00000001"),
		);
		touchArea.interactive = true;
		touchArea.cursor = "pointer";
		touchArea.on("pointertap", () => this.nextPage());
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
		this.page.position.set(width / 2, height / 2);
		this.text.position.set(width / 2, 850);
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
