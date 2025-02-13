import { GoogleGenerativeAI } from "@google/generative-ai";
const { WXT_GEMINI_API_KEY } = import.meta.env

export class Gemini {
	genAI = new GoogleGenerativeAI(WXT_GEMINI_API_KEY);
	generationConfig = {
		temperature: 2,
		topP: 0.95,
		topK: 40,
		maxOutputTokens: 8192,
		responseMimeType: "text/plain",
	};
	model = this.genAI.getGenerativeModel({
		model: "gemini-1.5-flash",
		generationConfig: this.generationConfig
	});
	prompt: string;

	constructor(prompt: string) {
		this.prompt = prompt
	}
	
	setResponse() { return this.model.generateContent(this.prompt) }
}