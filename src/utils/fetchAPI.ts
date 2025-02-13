type Res = {
	error?: string | null;
	messages: string[]
}
export async function fetchAPI(type: string | null = '', value: string[] | string) {
	let response: Res = { error: null, messages: [] }
	console.log("value: ", value)
	try {
		let prompt: string = '';
		if (type) {
			prompt = `Please read this ${value} and rephrase its sentences in Spanish using this JSON schema:
			message = {'message': string}
			Return: Array<message>`
		 }
		
		prompt = `Please rephrase this sentences in Spanish: ${value} using this JSON schema:
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

