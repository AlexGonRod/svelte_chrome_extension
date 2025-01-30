import {Gemini} from './gemini'

type Res = {
	error?: string | null;
	messages: string[]
}
export async function fetchAPI(value: string[]) {
	let response: Res = {error: null, messages: []}
	
	try {
		const prompt = `Please rephrase this sentences in Spanish: ${value} using this JSON schema:
			message = {'message': string}
			Return: Array<message>`;

		const result = await new Gemini(prompt).setResponse();
		const res = result.response.text()
		const json = res.replace(/```json|```/g, '').trim()
		response.messages = JSON.parse(json)
		return response
		
	} catch (err) {
		response.error = (err as any)?.message
		return response
	}
}

