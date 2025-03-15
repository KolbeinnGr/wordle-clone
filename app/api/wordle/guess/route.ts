import { NextResponse } from "next/server";
import { checkGuess } from "@/server/wordService";

export async function POST(req: Request) {
	try {
		const { guess, encryptedWord } = await req.json();

		const result = checkGuess(encryptedWord, guess);

		if (result) {
			return NextResponse.json({ result }, { status: 200 });
		} else {
			return NextResponse.json(
				{ error: "Invalid guess" },
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error("Error validating guess:", error);
		return NextResponse.json(
			{ error: "Failed to validate guess" },
			{ status: 500 }
		);
	}
}
