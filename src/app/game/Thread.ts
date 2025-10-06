import {
	Point,
	AnimatedSprite,
	ViewContainerOptions,
	Assets,
	Polygon,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { Game, segmentIntersection } from "./Game";
import { getAnimation, getIdleAnimation } from "../utils/animation";
import { engine } from "../getEngine";
import { randomInt } from "../../engine/utils/random";

export class Thread extends Container {
	from: Point;
	to: Point;
	line: AnimatedSprite;
	dot: AnimatedSprite;
	previousThread?: Thread;
	isBreaking = false;
	isFrozen = false;

	get to_y_redraw() {
		return this.to.y;
	}

	set to_y_redraw(y: number) {
		this.to.y = y;
		this.redraw();
	}

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

	getAssetName() {
		const vector = this.to.subtract(this.from);
		const length = vector.magnitude();
		// 200, 600, 1200, 1800
		if (length < 350) {
			return "WebSuperShort";
		} else if (length < 850) {
			return "WebShort";
		} else if (length < 1500) {
			return "WebMedium";
		} else {
			return "WebLong";
		}
	}

	redraw() {
		const vector = this.to.subtract(this.from);
		const length = vector.magnitude();
		this.line.textures = getIdleAnimation(this.getAssetName());
		this.line.position = this.from;
		this.line.scale.x =
			length / Assets.get(`${this.getAssetName()}_000.png`).width;
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
			if (thread == this || thread.isBreaking || thread.isFrozen) {
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

	destroyAt(point: Point) {
		if (this.isBreaking) {
			return;
		}

		const newThread = new Thread({
			from: this.from.clone(),
			to: point.clone(),
			previousThread: this.previousThread,
		});
		this.parent!.addChild(newThread);
		newThread.break();

		this.from = point.clone();
		this.previousThread = undefined;
		this.redraw();

		if (newThread.size() > 50) {
			engine().audio.playSound(`WebRemove${randomInt(1, 4)}`);
		}
	}

	destroySpeed = 5;

	break() {
		this.isBreaking = true;
		this.previousThread?.break();

		this.line.textures = getAnimation(this.getAssetName() + "Break");
		this.line.loop = false;
		this.line.animationSpeed = 15 / 60;
		this.line.play();
		this.line.onComplete = () => this.destroy();
	}

	freeze() {
		this.isFrozen = true;
		this.line.stop();
		this.dot.stop();
	}

	size(): number {
		return (
			this.to.subtract(this.from).magnitude() +
			(this.previousThread?.size() ?? 0)
		);
	}
}
