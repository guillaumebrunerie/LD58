import {
	Assets,
	Graphics,
	Point,
	RenderLayer,
	Sprite,
	Ticker,
	TilingSprite,
	ViewContainerOptions,
} from "pixi.js";
import { Container } from "../../PausableContainer";
import { HUD } from "../ui/HUD";

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
		// const count = 50;
		// for (let i = 0; i < count; i++) {
		// 	const star = this.addChild(
		// 		new Graphics()
		// 			.circle(0, 0, Math.random() * 10 + 10)
		// 			.fill({ h: Math.random() * 360, s: 30, l: 50 }),
		// 	);
		// 	const width = 2000;
		// 	const height = 2000;
		// 	star.position.set(
		// 		Math.random() * width - width / 2,
		// 		Math.random() * height - height / 2,
		// 	);
		// }
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

export class Target extends Container {
	constructor(options?: ViewContainerOptions) {
		super(options);
		this.addChild(new Graphics().rect(-50, -5, 100, 10).fill("#00FF00"));
		this.addChild(new Graphics().rect(-5, -50, 10, 100).fill("#00FF00"));
	}
}

export class Range extends Container {
	constructor(options?: ViewContainerOptions) {
		super(options);
		this.addChild(
			new Graphics().circle(0, 0, 100).fill("#00FF0011").stroke("black"),
		);
	}
}

export class Game extends Container {
	ticker: Ticker;

	player: Player;
	range: Range;
	target: Target;
	hud!: HUD;
	lifeMax = 1000;
	lifeCurrent = 1000;

	constructor() {
		super();
		this.ticker = new Ticker();
		this.ticker.start();
		this.addChild(new Background());
		this.target = this.addChild(
			new Target({
				visible: false,
			}),
		);
		const rangeLayer = this.addChild(new RenderLayer());
		this.player = this.addChild(new Player({ game: this }));
		this.range = this.player.addChild(
			new Range({ scale: (this.lifeCurrent * this.player.speed) / 100 }),
		);
		rangeLayer.attach(this.range);
	}

	addToTicker(container: Container & { update(ticker: Ticker): void }) {
		const callback = () => container.update(this.ticker);
		this.ticker.add(callback);
		container.on("destroyed", () => this.ticker.remove(callback));
	}

	click(position: Point) {
		this.target.position = position;
		this.target.visible = true;
	}

	useLife(amount: number) {
		this.lifeCurrent -= amount;
		this.hud.updateLife(this.lifeCurrent / this.lifeMax);
		this.range.scale.set((this.lifeCurrent * this.player.speed) / 100);
	}
}
