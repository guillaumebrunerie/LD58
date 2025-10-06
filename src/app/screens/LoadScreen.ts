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
					fontSize: 70,
					fontWeight: "bold",
				},
			}),
		);
	}

	resize(width: number, height: number) {
		this.loadingText.position.set(width / 2, height / 2);
	}

	onLoad(progress: number) {
		this.loadingText.text = `${Math.round(progress)}%`;
	}
}
