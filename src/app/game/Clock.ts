import { Ticker } from "pixi.js";
import { timesOfDay } from "./configuration";

class Clock {
	lt = 0;
	season = 0;
	update(ticker: Ticker) {
		this.lt += ticker.deltaMS / 1000;
		const duration = timesOfDay[this.season].duration;
		if (this.lt > duration) {
			this.season = (this.season + 1) % timesOfDay.length;
			this.lt -= duration;
		}
	}
}

export const clock = new Clock();
