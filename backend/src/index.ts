import express from 'express'
import { tavily } from '@tavily/core';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { PROMPT_TEMPLATE } from './prompt';

dotenv.config();
const client = tavily({ apiKey: process.env.TAVILY_API_KEY });
const app = express();
const port = 3000;

const openai = new OpenAI({
	baseURL: 'https://openrouter.ai/api/v1',
	apiKey: process.env.LLM_API_KEY,
	//   defaultHeaders: {
	//     'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
	//     'X-OpenRouter-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
	//   },
});

app.use(express.json());

app.get('/', (req, res) => {
	res.send("hello world!")
})


app.post('/perplexity_ask', async (req, res) => {


	//step1 - get the query from the user 

	const query = req.body.query;


	//step2 -  make sure user has the access/credits to hit the endpoint


	//step3 - (TODO) check if we have web search indexed for similar query 

	//step4 -  web search to gather resources

	const webSearchResponse = await client.search(query, {
		searchDepth: "advanced"
	})

	const webSearchResult = webSearchResponse.results;

	//step5 - do some context engineering on the prompt + websearch responses

	//step 6 - hit the LLM and stream back the response. 

	const prompt = PROMPT_TEMPLATE
		.replace("{{WEB_SEARCH_RESULTS}}", JSON.stringify(webSearchResult))
		.replace("{{USER_QUERY}}", query);
	const completion = await openai.chat.completions.create({
		model: '~openai/gpt-latest',
		messages: [

			{
				role: 'system',
				content: PROMPT_TEMPLATE
			},

			{
				role: 'user',
				content: prompt,

			},
		],
	});
	console.log(completion.choices[0].message);

	//step  7 -  also stream back the resources and followup questions(which we can get from another parallel llm call)

	//step8 - close the event stream	  
})

app.listen(port, () => {
	console.log(`this is our perplexity backend on ${port}`)
})
