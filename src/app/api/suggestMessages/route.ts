import { generateText } from 'ai';

import { createGoogleGenerativeAI } from '@ai-sdk/google';

export async function POST() {			
	
	const google = createGoogleGenerativeAI({
		apiKey: process.env.GEMINI_API_KEY,
	});	
	const model = google('gemini-1.5-flash');

	const prompt = `Generate 3 intriguing and open-ended questions for an anonymous social messaging platform. The questions should spark curiosity, avoid sensitive topics, and encourage fun and friendly conversations. Separate them with '||'. Add a creative twist each time you generate.`;
	const { text } = await generateText({
		model: model,
		prompt: prompt,
		temperature: 0.5, // Increase randomness
    	topP: 0.9, // Increase randomness
	});
	
	
	
	try {
		
		if (!text || text.length == 0) {
			return Response.json({
				success: false,
				message: "Failed to get results"
			}, { status: 401 })
		}
		return Response.json({
			success: true,
			message: "Successfully generated results",
			result: text
		}, { status: 200 })

	} catch (error) {
		console.log('Unexpected error occurred', error);
		return Response.json({
			success: false,
			message: "Unexpected error occurred"
		}, { status: 500 })

	}

}
