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
		configurationTypes: ["ab", "aa", "ab"], // No mistakes allowed
		multiples: 1,
		additional: 0,
	},
	{
		configurationTypes: ["abc"], // Kinda hard to find
		multiples: 1,
		additional: 5,
	},
	{
		configurationTypes: ["aa", "aa", "aa"],
		multiples: 2,
		additional: 3,
	},
	{
		configurationTypes: ["a", "aa", "aba"],
		multiples: 2,
		additional: 3,
	},
	{
		configurationTypes: ["aa", "abc", "aa"], // No mistakes allowed
		multiples: 1,
		additional: 0,
	},
	{
		configurationTypes: ["abc", "ab"], // Kinda hard to find
		multiples: 1,
		additional: 5,
	},
	{
		configurationTypes: ["aaa", "aaa"],
		multiples: 2,
		additional: 3,
	},
	{
		configurationTypes: ["ab", "aa", "aba"],
		multiples: 2,
		additional: 3,
	},
	{
		configurationTypes: ["aaa", "ab", "aab"], // No mistakes allowed
		multiples: 1,
		additional: 0,
	},
	{
		configurationTypes: ["abc", "abb"], // Kinda hard to find
		multiples: 1,
		additional: 5,
	},
	{
		configurationTypes: ["aaa", "aa", "aa"],
		multiples: 2,
		additional: 3,
	},
	{
		configurationTypes: ["ab", "ab", "ab", "ab", "ab"],
		multiples: 2,
		additional: 0,
	},
	{
		configurationTypes: ["aa", "abb", "aa", "abc", "aa"], // No mistakes allowed
		multiples: 1,
		additional: 0,
	},
	{
		configurationTypes: ["abc", "a", "abb", "a"], // Kinda hard to find
		multiples: 1,
		additional: 5,
	},
];
