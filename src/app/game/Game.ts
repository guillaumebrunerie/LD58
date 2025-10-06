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
import { randomFloat, randomItem } from "../../engine/utils/random";
import { Thread } from "./Thread";
import { Web } from "./Web";
import { Player } from "./Player";
import { Insect, insectBounds } from "./Insect";
import { Background } from "./Background";
import { Level } from "./levels";
import { engine } from "../getEngine";
import { GameScreen } from "../screens/GameScreen";

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

// Returns the point nearest to `to` that intersects the disk. It should not be
// within epsilon of from or we get weird infinite loops.
export const segmentIntersectsDisk = (
	from: Point,
	to: Point,
	center: Point,
	radius: number,
): Point | undefined => {
	const segment = to.subtract(from);
	const segLenSq = segment.magnitudeSquared();

	if (segLenSq == 0) {
		return;
	}

	const vector = center.subtract(from);
	const t = vector.dot(segment) / segLenSq;
	const projection = from.add(segment.multiplyScalar(t));
	const distanceToLineSq = projection.subtract(center).magnitudeSquared();

	if (distanceToLineSq >= radius * radius) {
		return;
	}
	const delta = Math.sqrt((radius * radius - distanceToLineSq) / segLenSq);
	const uMin = t - delta;
	const uMax = t + delta;
	if (uMax < 0.001 || uMin >= 1) {
		return;
	}
	const u = Math.min(1, uMax);
	return from.add<Point>(segment.multiplyScalar(u));
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
	randomItem(["Fly_01", "Fly_02", "Fly_03", "Fly_04", "Fly_05", "Fly_06"]);

export type ConfigurationType = string;

const pickInsectTypes = (
	antipool: InsectType[],
	letters: string[],
): Record<string, InsectType> => {
	const pickedTypes = new Set<InsectType>();
	return Object.fromEntries(
		letters.map((letter) => {
			while (true) {
				const type = pickInsectType();
				if (pickedTypes.has(type)) {
					continue;
				}
				const index = antipool.indexOf(type);
				if (index >= 0) {
					antipool.splice(index, 1);
					continue;
				}
				pickedTypes.add(type);
				return [letter, type];
			}
		}),
	);
};

const pickConfiguration = (
	type: ConfigurationType,
	antipool: InsectType[],
): InsectType[] => {
	const characters = [...new Set(type.split(""))];
	const result = pickInsectTypes(antipool, characters);
	const result2 = type.split("").map((x) => result[x]);
	antipool.push(...result2);
	return result2;
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

	wantedConfigurations: InsectType[][];

	constructor(options: { level: Level }) {
		super();
		this.ticker = new Ticker();
		const background = this.addChild(new Background());
		this.addToTicker(background);
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

		const antipool: InsectType[] = [];
		this.wantedConfigurations = options.level.configurationTypes.map(
			(type) => pickConfiguration(type, antipool),
		);

		this.insects = this.addChild(new Container<Insect>());
		for (const configuration of this.wantedConfigurations) {
			for (const type of configuration) {
				for (let i = 0; i < options.level.multiples; i++) {
					this.spawnInsect(type);
				}
			}
		}
		for (let i = 0; i < options.level.additional; i++) {
			this.spawnInsect();
		}
	}

	start() {
		this.ticker.start();
		for (const insect of this.insects.children) {
			insect.start();
		}
	}

	spawnInsect(type = pickInsectType()) {
		this.insects.addChild(
			new Insect({
				game: this,
				type,
				position: new Point(
					randomFloat(insectBounds, -insectBounds),
					randomFloat(insectBounds, -insectBounds),
				),
				scale: 0.35,
			}),
		);
	}

	addToTicker(container: Container & { update(ticker: Ticker): void }) {
		const callback = () => container.update(this.ticker);
		this.ticker.add(callback);
		container.on("destroyed", () => this.ticker.remove(callback));
	}

	click(position: Point) {
		const oldPosition = this.player.threadPosition();
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
		if (this.hud.blueprints.children.every((b) => b.isComplete)) {
			(engine().navigation.currentScreen as GameScreen).win();
		}
	}
}
