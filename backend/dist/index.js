import express from 'express';
import cors from 'cors';
const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());
import askRoutes from './routes/ask.js';
import conversations from './routes/conversation.js';
app.get('/', (req, res) => {
    res.send("hello world!");
});
app.use('/ask', askRoutes);
app.use('/conversation', conversations);
app.listen(port, () => {
    console.log(`this is our perplexity backend on ${port}`);
});
