"use client";

import React, { useState, useEffect } from "react";
import { useWordleStore } from "../../store/wordleStore";

const NUM_GUESSES = 6;
const NUM_LETTERS = 5;

export default function GuessGrid() {
	const { guessRows, resetGame, checkGuess } = useWordleStore();
	const [currentGuess, setCurrentGuess] = useState("");

	useEffect(() => {
		resetGame();
	}, [resetGame]);

	// Build a complete array of rows, filling with empty rows if necessary.
	const displayedRows = Array.from({ length: NUM_GUESSES }, (_, index) => {
		if (index < guessRows.length) {
			return guessRows[index];
		}
		return {
			guess: "",
			correct: Array(NUM_LETTERS).fill(0),
			misplaced: Array(NUM_LETTERS).fill(0),
		};
	});

	const handleSubmit = async () => {
		if (currentGuess.length !== NUM_LETTERS) return;
		await checkGuess(currentGuess.toLowerCase());
		setCurrentGuess("");
	};

	return (
		<div className="flex flex-col items-center space-y-8">
			{/* Grid rows */}
			<div className="space-y-2">
				{displayedRows.map((row, rowIndex) => (
					<div
						key={rowIndex}
						className="flex justify-center space-x-1"
					>
						{Array.from({ length: NUM_LETTERS }).map(
							(_, colIndex) => {
								const letter = row.guess[colIndex] || "";
								let bgColor = "bg-slate-900";
								let borderColor = "border-slate-500";
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

			{/* Input area and buttons */}
			<div className="flex flex-col items-center space-y-4">
				<div className="flex space-x-2">
					<input
						type="text"
						value={currentGuess}
						onChange={(e) => setCurrentGuess(e.target.value)}
						maxLength={NUM_LETTERS}
						className="border p-2"
						placeholder="Enter your guess"
					/>
					<button
						onClick={handleSubmit}
						className="px-4 py-2 bg-blue-500 text-white rounded"
					>
						Submit
					</button>
				</div>
				<button
					onClick={resetGame}
					className="px-4 py-2 bg-red-500 text-white rounded"
				>
					Reset Game
				</button>
			</div>
		</div>
	);
}
