import {
	Sprite,
	ViewContainerOptions,
	Assets,
	Ticker,
	Point,
	AnimatedSprite,
} from "pixi.js";
import { randomFloat } from "../../engine/utils/random";
import { Container } from "../../PausableContainer";
import { Game, InsectType, segmentIntersectsDisk } from "./Game";
import { getIdleAnimation } from "../utils/animation";

export const insectBounds = 400;

export class Insect extends Container {
	speed = randomFloat(0.02, 0.05);
	game: Game;
	sprite: AnimatedSprite;
	shadow: Sprite;
	body: Sprite;
	rotationalSpeed = 0;
	type: InsectType;
	isEscaping = false;

	constructor(options: ViewContainerOptions & { game: Game; type: string }) {
		super(options);

		this.type = options.type;
		this.game = options.game;
		this.game.addToTicker(this);

		this.sprite = this.addChild(
			new AnimatedSprite({
				textures: getIdleAnimation(`${options.type}_Idle`),
				anchor: 0.5,
				animationSpeed: 0.3,
			}),
		);
		this.shadow = this.addChild(
			new Sprite({
				texture: Assets.get(options.type),
				anchor: 0.5,
				x: 10,
				y: 20,
				tint: 0,
				alpha: 0.3,
			}),
		);
		this.game.shadows.attach(this.shadow);

		this.body = this.addChild(
			new Sprite({
				texture: Assets.get(options.type + "_Dead.png"),
				anchor: 0.5,
				visible: false,
			}),
		);

		this.setRotation(Math.random() * Math.PI * 2);
	}

	getRotation() {
		return this.sprite.rotation;
	}
	setRotation(rotation: number) {
		this.sprite.rotation = rotation;
		this.shadow.rotation = rotation;
		this.body.rotation = rotation;
	}

	rotationTimeout = 0;
	update(ticker: Ticker) {
		const bounds = insectBounds;
		const dt = ticker.deltaMS;
		if (this.speed == 0) {
			return;
		}

		this.rotationTimeout -= dt;
		if (this.rotationTimeout <= 0) {
			this.rotationTimeout +=
				(randomFloat(1000, 3000) * 0.05) / this.speed;
			this.rotationalSpeed = (randomFloat(-1, 1) * this.speed) / 0.05;
		}
		this.setRotation(
			(dt * this.rotationalSpeed) / 1000 + this.getRotation(),
		);

		const r = this.getRotation();
		if (this.isEscaping) {
			// Destroy if far enough out of bounds
			if (
				Math.abs(this.x) > 2 * bounds ||
				Math.abs(this.y) > 2 * bounds
			) {
				this.destroy();
				return;
			}
		} else {
			// Bounce off walls
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
		}

		// Move forward
		const delta = {
			x: Math.sin(r) * this.speed * ticker.deltaMS,
			y: -Math.cos(r) * this.speed * ticker.deltaMS,
		};
		this.position = this.position.add(delta);

		if (!this.isEscaping) {
			// Escape if player is too close
			const distanceToPlayer = this.position
				.subtract(this.game.player.position)
				.magnitude();
			const hitbox = 30;
			if (distanceToPlayer < hitbox) {
				this.escape(this.game.player.position);
				return;
			}

			// Destroy threads on contact
			for (const thread of this.game.threads.children) {
				if (thread.isDestroyed || thread.isFrozen) {
					continue;
				}
				const { from, to } = thread;
				const radius = 50;
				const intersection = segmentIntersectsDisk(
					from,
					to,
					this.position,
					radius * this.scale.x,
				);
				if (intersection) {
					thread.destroyAt(intersection, this.game);
				}
			}
		}
	}

	collect() {
		this.speed = 0;
		this.sprite.visible = false;
		this.body.visible = true;
		this.animate<Insect>(this, { alpha: 0 }, { duration: 3 }).then(() =>
			this.destroy(),
		);
	}

	escape(from: Point) {
		const vector = this.position.subtract(from);
		const angle = Math.atan2(vector.y, vector.x);
		this.setRotation(angle + Math.PI / 2);
		this.speed = 1;
		this.rotationTimeout /= 10;
		this.isEscaping = true;
	}

	start() {
		this.sprite.play();
	}
}
