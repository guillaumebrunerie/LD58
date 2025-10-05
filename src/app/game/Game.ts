import {
	Assets,
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
import { randomFloat, randomInt, randomItem } from "../../engine/utils/random";

const mod = (a: number, b: number) => {
	return ((a % b) + b) % b;
};

export class Background extends Container {
	constructor() {
		super();
		const width = 798;
		const bg = this.addChild(new RenderLayer());
		for (let i = -10; i <= 10; i++) {
			for (let j = -10; j <= 10; j++) {
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
				this.addChild(
					new Sprite({
						texture: Assets.get(`Bg_0${randomInt(1, 5)}.png`),
						anchor: 0.5,
						x: i * width + randomInt(-200, 200),
						y: j * width + randomInt(-200, 200),
						scale: {
							x: randomFloat(0.5, 2),
							y: randomFloat(0.5, 2),
						},
						rotation: randomFloat(0, Math.PI * 2),
					}),
				);
				// this.addChild(
				// 	new Graphics().rect(-400, -400, 800, 800).fill("green"),
				// );
			}
		}
	}
}

export class Player extends Container {
	game: Game;
	currentWeb?: Web;
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
	speed = -1;
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
			if (magnitude == 0) {
				this.speed = -1;
				this.game.target.visible = false;
				return;
			}
			const delta = vector.normalize().multiplyScalar(magnitude);
			this.position = this.position.add(delta);
			this.rotation = Math.atan2(vector.y, vector.x) + Math.PI / 2;
			this.game.useLife(ticker.deltaMS);
			if (this.currentWeb) {
				this.currentWeb.extendTo(this.position);
			}
		}
	}
}

