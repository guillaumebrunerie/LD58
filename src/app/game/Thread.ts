import {
	Point,
	AnimatedSprite,
	ViewContainerOptions,
	Assets,
	Polygon,
	Ticker,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { Game, segmentIntersection } from "./Game";
import { getIdleAnimation } from "../utils/animation";

export class Thread extends Container {
	from: Point;
	to: Point;
	line: AnimatedSprite;
	dot: AnimatedSprite;
	previousThread?: Thread;
	isDestroyed = false;
	isFrozen = false;

	constructor(
		options: ViewContainerOptions & {
			from: Point;
			to: Point;
			scaleY?: number;
			previousThread?: Thread;
		},
	) {
		super(options);
		this.from = options.from.clone();
		this.to = options.to.clone();
		this.line = this.addChild(
			new AnimatedSprite({
				textures: getIdleAnimation("WebLong"),
				scale: { x: 1, y: options.scaleY ?? 1 },
				anchor: { x: 0, y: 0.5 },
				autoPlay: true,
				animationSpeed: 15 / 60,
			}),
		);
		this.dot = this.addChild(
			new AnimatedSprite({
				textures: getIdleAnimation("WebDot"),
				anchor: 0.5,
				autoPlay: true,
				animationSpeed: 15 / 60,
				scale: 0.4 * (options.scaleY ?? 1),
			}),
		);
		this.previousThread = options.previousThread;
		this.redraw();
	}

	redraw() {
		const vector = this.to.subtract(this.from);
		const length = vector.magnitude();
		// 200, 600, 1200, 1800
		let web = "WebLong";
		if (length < 350) {
			web = "WebSuperShort";
		} else if (length < 8500) {
			web = "WebShort";
		} else if (length < 1500) {
			web = "WebMedium";
		}
		this.line.textures = getIdleAnimation(web);
		this.line.position = this.from;
		this.line.scale.x = length / Assets.get(`${web}_000.png`).width;
		this.line.rotation = Math.atan2(vector.y, vector.x);
		this.line.play();

		this.dot.position.set(this.from.x, this.from.y);
		this.dot.play();
	}

	extendTo(point: Point, game: Game) {
		this.to = point.clone();

		const result = this.findThreadIntersection(game.threads.children);
		if (result) {
			const { thread, point } = result;
			thread.extendTo(point.clone(), game);
			const points = [point.clone(), this.from.clone()];
			this.from = point.clone();
			while (this.previousThread && this.previousThread != thread) {
				const previousThread = this.previousThread;
				this.previousThread = previousThread?.previousThread;
				points.push(previousThread.from.clone());
				previousThread.destroy();
			}
			const polygon = new Polygon(points);
			if (polygon.contains(thread.from.x, thread.from.y)) {
				while (this.previousThread) {
					const previousThread = this.previousThread;
					this.previousThread = previousThread?.previousThread;
					previousThread.destroy();
				}
			}

			game.webCollect(polygon);
		}

		this.redraw();
	}

	findThreadIntersection(threads: Thread[]) {
		for (const thread of threads) {
			if (thread == this || thread.isDestroyed || thread.isFrozen) {
				continue;
			}
			const point = segmentIntersection(
				this.from,
				this.to,
				thread.from,
				thread.to,
			);
			if (point) {
				return { thread, point };
			}
		}
	}

	destroyAt(point: Point, game: Game) {
		if (this.isDestroyed) {
			return;
		}

		const newThread = new Thread({
			from: this.from.clone(),
			to: point.clone(),
			previousThread: this.previousThread,
		});
		this.parent!.addChild(newThread);
		newThread.isDestroyed = true;
		game.addToTicker(newThread);

		this.from = point.clone();
		this.previousThread = undefined;
		this.redraw();
	}

	destroySpeed = 5;
	update(ticker: Ticker) {
		if (this.isFrozen) {
			return;
		}
		if (this.isDestroyed) {
			const vector = this.to.subtract(this.from);
			const magnitude = Math.min(
				this.destroySpeed * ticker.deltaMS,
				vector.magnitude(),
			);
			if (magnitude == 0) {
				if (this.previousThread) {
					this.previousThread.isDestroyed = true;
				}
				this.destroy();
				return;
			}
			const delta = vector.normalize().multiplyScalar(magnitude);
			this.to = this.to.subtract(delta);
			this.redraw();
		}
	}

	freeze() {
		this.isFrozen = true;
		this.line.stop();
		this.dot.stop();
	}
}
