import {
	Assets,
	Graphics,
	Point,
	Sprite,
	Ticker,
	ViewContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { HUD } from "../ui/HUD";
import { randomItem } from "../../engine/utils/random";

export class Background extends Container {
	constructor() {
		super();
		const width = 798;
		for (let i = -10; i <= 10; i++) {
			for (let j = -10; j <= 10; j++) {
				this.addChild(
					new Sprite({
						texture: Assets.get(`BgTile.jpg`),
						anchor: 0.5,
						x: i * width,
						y: j * width,
					}),
				);
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
	speed = 1.5;
	update(ticker: Ticker) {
		if (this.game.lifeCurrent <= 0) {
			return;
		}
		if (this.game.target.visible) {
			const vector = this.game.target.position.subtract(this.position);
			const magnitude = Math.min(
				this.speed * ticker.deltaMS,
				vector.magnitude(),
			);
			if (magnitude == 0) {
				return;
			}
			const delta = vector.normalize().multiplyScalar(magnitude);
			this.position = this.position.add(delta);
			this.rotation = Math.atan2(vector.y, vector.x) + Math.PI / 2;
			this.game.useLife(ticker.deltaMS);
		}
		if (this.currentWeb) {
			this.currentWeb.extendTo(this.position);
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

export class Item extends Container {
	direction = 0;
	speed = 0.1;
	game: Game;
	constructor(options: ViewContainerOptions & { game: Game; item: string }) {
		super(options);
		this.addChild(
			new Sprite({ texture: Assets.get(options.item), anchor: 0.5 }),
		);
		this.rotation = Math.random() * Math.PI * 2;
		this.game = options.game;
		this.game.addToTicker(this);
	}

	update(ticker: Ticker) {
		const bounds = 3000;
		if (this.x > bounds && Math.sin(this.rotation) > 0) {
			this.rotation = -this.rotation;
		}
		if (this.x < -bounds && Math.sin(this.rotation) < 0) {
			this.rotation = -this.rotation;
		}
		if (this.y > bounds && -Math.cos(this.rotation) > 0) {
			this.rotation = Math.PI - this.rotation;
		}
		if (this.y < -bounds && -Math.cos(this.rotation) < 0) {
			this.rotation = Math.PI - this.rotation;
		}

		const previousPosition = this.position.clone();
		const delta = {
			x: Math.sin(this.rotation) * this.speed * ticker.deltaMS,
			y: -Math.cos(this.rotation) * this.speed * ticker.deltaMS,
		};
		this.position = this.position.add(delta);

		for (const web of this.game.webs.children) {
			if (web.isDestroyed) {
				continue;
			}
			const { from, to } = web;
			const intersection = segmentIntersection(
				from,
				to,
				previousPosition,
				this.position.clone(),
			);
			if (intersection) {
				web.destroyAt(intersection);
			}
		}
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
		this.redraw();
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
		this.from = point.clone();
		this.redraw();
		this.previousWeb = newWeb;
		this.parent!.addChild(newWeb);
		newWeb.isDestroyed = true;
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

export class Game extends Container {
	ticker: Ticker;

	player: Player;
	webs: Container<Web>;
	items: Container<Item>;
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
		this.player = this.addChild(new Player({ game: this }));

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
}
