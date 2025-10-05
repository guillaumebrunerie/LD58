import { Assets, Texture } from "pixi.js";
import { randomCyclic } from "../../engine/utils/random";

export const getIdleAnimation = (key: string) =>
	randomCyclic(Object.values(Assets.get(key).textures)) as Texture[];

export const getAnimation = (key: string) =>
	Object.values(Assets.get(key).textures) as Texture[];
