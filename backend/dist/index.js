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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const core_1 = require("@tavily/core");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = (0, core_1.tavily)({ apiKey: process.env.TAVILY_API_KEY });
console.log(client);
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send("hello world!");
});
app.post('/perplexity_ask', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //step1 - get the query from the user 
    const query = req.body.query;
    //step2 -  make sure user has the access/credits to hit the endpoint
    //step3 - (TODO) check if we have web search indexed for similar query 
    //step4 -  web search to gather resources
    client.search("", {
        searchDepth: "advanced"
    })
        .then(console.log);
    //step5 - do some context engineering on the prompt + websearch responses
    //step 6 - hit the LLM and stream back the response. 
    //step  7 -  also stream back the resources and followup questions(which we can get from another parallel llm call)
    //step8 - close the event stream	  
}));
app.listen(port, () => {
    console.log(`this is our perplexity backend on ${port}`);
});
