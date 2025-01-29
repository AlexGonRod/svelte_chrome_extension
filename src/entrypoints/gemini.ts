import { GoogleGenerativeAI } from "@google/generative-ai";
const { WXT_GEMINI_API_KEY } = import.meta.env

export default defineContentScript({
	async main(ctx) {
		// const genAI = new GoogleGenerativeAI(WXT_GEMINI_API_KEY);

		// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

		// const prompt = "Explain how AI works";

		// const result = await model.generateContent(prompt);
		
		// console.log(result.response.text());
		console.log('Executed')
		return "Hola"
	}
});