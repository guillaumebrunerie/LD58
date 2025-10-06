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
	}, // Tutorial
	{
		configurationTypes: ["a", "a"],
		multiples: 2,
		additional: 5,
	},
	{
		configurationTypes: ["aa", "ab"],
		multiples: 2,
		additional: 5,
	},
	{
		configurationTypes: ["abc"],
		multiples: 2,
		additional: 5,
	},
	{
		configurationTypes: ["aaa", "aaa", "aaa"],
		multiples: 2,
		additional: 0,
	},
	{
		configurationTypes: ["a", "a", "ab", "aab", "abc"],
		multiples: 1,
		additional: 0,
	},
	{
		configurationTypes: ["a", "a", "ab", "aab", "abc"],
		multiples: 4,
		additional: 0,
	},
	{
		configurationTypes: ["a", "ab", "abc", "abcd", "abcde"],
		multiples: 2,
		additional: 5,
	},
];
