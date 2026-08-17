import { Router } from "express";
import { tavily } from '@tavily/core';
import { PROMPT_TEMPLATE, SYSTEM_PROMPT } from '../prompt.js';
import { middleware } from "../middleware.js";
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { askSchema } from "../schemas/askSchema.js";
import { prisma } from "../lib/prisma.js";
import conversation from "./conversation.js";
dotenv.config();
const apiKey = process.env.TAVILY_API_KEY;
const client = tavily({ apiKey: apiKey });

const router = Router();
const openai = new OpenAI({
    apiKey: process.env.LLM_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

router.post('/', middleware, async (req, res) => {

    try {

        const { success, data } = askSchema.safeParse(req.body);

        if (!success) {
            res.status(411).json("invalid inputs");
            return;
        }

        const { query, conversationId } = data;
        //@ts-ignore 
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ message: "invalid userId" })
        }

        let conversation;
        if (conversationId) {

            conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    userId: userId
                }
            });

            if (!conversation) {
                res.status(404).json({
                    message: "conversation not found"
                });

                return;
            }
        } else {

            conversation = await prisma.conversation.create({
                data: {
                    userId: userId,
                    title: query.slice(0, 50),
                    slug: crypto.randomUUID(),

                },
            })

            await prisma.message.create({
                data: {
                    content: query,
                    role: 'USER',
                    conversationId: conversation.id,
                }
            })
        }


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

        let assistantResponse = ""
        for await (const event of response) {
            if (event.type === "response.output_text.delta") {
                assistantResponse += event.delta;
                res.write(event.delta);
            }

        }

        if (!conversation) {
            throw new Error("Conversation not found");
        }

        await prisma.message.create({
            data: {
                content: assistantResponse,
                role: "ASSISTANT",
                conversationId: conversation?.id,
            }
        })
        res.write("\n<SOURCES>\n");
        //step  7 -  also stream back the resources and followup questions(which we can get from another parallel llm call)

        for (const result of webSearchResult) {
            res.write(JSON.stringify(result.url) + "\n");
        }


        //step8 - close the event stream	
        res.write("/n </SOURCES>")
        console.log(res);
        res.end();

    } catch (e) {
        res.status(403).json(e);
    }

    //step1 - get the query from the user 



})


router.post("/perplexity_ask/followup", middleware, async (req, res) => {

    // step 1- get the existing chat from the db
    // step 2- fordward the full history to the llm
    // step 2.5- do the context engineering here 
    // step 3- stream the response to the user
})

export default router;