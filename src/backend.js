const ImageDataURI = require("image-data-uri");
const { exec } = require("child_process");
const express = require("express");
const path = require("path");
const fs = require("fs");
app = express();

app.get("/api/getId", (req, res) => {
    try {
        let id = (Math.floor(Math.random() * 900000) + 100000).toString();
        while (fs.existsSync(__dirname + "/frames/" + id)) id = (Math.floor(Math.random() * 900) + 100).toString();
        res.send(id);
        fs.mkdirSync(__dirname + "/frames/" + id);
        fs.writeFileSync(__dirname + "/frames/" + id + "/numFrames", 0);
    } catch (e) {
        console.log(e);
        res.status(500);
    }
    res.end();
});

app.get("/api/delete/*", (req, res) => {
    try {
        fs.rmdirSync(__dirname + "/frames/" + req.params[0], { recursive: true, force: true });
    } catch (e) {
        console.log(e);
        res.status(500);
    }
    res.end();
});

app.get("/api/finish/*", (req, res) => {
    // This is very unsafe, but it's okay for now
    console.log(req.params[0]);
    exec("ffmpeg -framerate 15 -i " + __dirname + "/frames/" + req.params[0] + "/%d.png -b:v 8M -c:v libx264 -pix_fmt bgr24 " + __dirname + "/frames/" + req.params[0] + "/out.mp4", (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            res.status(500);
            res.end();
        } else {
            res.sendFile(__dirname + "/frames/" + req.params[0] + "/out.mp4");
        }
    });
});

app.post("/api/frames/*", (req, res) => {
    // Save the frame that's in req
    let data = "";
    req.on("data", (received) => {
        data += received;
    });
    req.on("end", () => {
        try {
            let num = parseInt(fs.readFileSync(__dirname + "/frames/" + req.params[0] + "/numFrames"), 10) + 1;
            ImageDataURI.outputFile(data, __dirname + "/frames/" + req.params[0] + "/" + num.toString() + ".png");
            fs.writeFileSync(__dirname + "/frames/" + req.params[0] + "/numFrames", num);
        } catch (e) {
            console.log(e);
            res.status(500);
        }
        res.end();
    });
});

app.listen(6969, () => {
    console.log("Listening");
});
