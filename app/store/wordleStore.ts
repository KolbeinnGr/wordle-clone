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
}

export const useWordleStore = create<WordleState>((set, get) => ({
	guessRows: [],
	activeRow: 0,
	encryptedWord: "",
	setEncryptedWord: (word: string) => set({ encryptedWord: word }),
	addGuess: (guess, correct, misplaced) =>
		set((state) => ({
			guessRows: [...state.guessRows, { guess, correct, misplaced }],
			activeRow: state.activeRow + 1,
		})),
	checkGuess: async (guess: string) => {
		// Get the encrypted word
		const encryptedWord = get().encryptedWord;

		// const encryptedWord =
		// 	"175f34e17a5305a8ffc49b27caedaeec:c15dc92fc4229602f149d9ca8b7e0eb7";
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
}));
