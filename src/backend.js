const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
app = express();

app.get("/api/getId", (req, res) => {
    try {
        let id = (Math.floor(Math.random() * 900) + 100).toString();
        while (fs.existsSync(__dirname + "/frames/" + id)) id = (Math.floor(Math.random() * 900) + 100).toString();
        res.send(id);
        fs.mkdirSync(id);
    } catch (e) {
        console.err(e);
        res.status(500);
    }
    res.end();
});

app.get("/api/finish/*", (req, res) => {
    // This is very unsafe, but it's okay for now
    exec("ffmpeg -framerate 30 -i " + req.path + "/%d.png -c:v libx264 -pix_fmt yuv420p /root/Open-IDS/src/frames/out.mp4", (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            res.status(500);
            res.end();
            return;
        } else {
            res.status(200);
        }
    });
    res.sendFile(path.join("frame", req.path.split("/")[1], ".mp4"));
    fs.rmSync(__dirname + "/frames/" + req.path.split("/")[1], { recursive: true, force: true });
});

app.post("/api/frames/*", (req, res) => {
    // Save the frame that's in req
    let body = "";
    req.on("data", (chunk) => {
        body += chunk;
    });
    req.on("end", () => {
        try {
            let num = parseInt(fs.readFileSync(__dirname + req.path + "/numFrames"), 10) + 1;
            fs.writeFileSync(__dirname + req.path + "/" + num.toString(), body);
            fs.writeFileSync(__dirname + req.path + "/numFrames", num);
        } catch (e) {
            console.log(e);
            res.status(500);
        }
    });
});

app.listen(6969, () => {
    console.log("Listening");
});
