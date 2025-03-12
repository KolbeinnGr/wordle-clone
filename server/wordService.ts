import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";

const WORDLIST_PATH = path.resolve(process.cwd(), "data/wordle/wordlist.txt");
const ALLOWED_GUESSES_PATH = path.resolve(
	process.cwd(),
	"data/wordle/guesslist.txt"
);

const wordlist = fs
	.readFileSync(WORDLIST_PATH, "utf8")
	.split("\n")
	.map((w) => w.trim());
const allowedGuesses = new Set([
	...fs
		.readFileSync(ALLOWED_GUESSES_PATH, "utf8")
		.split("\n")
		.map((w) => w.trim()),
	...wordlist,
]);

// Encryption key stored in .env of length 32
const SECRET_KEY =
	process.env.WORDLE_SECRET_KEY || "SUPERSECRETPASSKEYSUPERSECRETPASSK";

export function getRandomWord(): string {
	return wordlist[Math.floor(Math.random() * wordlist.length)]; // random number between 0 and 1 multiplied by the array length
}

// Encrypt the word
export function encryptWord(word: string): string {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(
		"aes-256-cbc",
		Buffer.from(SECRET_KEY),
		iv
	);
	let encrypted = cipher.update(word, "utf8", "hex");
	encrypted += cipher.final("hex");
	return iv.toString("hex") + ":" + encrypted;
}

// Decrypt the word
export function decryptWord(encryptedWord: string): string {
	const [iv, encrypted] = encryptedWord.split(":");
	const decipher = crypto.createDecipheriv(
		"aes-256-cbc",
		Buffer.from(SECRET_KEY),
		Buffer.from(iv, "hex")
	);
	let decrypted = decipher.update(encrypted, "hex", "utf8");
	decrypted += decipher.final("utf8");
	return decrypted;
}

export function isValidGuess(guess: string): boolean {
	return allowedGuesses.has(guess.toLowerCase());
}

export function checkGuess(
	encrypdedWord: string,
	guess: string
): object | null {
	if (!isValidGuess(guess)) {
		console.warn("invalid guess: ", guess);
		return null; // Invalid guess.
	}

	const decodedWord = decryptWord(encrypdedWord);
	console.log(`Decoded word: ${decodedWord} - Guess: ${guess}`);
	// If the guess is exactly the word, return all correct
	if (decodedWord === guess) {
		return {
			guess,
			correct: new Array<number>(decodedWord.length).fill(1),
			misplaced: new Array<number>(decodedWord.length).fill(0),
		};
	}

	// Initalize the result arrays
	let correct: number[] = new Array<number>(decodedWord.length).fill(0);
	let misplaced: number[] = new Array<number>(decodedWord.length).fill(0);

	// Build a frequency map for the letters in the word that the user is guessing
	let letterCount: Map<string, number> = new Map<string, number>();
	for (let char of decodedWord) {
		letterCount.set(char, (letterCount.get(char) ?? 0) + 1);
	}

	// First pass: set the flags for the correct letters
	for (let i = 0; i < 5; i++) {
		if (decodedWord[i] == guess[i]) {
			correct[i] = 1;
			letterCount.set(
				decodedWord[i],
				(letterCount.get(decodedWord[i]) ?? 0) - 1
			);
		}
	}

	// Second pass: set the flags for the letters that are in the word, but not in the correct place
	for (let i = 0; i < 5; i++) {
		// First we check if we have already set that flag in the first pass, so that we don't overwrite it as yellow
		if (decodedWord[i] !== guess[i]) {
			const count = letterCount.get(guess[i]) ?? 0;
			if (count > 0) {
				misplaced[i] = 1;
				// Decrement the count for this letter so we don't over count
				letterCount.set(guess[i], count - 1);
			}
		}
	}

	console.log(`Correct: ${correct} - Misplaced: ${misplaced}`);

	return { guess, correct, misplaced };
}
