import express from 'express'
import { tavily } from '@tavily/core';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { PROMPT_TEMPLATE, SYSTEM_PROMPT } from './prompt';


dotenv.config();
const client = tavily({ apiKey: process.env.TAVILY_API_KEY });

const app = express();
const port = 3000;
import "dotenv/config";
// import { PrismaClient } from "./generated/prisma/client";
// import { PrismaClient } from '../generated/prisma/client';
// import {PrismaClient} from '../generated/prisma'
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";



const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });


prisma.user.create({
	data:{
		email: "ayush@gmail.com" , 
		provider: "Github" , 
		name : "Ayush" , 
		
	}
})


const openai = new OpenAI({
	apiKey: process.env.LLM_API_KEY , 
	baseURL: "https://api.groq.com/openai/v1",
});

app.use(express.json());


app.get('/', (req, res) => {
	res.send("hello world!")
})

//Signup
app.post('/signup' , (req , res)=>{

})


//Signin
app.post('/singin' , (req , res)=>{

})

//past conversation get
app.post('/conversation' , (req , res)=>{

})


//past conversation get
app.post('/conversation/:conversationId' , (req , res)=>{

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
	// console.log(webSearchResponse);
	const webSearchResult = webSearchResponse.results;
	// console.log(webSearchResult)

	

	//step5 - do some context engineering on the prompt + websearch responses

	//step 6 - hit the LLM and stream back the response. 

	const prompt = PROMPT_TEMPLATE
		.replace("{{WEB_SEARCH_RESULTS}}", JSON.stringify(webSearchResult))
		.replace("{{USER_QUERY}}", query);


	const response = await openai.responses.create({
		model: "openai/gpt-oss-20b",

		input: [
			{
				role: "system",
				content: SYSTEM_PROMPT,
			},
			{
				role: "user",
				content: prompt,
			},
		],
		stream: true,
	});
	
	
	res.setHeader("Content-Type", "text/plain; charset=utf-8");


	for await (const event of response) {
		if (event.type === "response.output_text.delta") {
			res.write(event.delta);
		}
		// console.log("event" , event) ; 
	}


	res.write("\n<SOURCES>\n");
	//step  7 -  also stream back the resources and followup questions(which we can get from another parallel llm call)

	for (const result of webSearchResult) {
		res.write(JSON.stringify(result.url) + "\n");
	}


	//step8 - close the event stream	
	res.write("/n </SOURCES>")
	console.log(res) ; 
	res.end();
})

app.post("/perplexity_ask/followup" , async(req , res)=>{

	// step 1- get the existing chat from the db
	// step 2- fordward the full history to the llm
	// step 2.5- do the context engineering here 
	// step 3- stream the response to the user
})

app.listen(port, () => {
	console.log(`this is our perplexity backend on ${port}`)
})
