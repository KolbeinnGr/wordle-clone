import { NextResponse } from "next/server";
import { decryptWord } from "@/server/wordService";

export async function POST(req: Request) {
	try {
		const { encryptedWord } = await req.json();

		const decryptedWord = decryptWord(encryptedWord);

		if (decryptedWord) {
			return NextResponse.json({ decryptedWord }, { status: 200 });
		}
	} catch (error) {
		console.log("Error decrypting word.");
		return NextResponse.json(
			{ error: "Failed to decrypt the word." },
			{ status: 500 }
		);
	}
}
