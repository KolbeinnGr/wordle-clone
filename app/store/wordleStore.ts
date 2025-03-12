import { create } from "zustand";

interface WordleState {
	grid: string[][];
	activeRow: number;
	updateGuess: (guess: string) => void;
	resetGame: () => void;
}

const NUM_ROWS = 6;
const NUM_COLS = 5;

export const useWordleStore = create<WordleState>((set, get) => ({
	grid: Array.from({ length: NUM_ROWS }, () => Array(NUM_COLS).fill("")),
	activeRow: 0,
	updateGuess: (guess: string) => {
		// don't allow the player to enter in a word that is not of right length or if they have made 6 guesses
		if (guess.length !== NUM_COLS || get().activeRow >= NUM_ROWS) return;

		set((state) => {
			const newGrid = state.grid.map((row, i) =>
				i === state.activeRow ? guess.split("") : row
			);
			return { grid: newGrid, activeRow: state.activeRow + 1 };
		});
	},
	resetGame: () =>
		set({
			grid: Array.from({ length: NUM_ROWS }, () =>
				Array(NUM_COLS).fill("")
			),
			activeRow: 0,
		}),
}));
