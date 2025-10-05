import {
	Assets,
	Color,
	Graphics,
	IRenderLayer,
	Point,
	Polygon,
	RenderLayer,
	Sprite,
	Ticker,
	ViewContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { HUD } from "../ui/HUD";
import {
	randomBool,
	randomFloat,
	randomInt,
	randomItem,
} from "../../engine/utils/random";
import { timesOfDay } from "./configuration";
import { lerp } from "../../engine/utils/maths";
import { Thread } from "./Thread";
import { Web } from "./Web";

const mod = (a: number, b: number) => {
	return ((a % b) + b) % b;
};

const gameWidth = 1000;
const gameHeight = 1000;

export class Background extends Container {
	game: Game;
	tiles: Sprite[][];
	lt = 0;

	constructor(options: ViewContainerOptions & { game: Game }) {
		super(options);
		this.game = options.game;
		this.game.addToTicker(this);
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
		// this.addChild(
		// 	new Graphics()
		// 		.rect(-gameWidth / 2, -gameHeight / 2, gameWidth, gameHeight)
		// 		.stroke("blue"),
		// );
	}

	season = 0;
	update(ticker: Ticker) {
		this.lt += ticker.deltaMS / 1000;
		const duration = timesOfDay[this.season].duration;
		if (this.lt > duration) {
			this.season = (this.season + 1) % timesOfDay.length;
			this.lt -= duration;
		}
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
}

export class Player extends Container {
	game: Game;
	currentThread?: Thread;
	constructor(options: ViewContainerOptions & { game: Game }) {
		super(options);
		this.addChild(
			new Sprite({
				texture: Assets.get("Hero.png"),
				anchor: 0.5,
			}),
		);
		this.game = options.game;
		this.game.addToTicker(this);
	}
	maxSpeed = 3;
	acceleration = 0.01;
	speed = 0;
	update(ticker: Ticker) {
		if (this.game.lifeCurrent <= 0) {
			return;
		}
		if (this.game.target.visible) {
			this.speed = Math.min(
				this.speed + this.acceleration * ticker.deltaMS,
				this.maxSpeed,
			);
			const vector = this.game.target.position.subtract(this.position);
			const magnitude = Math.min(
				this.speed * ticker.deltaMS,
				vector.magnitude(),
			);
			if (vector.magnitude() == 0) {
				this.speed = 0;
				this.game.target.visible = false;
				return;
			}
			const delta = vector.normalize().multiplyScalar(magnitude);
			const newPosition = this.position.add(delta);
			if (
				newPosition.x < -gameWidth / 2 ||
				newPosition.x > gameWidth / 2 ||
				newPosition.y < -gameHeight / 2 ||
				newPosition.y > gameHeight / 2
			) {
				this.speed = 0;
				this.game.target.visible = false;
				return;
			}
			this.position = newPosition;
			this.rotation = Math.atan2(vector.y, vector.x) + Math.PI / 2;
			if (this.currentThread) {
				this.currentThread.extendTo(this.position, this.game);
			}
		}
	}
}

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

const segmentIntersectsDisk = (
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

export class Insect extends Container {
	speed = randomFloat(0.01, 0.05);
	radius = 50;
	game: Game;
	sprite: Sprite;
	shadow: Sprite;
	rotationalSpeed = 0;
	type: InsectType;

	constructor(options: ViewContainerOptions & { game: Game; type: string }) {
		super(options);

		this.type = options.type;
		this.game = options.game;
		this.game.addToTicker(this);

		this.addChild(
			new Graphics().circle(0, 0, this.radius).fill("#FFFFFF00"),
		);
		this.sprite = this.addChild(
			new Sprite({ texture: Assets.get(options.type), anchor: 0.5 }),
		);
		this.shadow = this.addChild(
			new Sprite({
				texture: Assets.get(options.type),
				anchor: 0.5,
				x: 40,
				y: 20,
				tint: 0,
				alpha: 0.5,
			}),
		);
		this.game.shadows.attach(this.shadow);

		this.setRotation(Math.random() * Math.PI * 2);
	}

	getRotation() {
		return this.sprite.rotation;
	}
	setRotation(rotation: number) {
		this.sprite.rotation = rotation;
		this.shadow.rotation = rotation;
	}

	rotationTimeout = 0;
	update(ticker: Ticker) {
		const bounds = gameWidth / 2 - 15;
		const dt = ticker.deltaMS;

		this.rotationTimeout -= dt;
		if (this.rotationTimeout <= 0) {
			this.rotationTimeout += randomFloat(1000, 3000);
			this.rotationalSpeed = randomFloat(-1, 1);
		}
		this.setRotation(
			(dt * this.rotationalSpeed) / 1000 + this.getRotation(),
		);

		const r = this.getRotation();
		if (this.x > bounds && Math.sin(r) > 0) {
			this.setRotation(-r);
		}
		if (this.x < -bounds && Math.sin(r) < 0) {
			this.setRotation(-r);
		}
		if (this.y > bounds && -Math.cos(r) > 0) {
			this.setRotation(Math.PI - r);
		}
		if (this.y < -bounds && -Math.cos(r) < 0) {
			this.setRotation(Math.PI - r);
		}

		const delta = {
			x: Math.sin(r) * this.speed * ticker.deltaMS,
			y: -Math.cos(r) * this.speed * ticker.deltaMS,
		};
		this.position = this.position.add(delta);

		for (const thread of this.game.threads.children) {
			if (thread.isDestroyed || thread.isFrozen) {
				continue;
			}
			const { from, to } = thread;
			const intersection = segmentIntersectsDisk(
				from,
				to,
				this.position,
				this.radius * this.scale.x,
			);
			if (intersection) {
				thread.destroyAt(intersection, this.game);
			}
		}
	}

	collect() {
		this.speed = 0;
		this.animate<Insect>(this, { alpha: 0 }, { duration: 1 }).then(() =>
			this.destroy(),
		);
	}
}

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
		this.player = this.addChild(new Player({ game: this, scale: 0.2 }));

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
			}
		}
		for (let i = 0; i < 10; i++) {
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
				scale: 0.2,
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

	// useLife(amount: number) {
	// 	this.lifeCurrent -= amount;
	// 	this.hud.updateLife(this.lifeCurrent / this.lifeMax);
	// }

	webCollect(polygon: Polygon) {
		this.webs.addChild(new Web({ game: this, polygon }));
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
