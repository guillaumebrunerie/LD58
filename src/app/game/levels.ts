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
	}, // 1

	{
		configurationTypes: ["a", "a"],
		multiples: 3,
		additional: 0,
	}, // 2

	{
		configurationTypes: ["a", "a"],
		multiples: 1,
		additional: 4,
	}, // 3

	{
		configurationTypes: ["a", "a", "a", "a"],
		multiples: 3,
		additional: 2,
	}, // 4

	{
		configurationTypes: ["aa", "aa"],
		multiples: 2,
		additional: 3,
	}, // 5

	{
		configurationTypes: ["ab", "aa"],
		multiples: 2,
		additional: 3,
	}, // 6

	{
		configurationTypes: ["ab", "aa", "ab"], // No mistakes allowed
		multiples: 1,
		additional: 0,
	}, // 7

	{
		configurationTypes: ["abc"], // Kinda hard to find
		multiples: 1,
		additional: 5,
	}, // 8

	{
		configurationTypes: ["aa", "aa", "aa"],
		multiples: 2,
		additional: 3,
	}, // 9

	{
		configurationTypes: ["a", "aa", "aba"],
		multiples: 2,
		additional: 3,
	}, // 10

	{
		configurationTypes: ["aa", "abc", "aa"], // No mistakes allowed
		multiples: 1,
		additional: 0,
	}, // 11

	{
		configurationTypes: ["abc", "ab"], // Kinda hard to find
		multiples: 1,
		additional: 5,
	}, // 12

	{
		configurationTypes: ["aaa", "aaa"],
		multiples: 2,
		additional: 3,
	}, // 13

	{
		configurationTypes: ["ab", "aa", "aba"],
		multiples: 2,
		additional: 3,
	}, // 14

	{
		configurationTypes: ["aaa", "ab", "aab"], // No mistakes allowed
		multiples: 1,
		additional: 0,
	}, // 15

	{
		configurationTypes: ["abc", "abb"], // Kinda hard to find
		multiples: 1,
		additional: 5,
	}, // 16

	{
		configurationTypes: ["aaa", "aa", "aa"],
		multiples: 2,
		additional: 3,
	}, // 17

	{
		configurationTypes: ["ab", "ab", "ab", "ab", "ab"],
		multiples: 2,
		additional: 0,
	}, // 18

	{
		configurationTypes: ["aa", "abb", "aa", "abc", "aa"], // No mistakes allowed
		multiples: 1,
		additional: 0,
	}, // 19

	{
		configurationTypes: ["abc", "a", "abb", "a"], // Kinda hard to find
		multiples: 1,
		additional: 5,
	}, // 20

	{
		configurationTypes: ["ba", "abc", "aa", "a", "a"], // No mistakes allowed
		multiples: 1,
		additional: 0,
	}, // 21

	{
		configurationTypes: ["abc", "abc", "ab"], // Kinda hard to find
		multiples: 1,
		additional: 5,
	}, // 22

	{
		configurationTypes: ["aaa", "aaa", "aaa"],
		multiples: 2,
		additional: 3,
	}, // 23

	{
		configurationTypes: ["abb", "aba", "aab"],
		multiples: 2,
		additional: 3,
	}, // 24

	{
		configurationTypes: ["aaa", "ab", "aab", "abc"], // No mistakes allowed
		multiples: 1,
		additional: 0,
	}, // 25

	{
		configurationTypes: ["abc", "abb"], // Kinda hard to find
		multiples: 1,
		additional: 5,
	}, // 26

	{
		configurationTypes: ["aa", "aaa", "aa"],
		multiples: 2,
		additional: 3,
	}, // 27

	{
		configurationTypes: ["ab", "ab", "ab", "ab"],
		multiples: 2,
		additional: 10,
	}, // 28

	{
		configurationTypes: ["abb", "aa", "abc", "ab", "aaa"], // No mistakes allowed
		multiples: 1,
		additional: 0,
	}, // 29

	{
		configurationTypes: ["abc", "abc", "abc", "abc"], // Kinda hard to find
		multiples: 1,
		additional: 5,
	}, // 30
];
