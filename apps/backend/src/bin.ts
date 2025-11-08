import { app } from "./index";

const PORT = process.env.PORT || 3001;
app.get("/", (req, res) => {
    res.send("NexBus Backend is running");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});