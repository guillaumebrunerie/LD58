import { Container } from "pixi.js";
import { Label } from "../ui/Label";

export class LoadScreen extends Container {
	loadingText: Label;

	constructor() {
		super();

		this.loadingText = this.addChild(
			new Label({
				text: "0%",
				style: {
					fontFamily: "Arial",
					fill: "white",
					fontSize: 100,
				},
			}),
		);
	}

	resize(width: number, height: number) {
		this.loadingText.position.set(width / 2, (height * 3) / 4);
	}

	onLoad(progress: number) {
		this.loadingText.text = `${Math.round(progress)}%`;
	}
}
