import type { ConfigurationType } from "./Game";

type Level = {
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
		configurationTypes: ["a"],
		multiples: 2,
		additional: 5,
	}, // Very easy
	{
		configurationTypes: ["a", "a"],
		multiples: 2,
		additional: 5,
	}, // Multiple configurations
	{
		configurationTypes: ["a", "a", "ab", "aab", "abc"],
		multiples: 2,
		additional: 5,
	}, // Complex
];
