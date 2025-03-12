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
	resetGame: () => Promise<void>;
	currentGuess: string;
	setCurrentGuess: (guess: string) => void;
	usedLetters: Record<string, "correct" | "misplaced" | "wrong">;
	setUsedLetters: (
		letters: Record<string, "correct" | "misplaced" | "wrong">
	) => void;
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
			if (data.result) {
				get().addGuess(
					data.result.guess,
					data.result.correct,
					data.result.misplaced
				);
			}
		} catch (error) {
			console.error("Error checking guess:", error);
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
}));
