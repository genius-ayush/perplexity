"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const core_1 = require("@tavily/core");
const dotenv_1 = __importDefault(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
const prompt_1 = require("./prompt");
dotenv_1.default.config();
const client = (0, core_1.tavily)({ apiKey: process.env.TAVILY_API_KEY });
const app = (0, express_1.default)();
const port = 3000;
require("dotenv/config");
const client_1 = require("./generated/prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
exports.prisma = new client_1.PrismaClient({ adapter });
const openai = new openai_1.default({
    apiKey: process.env.LLM_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});
app.use(express_1.default.json());
async function main() {
    const user = await exports.prisma.user.create({
        data: {
            email: "ayush@gmail.com",
            provider: "GITHUB",
            name: "Ayush",
        },
    });
    console.log(user);
}
main().catch(console.error);
app.get('/', (req, res) => {
    res.send("hello world!");
});
//Signup
app.post('/signup', (req, res) => {
});
//Signin
app.post('/singin', (req, res) => {
});
//past conversation get
app.post('/conversation', (req, res) => {
});
//past conversation get
app.post('/conversation/:conversationId', (req, res) => {
});
app.post('/perplexity_ask', async (req, res) => {
    //step1 - get the query from the user 
    const query = req.body.query;
    //step2 -  make sure user has the access/credits to hit the endpoint
    //step3 - (TODO) check if we have web search indexed for similar query 
    //step4 -  web search to gather resources
    const webSearchResponse = await client.search(query, {
        searchDepth: "advanced"
    });
    // console.log(webSearchResponse);
    const webSearchResult = webSearchResponse.results;
    // console.log(webSearchResult)
    //step5 - do some context engineering on the prompt + websearch responses
    //step 6 - hit the LLM and stream back the response. 
    const prompt = prompt_1.PROMPT_TEMPLATE
        .replace("{{WEB_SEARCH_RESULTS}}", JSON.stringify(webSearchResult))
        .replace("{{USER_QUERY}}", query);
    const response = await openai.responses.create({
        model: "openai/gpt-oss-20b",
        input: [
            {
                role: "system",
                content: prompt_1.SYSTEM_PROMPT,
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
    res.write("/n </SOURCES>");
    console.log(res);
    res.end();
});
app.post("/perplexity_ask/followup", async (req, res) => {
    // step 1- get the existing chat from the db
    // step 2- fordward the full history to the llm
    // step 2.5- do the context engineering here 
    // step 3- stream the response to the user
});
app.listen(port, () => {
    console.log(`this is our perplexity backend on ${port}`);
});
