import { Graphics, Point, Ticker, ViewContainerOptions } from "pixi.js";
import { Container } from "../../PausableContainer";

export class Background extends Container {
	constructor() {
		super();
		const count = 50;
		for (let i = 0; i < count; i++) {
			const star = this.addChild(
				new Graphics()
					.circle(0, 0, Math.random() * 10 + 10)
					.fill({ h: Math.random() * 360, s: 30, l: 50 }),
			);
			const width = 2000;
			const height = 2000;
			star.position.set(
				Math.random() * width - width / 2,
				Math.random() * height - height / 2,
			);
		}
	}
}

export class Player extends Container {
	game: Game;
	constructor(options: ViewContainerOptions & { game: Game }) {
		super(options);
		this.addChild(new Graphics().circle(0, 0, 70).fill("white"));
		this.addChild(new Graphics().circle(0, 0, 60).fill("red"));
		this.game = options.game;
		this.game.addToTicker(this);
	}
	update(ticker: Ticker) {
		if (this.game.target.visible) {
			const speed = 1.5;
			const vector = this.game.target.position.subtract(this.position);
			const magnitude = Math.min(
				speed * ticker.deltaMS,
				vector.magnitude(),
			);
			if (magnitude == 0) {
				return;
			}
			const delta = vector.normalize().multiplyScalar(magnitude);
			this.position = this.position.add(delta);
		}
	}
}

export class Target extends Container {
	constructor(options?: ViewContainerOptions) {
		super(options);
		this.addChild(new Graphics().rect(-50, -5, 100, 10).fill("green"));
		this.addChild(new Graphics().rect(-5, -50, 10, 100).fill("green"));
	}
}

export class Game extends Container {
	ticker: Ticker;

	player: Player;
	target: Target;

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
		this.player = this.addChild(new Player({ game: this }));
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
}
