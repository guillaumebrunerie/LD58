import {
	Assets,
	Graphics,
	Point,
	Sprite,
	Ticker,
	TilingSprite,
	ViewContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { HUD } from "../ui/HUD";
import { randomItem } from "../../engine/utils/random";

export class Background extends Container {
	constructor() {
		super();
		this.addChild(
			new TilingSprite({
				texture: Assets.get("Bg.jpg"),
				anchor: 0.5,
				width: 10000,
				height: 10000,
			}),
		);
	}
}

export class Player extends Container {
	game: Game;
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
	}
}

// Returns the intersection point of two line segments AB and CD, or null if none.
const segmentIntersection = (
	a1: Point,
	a2: Point,
	b1: Point,
	b2: Point,
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

	if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
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

		let index = -1;
		this.game.webs.children.forEach((web, i) => {
			const { from, to } = web;
			const intersection = segmentIntersection(
				from,
				to,
				previousPosition,
				this.position.clone(),
			);
			if (intersection) {
				index = i;
			}
		});
		if (index >= 0) {
			for (const web of this.game.webs.children.slice(0, index + 1)) {
				web.destroy();
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
	from: Point;
	to: Point;
	constructor(options: ViewContainerOptions & { from: Point; to: Point }) {
		super(options);
		this.from = options.from.clone();
		this.to = options.to.clone();
		this.addChild(
			new Graphics()
				.moveTo(options.from.x, options.from.y)
				.lineTo(options.to.x, options.to.y)
				.stroke({ color: 0xffffff, width: 5 }),
		);
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
		const oldPosition = this.target.position.clone();
		this.target.position = position;
		this.target.visible = true;
		this.webs.addChild(new Web({ from: oldPosition, to: position }));
	}

	useLife(amount: number) {
		this.lifeCurrent -= amount;
		this.hud.updateLife(this.lifeCurrent / this.lifeMax);
	}
}
