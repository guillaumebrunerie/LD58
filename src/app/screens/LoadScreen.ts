import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Sprite, Texture } from "pixi.js";

/** Screen shown while loading assets */
export class LoadScreen extends Container {
	/** Assets bundles required by this screen */
	public static assetBundles = ["preload"];
	private background: Sprite;

	constructor() {
		super();
		this.background = new Sprite({
			texture: Texture.from("preload/Loading.jpg"),
			anchor: 0.5,
		});
		this.addChild(this.background);
	}

	/** Resize the screen, fired whenever window size changes  */
	public resize(width: number, height: number) {
		this.background.position.set(width * 0.5, height * 0.5);
		this.background.scale.set(
			width / this.background.texture.width,
			height / this.background.texture.height,
		);
	}

	/** Show screen with animations */
	public async show() {
		this.alpha = 1;
	}

	/** Hide screen with animations */
	public async hide() {
		await animate(this, { alpha: 0 } as ObjectTarget<this>, {
			duration: 0.3,
			ease: "linear",
			delay: 1,
		});
	}
}
