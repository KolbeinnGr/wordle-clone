"use client";

import React, { useEffect, useState } from "react";
import { useWordleStore } from "../../store/wordleStore";
import Keyboard from "../keyboard";
import "../../styles/animations.css"; // Import the CSS file

const NUM_GUESSES = 6;
const NUM_LETTERS = 5;

export default function GuessGrid() {
    const {
        guessRows,
        resetGame,
        currentGuess,
        activeRow,
        getDecryptedWord,
        error,
        setError,
    } = useWordleStore();

    const [showPopup, setShowPopup] = useState(true);
    const [decryptedWord, setDecryptedWord] = useState("");
    const [shake, setShake] = useState(false);
    const [spin, setSpin] = useState(false);

    useEffect(() => {
        resetGame();
    }, [resetGame]);

    useEffect(() => {
        if (activeRow > 5) {
            getDecryptedWord().then(setDecryptedWord);
        }
    }, [activeRow]);

    useEffect(() => {
        if (error) {
            setShake(true);
            const timer = setTimeout(() => {
                setError("");
                setShake(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [error, setError]);

    useEffect(() => {
        if (guessRows.length > 0 && guessRows[guessRows.length - 1].correct.every((c) => c === 1)) {
            setSpin(true);
            const timer = setTimeout(() => {
                setSpin(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [guessRows]);

    const displayedRows = Array.from({ length: NUM_GUESSES }, (_, index) => {
        if (index === activeRow) {
            return {
                guess: currentGuess.padEnd(NUM_LETTERS, " "),
                correct: Array(NUM_LETTERS).fill(0),
                misplaced: Array(NUM_LETTERS).fill(0),
            };
        }

        if (index < guessRows.length) {
            return guessRows[index];
        }

        return {
            guess: "     ",
            correct: Array(NUM_LETTERS).fill(0),
            misplaced: Array(NUM_LETTERS).fill(0),
        };
    });

    return (
        <div className="relative flex flex-col items-center space-y-8">
            {error && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-2 rounded z-10">
                    {error}
                </div>
            )}
            <div className={`relative ${shake ? "shake" : ""}`}>
                {activeRow > 5 &&
                    !guessRows[guessRows.length - 1]?.correct.every(
                        (c) => c === 1
                    ) &&
                    showPopup && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 z-20">
                            <div className="bg-white p-6 rounded-lg shadow-lg text-center relative">
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                >
                                    ✖
                                </button>
                                <h2 className="text-xl font-bold text-amber-500">
                                    Better luck next time!
                                </h2>
                                <p className="mt-2 text-slate-800">
                                    The word was:{" "}
                                    <span className="font-bold text-blue-600">
                                        {decryptedWord}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

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
                                        className={`w-12 h-12 border-2 ${borderColor} flex items-center justify-center text-xl font-bold ${bgColor} ${spin ? "spin" : ""}`}
                                    >
                                        {letter}
                                    </div>
                                );
                            }
                        )}
                    </div>
                ))}
            </div>
            {(guessRows.length > 0 &&
                guessRows[guessRows.length - 1].correct.every(
                    (c) => c === 1
                )) ||
            activeRow > 5 ? (
                <button
                    onClick={() => {
                        resetGame();
                        setShowPopup(true);
                    }}
                    className="px-6 py-3 bg-blue-500 text-white rounded text-lg font-bold mt-4"
                >
                    Play Again
                </button>
            ) : (
                <Keyboard />
            )}
        </div>
    );
}
