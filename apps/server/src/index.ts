import express from "express";
import mainRouter from "./main";


const app = express();

app.get("/", (req, res) => {
    res.send("NexBus Server is running");
});

app.use("/hello", mainRouter);

app.listen(3001, () => {
    console.log("Server is running on port 3000");
});

