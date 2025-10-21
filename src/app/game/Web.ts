import {
	ViewContainerOptions,
	Polygon,
	Graphics,
	Sprite,
	Assets,
	Point,
	IRenderLayer,
} from "pixi.js";
import { randomFloat } from "../../engine/utils/random";
import { Container } from "../../PausableContainer";
import { Thread } from "./Thread";
import { Label } from "../ui/Label";

export class Web extends Container {
	constructor(
		options: ViewContainerOptions & {
			polygon: Polygon;
			message: string;
			success: boolean;
			messageLayer: IRenderLayer;
		},
	) {
		super(options);

		const points = options.polygon.points;

		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		points.forEach((v, i) => {
			if (i % 2 == 0) {
				minX = Math.min(minX, v);
				maxX = Math.max(maxX, v);
			} else {
				minY = Math.min(minY, v);
				maxY = Math.max(maxY, v);
			}
		});
		const size = Math.max(maxX - minX, maxY - minY);
		const scale = Math.max(0.6, size * 0.0015);
		const pointsCount = points.length / 2;
		const centerX = (minX + maxX) / 2;
		const centerY = (minY + maxY) / 2;

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

		if (options.message) {
			const errorMessage = this.addChild(
				new Label({
					x: centerX,
					y: centerY,
					text: options.message,
					style: {
						fontFamily: "SueEllenFrancisco",
						fill: options.success ? "#006600" : "#DD0000",
						fontSize: 60,
					},
				}),
			);
			options.messageLayer.attach(errorMessage);
		}

		this.animate<Web>(this, { alpha: 0 }, { duration: 4 }).then(() =>
			this.destroy(),
		);
	}
}
