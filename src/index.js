const express = require("express")
const path = require("path")
app = express();

app.set(express.static("."));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
});

app.listen(8080, () => {
    console.log("Listening")
});
