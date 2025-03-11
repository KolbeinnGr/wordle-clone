import { NextResponse } from "next/server";
import { decryptWord, isValidGuess } from "@/server/wordService";

export async function POST(req: Request) {
	try {
		const { guess, encryptedWord } = await req.json();

		if (!guess || !encryptedWord || !isValidGuess(guess)) {
			return NextResponse.json(
				{ error: "Invalid guess" },
				{ status: 400 }
			);
		}

		const decryptedWord = decryptWord(encryptedWord);

		return NextResponse.json(
			{
				correct: guess.toLowerCase() === decryptedWord,
				message:
					guess.toLowerCase() === decryptedWord
						? "🎉 Correct!"
						: "❌ Wrong guess!",
				word: decryptedWord, // This will only be used when game ends
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error validating guess:", error);
		return NextResponse.json(
			{ error: "Failed to validate guess" },
			{ status: 500 }
		);
	}
}
