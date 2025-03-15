import { decryptWord } from "@/server/wordService";
import { create } from "zustand";

interface GuessRow {
	guess: string; // The guessed word
	correct: number[]; // Array of flags, 0 if the letter is incorrect, 1 if it's correct
	misplaced: number[]; // Array of flags, 0 if the letter is not in the word, 1 if it is and is not already set in correct flag
}

interface WordleState {
	encryptedWord: string;
	setEncryptedWord: (word: string) => void;

	guessRows: GuessRow[];
	activeRow: number;

	addGuess: (
		currentGuess: string,
		correct: number[],
		misplaced: number[]
	) => void;
	checkGuess: (guess: string) => Promise<void>;
	currentGuess: string;
	setCurrentGuess: (guess: string) => void;

	resetGame: () => Promise<void>;

	usedLetters: Record<string, "correct" | "misplaced" | "wrong">;
	setUsedLetters: (
		letters: Record<string, "correct" | "misplaced" | "wrong">
	) => void;

	getDecryptedWord: () => Promise<string>;

	error: string;
	setError: (error: string) => void;
}

export const useWordleStore = create<WordleState>((set, get) => ({
	guessRows: [],
	activeRow: 0,

	encryptedWord: "",
	setEncryptedWord: (word: string) => set({ encryptedWord: word }),

	addGuess: (guess, correct, misplaced) =>
		set((state) => {
			// Update usedLetters to reflect correct/misplaced/wrong letters
			const newUsedLetters = { ...state.usedLetters };

			guess.split("").forEach((letter, index) => {
				if (correct[index] === 1) {
					newUsedLetters[letter] = "correct";
				} else if (
					misplaced[index] === 1 &&
					newUsedLetters[letter] !== "correct"
				) {
					newUsedLetters[letter] = "misplaced";
				} else if (!newUsedLetters[letter]) {
					newUsedLetters[letter] = "wrong";
				}
			});

			return {
				guessRows: [
					...state.guessRows.slice(0, state.activeRow),
					{ guess, correct, misplaced },
					...state.guessRows.slice(state.activeRow + 1),
				],
				activeRow: state.activeRow + 1,
				currentGuess: "",
				usedLetters: newUsedLetters, // Update used letters
			};
		}),

	checkGuess: async (guess: string) => {
		// Get the encrypted word
		const encryptedWord = get().encryptedWord;

		try {
			// Send the api request to check
			const res = await fetch("/api/wordle/guess", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ guess, encryptedWord }),
			});
			const data = await res.json();

			// Result obj: { result: { guess: string, correct: number[], misplaced: number[] } }
			console.log("Guess result: ", data);
			if (data.result) {
				get().addGuess(
					data.result.guess,
					data.result.correct,
					data.result.misplaced
				);
				get().setError(""); // Clear error if guess is valid
			} else {
				get().setError("Invalid guess. Please try again.");
			}
		} catch (error) {
			console.error("Error checking guess:", error);
			get().setError("An error occurred. Please try again.");
		}
	},

	resetGame: async () => {
		try {
			const res = await fetch("/api/wordle/");
			const data = await res.json();
			set({
				guessRows: [],
				activeRow: 0,
				encryptedWord: data.encryptedWord,
				usedLetters: {},
			});
		} catch (error) {
			console.error("Error resetting game:", error);
		}
	},

	currentGuess: "",
	setCurrentGuess: (guess: string) =>
		set(() => {
			if (guess.length > 5) {
				return {};
			}
			return { currentGuess: guess };
		}),
	usedLetters: {},

	setUsedLetters: (letters) =>
		set((state) => ({
			usedLetters: { ...state.usedLetters, ...letters },
		})),

	getDecryptedWord: async () => {
		try {
			const encryptedWord = get().encryptedWord;

			const res = await fetch("/api/wordle/decryptWord", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ encryptedWord }),
			});

			if (!res.ok) throw new Error("Failed to decrypt word");

			const data = await res.json();
			return data.decryptedWord as string;
		} catch (error) {
			console.log("Error decrypting wrod: ", error);
			return "";
		}
	},

	error: "",
	setError: (error: string) => set({ error }),
}));
