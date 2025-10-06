import {
	Sprite,
	ViewContainerOptions,
	RenderLayer,
	Assets,
	Ticker,
	Color,
} from "pixi.js";
import { lerp } from "../../engine/utils/maths";
import { randomInt, randomFloat } from "../../engine/utils/random";
import { Container } from "../../PausableContainer";
import { timesOfDay } from "./configuration";
import { mod, gameWidth, gameHeight } from "./Game";

export class Background extends Container {
	tiles: Sprite[][];
	lt = 0;

	constructor(options?: ViewContainerOptions) {
		super(options);
		const width = 798;
		const bg = this.addChild(new RenderLayer());
		this.tiles = timesOfDay[0].tints.map(() => []);
		const size = 1;
		for (let i = -size; i <= size; i++) {
			for (let j = -size; j <= size; j++) {
				const tile = this.addChild(
					// new Graphics().rect(-400, -400, 800, 800).fill("green"),
					new Sprite({
						texture: Assets.get(`BgTile.jpg`),
						anchor: 0.5,
						x: i * width,
						y: j * width,
						scale: {
							x: mod(i, 2) == 1 ? -1 : 1,
							y: mod(j, 2) == 1 ? -1 : 1,
						},
					}),
				);
				bg.attach(tile);
				this.tiles[0].push(tile);
			}
		}
		const putBgElement = (item: number, cx: number, cy: number) => {
			const x =
				randomInt(-gameWidth / 4, gameWidth / 4) + (cx * gameWidth) / 4;
			const y =
				randomInt(-gameHeight / 4, gameHeight / 4) +
				(cy * gameHeight) / 4;
			const element = this.addChild(
				new Sprite({
					texture: Assets.get(`Bg_0${item}.png`),
					anchor: 0.5,
					x,
					y,
					scale: {
						x: randomFloat(2, 3),
						y: randomFloat(2, 3),
					},
					rotation: randomFloat(0, Math.PI * 2),
				}),
			);
			this.tiles[item].push(element);
		};
		putBgElement(1, 0, 0);
		putBgElement(2, 1, 1);
		putBgElement(3, 1, -1);
		putBgElement(4, -1, 1);
		putBgElement(5, -1, -1);
		this.updateTint();
	}

	season = 0;

	updateTint() {
		const nt = this.lt / timesOfDay[this.season].duration;
		const getTint = (colorFrom: string, colorTo: string) => {
			const rgbFrom = new Color(colorFrom).toRgb();
			const rgbTo = new Color(colorTo).toRgb();
			return new Color({
				r: lerp(rgbFrom.r, rgbTo.r, nt) * 255,
				g: lerp(rgbFrom.g, rgbTo.g, nt) * 255,
				b: lerp(rgbFrom.b, rgbTo.b, nt) * 255,
			});
		};

		this.tiles.forEach((tiles, index) => {
			const tint = getTint(
				timesOfDay[this.season].tints[index],
				timesOfDay[(this.season + 1) % timesOfDay.length].tints[index],
			);
			for (const tile of tiles) {
				tile.tint = tint;
			}
		});
	}

	update(ticker: Ticker) {
		this.lt += ticker.deltaMS / 1000;
		const duration = timesOfDay[this.season].duration;
		if (this.lt > duration) {
			this.season = (this.season + 1) % timesOfDay.length;
			this.lt -= duration;
		}
		this.updateTint();
	}
}
