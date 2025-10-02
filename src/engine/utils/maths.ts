export type Point = { x: number; y: number };

export const randomAroundPoint = (p: Point, r: number): Point => {
	const d = Math.sqrt(Math.random()) * r;
	const angle = Math.random() * Math.PI * 2;
	return {
		x: p.x + d * Math.cos(angle),
		y: p.y + d * Math.sin(angle),
	};
};

/** Get the distance between a and b points */
export function getDistanceSq(pointA: Point, pointB: Point) {
	const dx = pointB.x - pointA.x;
	const dy = pointB.y - pointA.y;
	return dx * dx + dy * dy;
}

/** Get the distance between a and b points */
export function getDistance(pointA: Point, pointB: Point) {
	return Math.sqrt(getDistanceSq(pointA, pointB));
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number) {
	return (1 - t) * a + t * b;
}

/** Clamp a number to minimum and maximum values */
export function clamp(v: number, min = 0, max = 1) {
	if (min > max) [min, max] = [max, min];
	return (
		v < min ? min
		: v > max ? max
		: v
	);
}

export const distanceToNearestIncrement = (
	rotation: number,
	increment: number,
	min: number,
	max: number,
	speed: number,
) => {
	const threshold = 2.5;

	let base = Math.round(rotation / increment);
	if (speed > threshold) {
		base = Math.ceil(rotation / increment);
	} else if (speed < -threshold) {
		base = Math.floor(rotation / increment);
	}
	const nearestIncrement = Math.min(max, Math.max(min, base * increment));
	return nearestIncrement - rotation;
};
