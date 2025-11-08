import Router from "express";

const router = Router();

router.get("/", (req, res) => {
    res.send("NexBus Server is running");
});

export default router;