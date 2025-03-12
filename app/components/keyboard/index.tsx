"use client";

import React, { useEffect } from "react";
import { useWordleStore } from "../../store/wordleStore";

const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

export default function Keyboard() {
	const { checkGuess, setCurrentGuess, currentGuess, usedLetters } =
		useWordleStore();

	const handleKeyPress = (key: string) => {
		if (key === "Enter") {
			if (currentGuess.length === 5) {
				checkGuess(currentGuess.toLowerCase());
			}
		} else if (key === "Backspace") {
			setCurrentGuess(currentGuess.slice(0, -1));
		} else if (/^[a-zA-Z]$/.test(key)) {
			// Only allow alphabet characters
			if (currentGuess.length < 5) {
				setCurrentGuess(currentGuess + key.toLowerCase());
			}
		}
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			handleKeyPress(event.key);
		};
		// Event listener to handle keyboard input
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [currentGuess]);

	const getKeyColor = (letter: string) => {
		switch (usedLetters[letter]) {
			case "correct":
				return "bg-emerald-600"; // Letters in the correct place
			case "misplaced":
				return "bg-amber-500"; // Misplaced letters
			case "wrong":
				return "bg-gray-800"; // Letters not in word
			default:
				return "bg-gray-400"; // Default key color
		}
	};

	return (
		<div className="flex flex-col items-center space-y-2 mt-4">
			{rows.map((row, rowIndex) => (
				<div key={rowIndex} className="flex space-x-1">
					{row.split("").map((letter) => (
						<button
							key={letter}
							className={`px-3 py-2 text-white rounded text-lg font-bold ${getKeyColor(
								letter
							)}`}
							onClick={() => handleKeyPress(letter)}
						>
							{letter}
						</button>
					))}
				</div>
			))}
			<div className="flex space-x-2">
				<button
					className="px-4 py-2 bg-blue-500 text-white rounded text-lg font-bold"
					onClick={() => handleKeyPress("ENTER")}
				>
					ENTER
				</button>
				<button
					className="px-4 py-2 bg-red-500 text-white rounded text-lg font-bold"
					onClick={() => handleKeyPress("DELETE")}
				>
					DELETE
				</button>
			</div>
		</div>
	);
}
