"use client";

import React, { useEffect } from "react";
import { useWordleStore } from "../../store/wordleStore";
import Keyboard from "../keyboard";

const NUM_GUESSES = 6;
const NUM_LETTERS = 5;

export default function GuessGrid() {
	const { guessRows, resetGame, currentGuess, activeRow } = useWordleStore();

	useEffect(() => {
		resetGame();
	}, [resetGame]);

	const displayedRows = Array.from({ length: NUM_GUESSES }, (_, index) => {
		// If it's the current active row we enter the letters in here.
		if (index === activeRow) {
			return {
				guess: currentGuess.padEnd(NUM_LETTERS, " "),
				correct: Array(NUM_LETTERS).fill(0),
				misplaced: Array(NUM_LETTERS).fill(0),
			};
		}

		// Show previous guesses
		if (index < guessRows.length) {
			return guessRows[index];
		}

		// Empty rows
		return {
			guess: "     ",
			correct: Array(NUM_LETTERS).fill(0),
			misplaced: Array(NUM_LETTERS).fill(0),
		};
	});

	return (
		<div className="flex flex-col items-center space-y-8">
			{/* Grid row block */}
			<div className="space-y-1">
				{displayedRows.map((row, rowIndex) => (
					<div
						key={rowIndex}
						className="flex justify-center space-x-1"
					>
						{Array.from({ length: NUM_LETTERS }).map(
							(_, colIndex) => {
								const letter = row.guess[colIndex] || "";
								let bgColor = "";
								let borderColor = "border-slate-700";
								if (row.guess && row.correct[colIndex] === 1) {
									bgColor = "bg-emerald-600";
									borderColor = "border-emerald-600";
								} else if (
									row.guess &&
									row.misplaced[colIndex] === 1
								) {
									bgColor = "bg-amber-500";
									borderColor = "border-amber-500";
								}
								if (rowIndex == activeRow) {
									borderColor = "border-gray-100";
								}
								return (
									<div
										key={colIndex}
										className={`w-12 h-12 border-2 ${borderColor} flex items-center justify-center text-xl font-bold ${bgColor}`}
									>
										{letter}
									</div>
								);
							}
						)}
					</div>
				))}
			</div>

			<Keyboard />
		</div>
	);
}
