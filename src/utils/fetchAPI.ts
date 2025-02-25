import { Gemini } from "./gemini";

type Res = {
	error?: string | null;
	messages: string[] | string
}

export async function fetchAPI(value: string, type: string | null = null) {
	let response: Res = { error: null, messages: [] }
	try {
		
		const result = await new Gemini(value, type).setResponse();
		
		const res = result.response.text()
		const json = res.replace(/```json|```/g, '').trim()
		response.messages = JSON.parse(json)

		return response

	} catch (err) {
		response.error = (err as any)?.message
		return response
	}
}