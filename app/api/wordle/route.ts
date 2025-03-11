import { NextResponse } from "next/server";
import { getRandomWord, encryptWord } from "@/server/wordService";

export async function GET() {
	try {
		const word = getRandomWord();
		const encryptedWord = encryptWord(word);
		return NextResponse.json({ encryptedWord }, { status: 200 });
	} catch (error) {
		console.error("Error getting new word:", error);
		return NextResponse.json(
			{ error: "Failed to fetch word" },
			{ status: 500 }
		);
	}
}