// Returns the intersection point of two line segments AB and CD, or null if none.
const segmentIntersection = (
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

export class Item extends Container {
	direction = 0;
	speed = 0.1;
	radius = 50;
	game: Game;
	sprite: Sprite;
	shadow: Sprite;

	constructor(options: ViewContainerOptions & { game: Game; item: string }) {
		super(options);

		this.game = options.game;
		this.game.addToTicker(this);

		this.addChild(
			new Graphics().circle(0, 0, this.radius).fill("#FFFFFF00"),
		);
		this.sprite = this.addChild(
			new Sprite({ texture: Assets.get(options.item), anchor: 0.5 }),
		);
		this.shadow = this.addChild(
			new Sprite({
				texture: Assets.get(options.item),
				anchor: 0.5,
				x: 20,
				y: 10,
				tint: 0,
				alpha: 0.5,
			}),
		);
		this.game.itemShadows.attach(this.shadow);

		this.setRotation(Math.random() * Math.PI * 2);
	}

	getRotation() {
		return this.sprite.rotation;
	}
	setRotation(rotation: number) {
		this.sprite.rotation = rotation;
		this.shadow.rotation = rotation;
	}

	update(ticker: Ticker) {
		const bounds = 3000;
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

		for (const web of this.game.webs.children) {
			if (web.isDestroyed) {
				continue;
			}
			const { from, to } = web;
			const intersection = segmentIntersectsDisk(
				from,
				to,
				this.position,
				this.radius,
			);
			if (intersection) {
				web.destroyAt(intersection);
			}
		}
	}

	collect() {
		this.speed = 0;
		this.animate<Item>(this, { alpha: 0 }, { duration: 1 }).then(() =>
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

export class Web extends Container {
	game: Game;
	from: Point;
	to: Point;
	line: Graphics;
	previousWeb?: Web;
	isDestroyed = false;
	constructor(
		options: ViewContainerOptions & {
			game: Game;
			from: Point;
			to: Point;
			previousWeb?: Web;
		},
	) {
		super(options);
		this.game = options.game;
		this.from = options.from.clone();
		this.to = options.to.clone();
		this.line = this.addChild(new Graphics());
		this.previousWeb = options.previousWeb;
		this.extendTo(this.to);
		this.game.addToTicker(this);
	}

	redraw() {
		this.line
			.clear()
			.moveTo(this.from.x, this.from.y)
			.lineTo(this.to.x, this.to.y)
			.stroke({ color: 0xffffff, width: 5 })
			.circle(this.from.x, this.from.y, 2.5)
			.fill({ color: 0xffffff })
			.circle(this.to.x, this.to.y, 2.5)
			.fill({ color: 0xffffff });
	}

	extendTo(point: Point) {
		this.to = point.clone();

		const result = this.findWebIntersection();
		if (result) {
			const { web, point } = result;
			web.extendTo(point.clone());
			const points = [point.clone(), this.from.clone()];
			this.from = point.clone();
			while (this.previousWeb && this.previousWeb != web) {
				const previousWeb = this.previousWeb;
				this.previousWeb = previousWeb?.previousWeb;
				points.push(previousWeb.from.clone());
				previousWeb.destroy();
			}
			this.game.polygonCollect(new Polygon(points));
		}

		this.redraw();
	}

	findWebIntersection() {
		for (const web of this.game.webs.children) {
			if (web == this || web.isDestroyed) {
				continue;
			}
			const point = segmentIntersection(
				this.from,
				this.to,
				web.from,
				web.to,
			);
			if (point) {
				return { web, point };
			}
		}
	}

	destroyAt(point: Point) {
		if (this.isDestroyed) {
			return;
		}

		const newWeb = new Web({
			game: this.game,
			from: this.from.clone(),
			to: point.clone(),
			previousWeb: this.previousWeb,
		});
		this.parent!.addChild(newWeb);
		newWeb.isDestroyed = true;

		this.from = point.clone();
		this.previousWeb = undefined;
		this.redraw();
	}

	destroySpeed = 5;
	update(ticker: Ticker) {
		if (this.isDestroyed) {
			const vector = this.to.subtract(this.from);
			const magnitude = Math.min(
				this.destroySpeed * ticker.deltaMS,
				vector.magnitude(),
			);
			if (magnitude == 0) {
				if (this.previousWeb) {
					this.previousWeb.isDestroyed = true;
				}
				this.destroy();
				return;
			}
			const delta = vector.normalize().multiplyScalar(magnitude);
			this.extendTo(this.to.subtract(delta));
		}
	}
}

export class PolygonHighlight extends Container {
	constructor(
		options: ViewContainerOptions & { game: Game; polygon: Polygon },
	) {
		super(options);
		this.addChild(
			new Graphics().poly(options.polygon.points).fill("white"),
		);

		this.animate<PolygonHighlight>(
			this,
			{ alpha: 0 },
			{ duration: 0.5 },
		).then(() => this.destroy());
	}
}

export class Game extends Container {
	ticker: Ticker;

	player: Player;
	webs: Container<Web>;
	itemShadows: IRenderLayer;
	items: Container<Item>;
	polygons: Container<PolygonHighlight>;
	target: Target;
	hud!: HUD;
	lifeMax = 100000;
	lifeCurrent = 100000;

	constructor() {
		super();
		this.ticker = new Ticker();
		this.ticker.start();
		this.addChild(new Background());
		this.target = this.addChild(
			new Target({
				game: this,
				visible: false,
			}),
		);
		this.webs = this.addChild(new Container<Web>());
		this.itemShadows = this.addChild(new RenderLayer());
		this.player = this.addChild(new Player({ game: this }));
		this.polygons = this.addChild(new Container<PolygonHighlight>());

		this.items = this.addChild(new Container<Item>());
		for (let i = 0; i < 20; i++) {
			this.items.addChild(
				new Item({
					game: this,
					item: randomItem([
						"Fly_01.png",
						"Fly_02.png",
						"Fly_03.png",
						"Fly_04.png",
						"Fly_05.png",
						"Fly_06.png",
					]),
					position: new Point(
						Math.random() * 4000 - 2000,
						Math.random() * 4000 - 2000,
					),
				}),
			);
		}
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
		const web = new Web({
			game: this,
			from: oldPosition,
			to: oldPosition.clone(),
			previousWeb: this.player.currentWeb,
		});
		this.player.currentWeb = this.webs.addChild(web);
	}

	useLife(amount: number) {
		this.lifeCurrent -= amount;
		this.hud.updateLife(this.lifeCurrent / this.lifeMax);
	}

	polygonCollect(polygon: Polygon) {
		this.polygons.addChild(new PolygonHighlight({ game: this, polygon }));
		const collectedItems = [];
		for (const item of this.items.children) {
			if (polygon.contains(item.x, item.y)) {
				item.collect();
				collectedItems.push(item);
			}
		}
	}
}
