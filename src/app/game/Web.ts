import {
	ViewContainerOptions,
	Polygon,
	Graphics,
	Sprite,
	Assets,
	Point,
} from "pixi.js";
import { randomFloat } from "../../engine/utils/random";
import { Container } from "../../PausableContainer";
import { Thread } from "./Thread";

export class Web extends Container {
	constructor(options: ViewContainerOptions & { polygon: Polygon }) {
		super(options);

		const points = options.polygon.points;

		let sumX = 0;
		let sumY = 0;
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		points.forEach((v, i) => {
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
		const scale = size * 0.002;
		const pointsCount = points.length / 2;
		const centerX = sumX / pointsCount;
		const centerY = sumY / pointsCount;

		const mask = this.addChild(new Graphics().poly(points).fill());
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
					x: scale * randomFloat(0.8, 1.2),
					y: scale * randomFloat(0.8, 1.2),
				},
			}),
		);

		for (let i = 0; i < pointsCount; i++) {
			const thread = this.addChild(
				new Thread({
					from: new Point(points[i * 2], points[i * 2 + 1]),
					to: new Point(
						points[((i + 1) % pointsCount) * 2],
						points[((i + 1) % pointsCount) * 2 + 1],
					),
					scaleY: scale,
				}),
			);
			thread.freeze();
		}

		this.animate<Web>(this, { alpha: 0 }, { delay: 5, duration: 10 }).then(
			() => this.destroy(),
		);
	}
}
