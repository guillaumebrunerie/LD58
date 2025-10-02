import { animate, AnimationPlaybackControlsWithThen } from "motion";
import {
	Container as PixiContainer,
	ContainerChild,
	ContainerOptions,
} from "pixi.js";

export class Container<
	C extends ContainerChild = ContainerChild,
> extends PixiContainer<C> {
	#controls: AnimationPlaybackControlsWithThen[] = [];
	isPaused = false;

	constructor(options?: ContainerOptions<C>) {
		super(options);
	}

	animate: typeof animate = function (this: Container, ...args) {
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
		}
	}
}
