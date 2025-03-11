import * as fs from "fs";
import * as path from "path";

export class GameManager {
	wordlist: string[] = [];
	allowedGuesses: string[] = [];

	constructor() {
		console.log("Constructing.");

		// Resolve the correct path

		try {
			this.wordlist = this.readFile("wordlist.txt");

			let guessList: string[] = this.readFile("guesslist.txt");

			this.allowedGuesses = Array.from(
				new Set([...guessList, ...this.wordlist])
			); // Create a new set for the allowedGuesses that contains both guesslist and wordlist.
		} catch (error) {
			console.error("Error reading file:", error);
		}
	}

	private readFile(filename: string): string[] {
		const filePath = path.resolve(process.cwd(), "data/wordle", filename);

		try {
			const data = fs.readFileSync(filePath, "utf8");
			return data.split("\n").map((word) => word.trim());
		} catch (error) {
			console.warn("Error reading file: ", filename);
			return [];
		}
	}
}
