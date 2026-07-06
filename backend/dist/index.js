"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const core_1 = require("@tavily/core");
const dotenv_1 = __importDefault(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
const prompt_1 = require("./prompt");
dotenv_1.default.config();
const client = (0, core_1.tavily)({ apiKey: process.env.TAVILY_API_KEY });
console.log(process.env.TAVILY_API_KEY);
console.log(client);
const app = (0, express_1.default)();
const port = 3000;
const openai = new openai_1.default({
    apiKey: process.env.LLM_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});
app.use(express_1.default.json());
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
app.post('/perplexity_ask', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //step1 - get the query from the user 
    var _a, e_1, _b, _c;
    const query = req.body.query;
    //step2 -  make sure user has the access/credits to hit the endpoint
    //step3 - (TODO) check if we have web search indexed for similar query 
    //step4 -  web search to gather resources
    const webSearchResponse = yield client.search(query, {
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
    const response = yield openai.responses.create({
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
    try {
        for (var _d = true, response_1 = __asyncValues(response), response_1_1; response_1_1 = yield response_1.next(), _a = response_1_1.done, !_a; _d = true) {
            _c = response_1_1.value;
            _d = false;
            const event = _c;
            if (event.type === "response.output_text.delta") {
                res.write(event.delta);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = response_1.return)) yield _b.call(response_1);
        }
        finally { if (e_1) throw e_1.error; }
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
}));
app.post("/perplexity_ask/followup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // step 1- get the existing chat from the db
    // step 2- fordward the full history to the llm
    // step 2.5- do the context engineering here 
    // step 3- stream the response to the user
}));
app.listen(port, () => {
    console.log(`this is our perplexity backend on ${port}`);
});
