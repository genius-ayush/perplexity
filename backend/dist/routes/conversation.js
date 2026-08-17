import { Router } from "express";
import { middleware } from "../middleware.js";
const router = Router();
//past conversation get
router.post('/conversation', middleware, (req, res) => {
    try {
        //@ts-ignore
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "user not found" });
        }
    }
    catch (e) {
        console.error("Create conversation error", e);
        res.status(500).json({
            message: "failed to create conversation!"
        });
    }
    //@ts-ignore 
    const userId = req.userId;
    console.log(userId);
});
router.get('/conversations', middleware, (req, res) => {
    //@ts-ignore
    console.log("reached here", req.userId);
    res.json({
        //@ts-ignore
        userId: req.userId
    });
});
//past conversation get
router.get('/conversation/:conversationId', middleware, (req, res) => {
    //@ts-ignore
    const user = req.userId;
    res.send(user);
});
export default router;
