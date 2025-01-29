import {Gemini} from './gemini'

export default async function gemini(value: string[]) {
	
	try {
		const prompt = `Please rephrase this sentences in Spanish: ${value} using this JSON schema:
			message = {'message': string}
			Return: Array<message>`;

		const result = await new Gemini(prompt).setResponse();
		// if ((result as any).status_code !== 200) return {message: result.response.text(), success: false}
		const res = result.response.text()
		console.log(result)
		const json = res.replace(/```json|```/g, '').trim()
		const response = JSON.parse(json)
		return response
		
	} catch (error) {
		console.error("Error: ", (error as any)?.message)
		throw new Error((error as any)?.message)
	}
}

