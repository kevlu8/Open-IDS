const express = require("express");
const path = require("path");
app = express();

app.set(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/script.js", (req, res) => {
    res.sendFile(path.join(__dirname, "script.js"));
});

app.get("/other.js", (req, res) => {
    res.sendFile(path.join(__dirname, "other.js"));
});

app.get("/icon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "icon.ico"));
});

app.get("/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, "style.css"));
});

app.listen(8080, () => {
    console.log("Listening");
});
