import { animate, AnimationPlaybackControlsWithThen } from "motion";
import {
	Container as PixiContainer,
	ContainerChild,
	ContainerOptions,
	AnimatedSprite,
	DestroyOptions,
} from "pixi.js";

export class Container<
	C extends ContainerChild = ContainerChild,
> extends PixiContainer<C> {
	#controls: AnimationPlaybackControlsWithThen[] = [];
	isPaused = false;

	constructor(options?: ContainerOptions<C>) {
		super(options);
	}

	destroy(options?: DestroyOptions) {
		for (const control of this.#controls) {
			control.stop();
		}
		requestAnimationFrame(() => {
			super.destroy(options);
		});
	}

	// @ts-expect-error Magic
	animate: typeof animate = function (this: Container, ...args) {
		// @ts-expect-error Magic
		const controls = animate(...args);
		this.#controls.push(controls);
		controls.then(() => {
			this.#controls = this.#controls.filter((c) => c !== controls);
		});
		return controls;
	};

	pause() {
		this.isPaused = true;
		for (const control of this.#controls) {
			control.pause();
		}
		for (const child of this.children) {
			if (child instanceof Container) {
				child.pause();
			}
			if (child instanceof AnimatedSprite) {
				child.stop();
			}
		}
	}

	resume() {
		this.isPaused = false;
		for (const control of this.#controls) {
			control.play();
		}
		for (const child of this.children) {
			if (child instanceof Container) {
				child.resume();
			}
			if (child instanceof AnimatedSprite) {
				child.play();
			}
		}
	}
}
