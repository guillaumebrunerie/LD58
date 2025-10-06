import { ViewContainerOptions, Ticker, AnimatedSprite } from "pixi.js";
import { Container } from "../../PausableContainer";
import { Game, gameWidth, gameHeight } from "./Game";
import { Thread } from "./Thread";
import { getIdleAnimation } from "../utils/animation";

export class Player extends Container {
	game: Game;
	currentThread?: Thread;
	constructor(options: ViewContainerOptions & { game: Game }) {
		super(options);
		this.addChild(
			new AnimatedSprite({
				textures: getIdleAnimation("SpiderIdle"),
				animationSpeed: 15 / 60,
				anchor: 0.5,
				autoPlay: true,
			}),
		);
		this.game = options.game;
		this.game.addToTicker(this);
	}
	maxSpeed = 3;
	acceleration = 0.01;
	speed = 0;
	update(ticker: Ticker) {
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
				this.currentThread.extendTo(this.threadPosition(), this.game);
			}
		}
	}
	threadPosition() {
		const deltaFront = -20;
		return this.position.add({
			x: -Math.sin(this.rotation) * deltaFront,
			y: Math.cos(this.rotation) * deltaFront,
		});
	}
}
