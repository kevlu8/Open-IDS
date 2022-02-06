const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
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
    exec("ffmpeg -framerate 30 -i " + __dirname + "/frames/" + req.params[0] + "/%d.png -c:v libx264 -pix_fmt yuv420p " + __dirname + "/frames/" + req.params[0] + "/out.mp4", (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            res.status(500);
            res.end();
            return;
        } else {
            res.status(200);
        }
    });
    res.sendFile(__dirname + "/frames/" + req.params[0] + "/out.mp4");
});

app.post("/api/frames/*", (req, res) => {
    // Save the frame that's in req
    let body = "";
    req.on("data", (chunk) => {
        body += chunk;
    });

    req.on("end", () => {
        try {
            console.log(Buffer(body).toString("base64"));
            let num = parseInt(fs.readFileSync(__dirname + "/frames/" + req.params[0] + "/numFrames"), 10) + 1;
            fs.writeFileSync(__dirname + "/frames/" + req.params[0] + "/" + num.toString() + ".png", body);
            fs.writeFileSync(__dirname + "/frames/" + req.params[0] + "/numFrames", num);
        } catch (e) {
            console.log(e);
            res.status(500);
        }
    });
    res.end();
});

app.listen(6969, () => {
    console.log("Listening");
});
