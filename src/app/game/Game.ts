import {
	IRenderLayer,
	Point,
	Polygon,
	RenderLayer,
	Ticker,
	ViewContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { HUD } from "../ui/HUD";
import { randomBool, randomItem } from "../../engine/utils/random";
import { Thread } from "./Thread";
import { Web } from "./Web";
import { Player } from "./Player";
import { Insect } from "./Insect";
import { Background } from "./Background";

export const mod = (a: number, b: number) => {
	return ((a % b) + b) % b;
};

export const gameWidth = 1000;
export const gameHeight = 1000;

// Returns the intersection point of two line segments AB and CD, or null if none.
export const segmentIntersection = (
	a1: Point,
	a2: Point,
	b1: Point,
	b2: Point,
	epsilon = 0.000001,
): Point | null => {
	const dax = a2.x - a1.x;
	const day = a2.y - a1.y;
	const dbx = b2.x - b1.x;
	const dby = b2.y - b1.y;

	const denom = dax * dby - day * dbx;
	if (denom === 0) {
		// Parallel (or collinear)
		return null;
	}

	const s = ((b1.x - a1.x) * dby - (b1.y - a1.y) * dbx) / denom;
	const t = ((b1.x - a1.x) * day - (b1.y - a1.y) * dax) / denom;

	if (s > epsilon && s < 1 - epsilon && t > epsilon && t < 1 - epsilon) {
		// Segments intersect
		return new Point(a1.x + s * dax, a1.y + s * day);
	}

	return null; // no intersection within segment bounds
};

export const segmentIntersectsDisk = (
	from: Point,
	to: Point,
	center: Point,
	radius: number,
): Point | undefined => {
	const segment = to.subtract(from);
	const segLenSq = segment.magnitudeSquared();

	if (segLenSq == 0) {
		if (to.subtract(center).magnitudeSquared() <= radius * radius) {
			return to;
		} else {
			return;
		}
	}

	const vector = center.subtract(from);
	const t = vector.dot(segment) / segLenSq;
	const projection = from.add(segment.multiplyScalar(t));

	if (
		projection.subtract(center).magnitudeSquared() <= radius * radius &&
		t > 0.001 &&
		t < 0.999
	) {
		return projection;
	} else if (from.subtract(center).magnitudeSquared() <= radius * radius) {
		return from;
	} else if (to.subtract(center).magnitudeSquared() <= radius * radius) {
		return to;
	} else {
		return;
	}
};

export class Target extends Container {
	constructor(options: ViewContainerOptions & { game: Game }) {
		super(options);
		// this.addChild(new Graphics().rect(-50, -5, 100, 10).fill("#00FF00"));
		// this.addChild(new Graphics().rect(-5, -50, 10, 100).fill("#00FF00"));
	}
}

export type InsectType = string;

const pickInsectType = (): InsectType =>
	randomItem([
		"Fly_01.png",
		"Fly_02.png",
		"Fly_03.png",
		"Fly_04.png",
		"Fly_05.png",
		"Fly_06.png",
	]);

const pickConfiguration = (): InsectType[] => {
	if (randomBool()) {
		return [pickInsectType()];
		// eslint-disable-next-line no-dupe-else-if
	} else if (randomBool()) {
		return [pickInsectType(), pickInsectType()];
	} else {
		return [pickInsectType(), pickInsectType(), pickInsectType()];
	}
};

export class Game extends Container {
	ticker: Ticker;

	player: Player;
	threads: Container<Thread>;
	shadows: IRenderLayer;
	insects: Container<Insect>;
	webs: Container<Web>;
	target: Target;
	hud!: HUD;
	lifeMax = 100000;
	lifeCurrent = 100000;

	wantedConfigurations: InsectType[][];

	constructor() {
		super();
		this.ticker = new Ticker();
		this.ticker.start();
		this.addChild(new Background({ game: this }));
		this.target = this.addChild(
			new Target({
				game: this,
				visible: false,
			}),
		);
		this.threads = this.addChild(new Container<Thread>());
		this.shadows = this.addChild(new RenderLayer());
		this.webs = this.addChild(new Container<Web>());
		this.player = this.addChild(new Player({ game: this, scale: 0.3 }));

		this.wantedConfigurations = [
			pickConfiguration(),
			pickConfiguration(),
			pickConfiguration(),
			pickConfiguration(),
			pickConfiguration(),
		];

		this.insects = this.addChild(new Container<Insect>());
		for (const configuration of this.wantedConfigurations) {
			for (const type of configuration) {
				this.spawnInsect(type);
				this.spawnInsect(type);
			}
		}
		for (let i = 0; i < 5; i++) {
			this.spawnInsect();
		}
	}

	spawnInsect(type = pickInsectType()) {
		this.insects.addChild(
			new Insect({
				game: this,
				type,
				position: new Point(
					Math.random() * gameWidth - gameWidth / 2,
					Math.random() * gameHeight - gameHeight / 2,
				),
				scale: 0.3,
			}),
		);
	}

	addToTicker(container: Container & { update(ticker: Ticker): void }) {
		const callback = () => container.update(this.ticker);
		this.ticker.add(callback);
		container.on("destroyed", () => this.ticker.remove(callback));
	}

	click(position: Point) {
		const oldPosition = this.player.position.clone();
		this.target.position = position;
		this.target.visible = true;
		const thread = this.threads.addChild(
			new Thread({
				from: oldPosition,
				to: oldPosition.clone(),
				previousThread: this.player.currentThread,
			}),
		);
		this.addToTicker(thread);
		this.player.currentThread = thread;
		this.player.speed = 0;
	}

	webCollect(polygon: Polygon) {
		this.webs.addChild(new Web({ polygon }));
		const collectedInsects = [];
		for (const insect of this.insects.children) {
			if (polygon.contains(insect.x, insect.y)) {
				insect.collect();
				collectedInsects.push(insect.type);
			}
		}
		collectedInsects.sort();
		const combination = collectedInsects.join("/");
		const matchingIndex = this.hud.blueprints.children.findIndex(
			(blueprint) =>
				blueprint.combination == combination && !blueprint.isComplete,
		);
		if (matchingIndex >= 0) {
			const blueprint = this.hud.blueprints.children[matchingIndex];
			blueprint.complete();
		}
	}
}
