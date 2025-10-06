import type { ConfigurationType } from "./Game";

export type Level = {
	configurationTypes: ConfigurationType[];
	multiples: number;
	additional: number;
};

export const levels: Level[] = [
	{
		configurationTypes: ["a"],
		multiples: 3,
		additional: 0,
	},
	{
		configurationTypes: ["a", "a"],
		multiples: 3,
		additional: 0,
	},
	{
		configurationTypes: ["a", "a"],
		multiples: 1,
		additional: 4,
	},
	{
		configurationTypes: ["a", "a", "a", "a"],
		multiples: 3,
		additional: 2,
	},
	{
		configurationTypes: ["aa", "aa"],
		multiples: 2,
		additional: 3,
	},
	{
		configurationTypes: ["ab", "aa"],
		multiples: 2,
		additional: 3,
	},
	{
		configurationTypes: ["ab", "aa", "ab"],
		multiples: 1,
		additional: 0,
	},
	{
		configurationTypes: ["abc"],
		multiples: 1,
		additional: 5,
	},
	{
		configurationTypes: ["aaa", "aaa", "aaa"],
		multiples: 2,
		additional: 0,
	},
	{
		configurationTypes: ["aa", "abc", "aa"],
		multiples: 10,
		additional: 0,
	},
];
