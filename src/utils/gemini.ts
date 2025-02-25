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
	prompt;
	type;
	value;

	constructor(value: string | null, type?: string | null) {
		this.type = type
		this.value = value
		this.prompt = `Please rephrase this sentences in Spanish: ${value} using this JSON schema:
			message = {'message': string}
			Return: Array<message>`;
	};

	async setResponse() {

		if (this.type !== "image") {
			return this.model.generateContent(this.prompt);
		}

		try {
			// Extraer el tipo MIME y los datos base64
			const matches = this.value?.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

			if (!matches || matches.length !== 3) {
				throw new Error('Formato data URL inválido');
			}

			const mimeType = matches[1];
			const base64Data = matches[2];

			// Verificar que tenemos datos válidos
			if (!base64Data || base64Data.trim().length === 0) {
				throw new Error('Datos base64 vacíos o inválidos');
			}

			// Usar inlineData en lugar de fileUri
			return this.model.generateContent([
				this.prompt,
				{
					inlineData: {
						data: base64Data,
						mimeType: mimeType
					}
				}
			]);
		} catch (error) {
			console.error("Error procesando la imagen para Gemini:", error);
			throw error;
		}
	}
}