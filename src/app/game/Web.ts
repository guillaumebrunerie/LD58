import {
	ViewContainerOptions,
	Polygon,
	Graphics,
	Sprite,
	Assets,
} from "pixi.js";
import { randomFloat } from "../../engine/utils/random";
import { Container } from "../../PausableContainer";
import { Game } from "./Game";

export class Web extends Container {
	constructor(
		options: ViewContainerOptions & { game: Game; polygon: Polygon },
	) {
		super(options);

		let sumX = 0;
		let sumY = 0;
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		options.polygon.points.forEach((v, i) => {
			if (i % 2 == 0) {
				sumX += v;
				minX = Math.min(minX, v);
				maxX = Math.max(maxX, v);
			} else {
				sumY += v;
				minY = Math.min(minY, v);
				maxY = Math.max(maxY, v);
			}
		});
		const size = Math.max(maxX - minX, maxY - minY);
		const pointsCount = options.polygon.points.length / 2;
		const centerX = sumX / pointsCount;
		const centerY = sumY / pointsCount;

		const mask = this.addChild(
			new Graphics().poly(options.polygon.points).fill(),
		);
		this.addChild(
			new Sprite({
				texture: Assets.get("WebStill.png"),
				anchor: 0.5,
				mask,
				position: {
					x: centerX,
					y: centerY,
				},
				rotation: randomFloat(0, Math.PI * 2),
				scale: {
					x: size * 0.002 * randomFloat(0.8, 1.2),
					y: size * 0.002 * randomFloat(0.8, 1.2),
				},
			}),
		);

		// this.animate<PolygonHighlight>(
		// 	this,
		// 	{ alpha: 0 },
		// 	{ duration: 10 },
		// ).then(() => this.destroy());
	}
}
