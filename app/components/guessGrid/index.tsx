"use client";

import React, { useEffect } from "react";
import { useWordleStore } from "../../store/wordleStore";

export default function GuessGrid() {
	const { grid, activeRow, updateGuess, resetGame } = useWordleStore();

	return (
		<div className="space-y-4">
			{grid.map((row, rowIndex) => (
				<div key={rowIndex} className="flex justify-center space-x-2">
					{row.map((letter, colIndex) => (
						<div
							key={colIndex}
							className={`w-12 h-12 border-2 flex items-center justify-center text-xl font-bold
                    ${
						rowIndex === activeRow
							? "border-blue-500"
							: "border-gray-400"
					}`}
						>
							{letter}
						</div>
					))}
				</div>
			))}
		</div>
	);
}
