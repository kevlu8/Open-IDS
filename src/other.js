"use strict";

async function updateCount() {
    document.getElementById("iterate").innerHTML = document.getElementById("iter-rate").value;
    document.getElementById("pop").innerHTML = document.getElementById("population").value;
    document.getElementById("infect").innerHTML = document.getElementById("infection-rate").value;
    document.getElementById("vacAfter").innerHTML = document.getElementById("vaccine-after").value;
    document.getElementById("antivax").innerHTML = document.getElementById("anti-vaxxers").value;
    document.getElementById("vacRate").innerHTML = document.getElementById("vaccine-rate").value;
    document.getElementById("recover").innerHTML = document.getElementById("recovery-rate").value;
    document.getElementById("death").innerHTML = document.getElementById("death-rate").value;
    if (currentSettings != undefined) {
        currentSettings.iterSpeed = document.getElementById("iter-rate").value;
        currentSettings.numPeople = document.getElementById("population").value;
        currentSettings.baseInfectionRate = document.getElementById("infection-rate").value;
        currentSettings.vaccineDevelopedAfterXPercentInfections = document.getElementById("vaccine-after").value;
        currentSettings.antiVaxxers = document.getElementById("anti-vaxxers").value;
        currentSettings.developmentRate = document.getElementById("vaccine-rate").value;
        currentSettings.recoveryRate = document.getElementById("recovery-rate").value;
        currentSettings.deathRate = document.getElementById("death-rate").value;
    }
}

// async function sleep(ms) {
//     return new Promise((r) => setTimeout(r, ms));
// }

// async function loop() {
//     while (true) {
//         await sleep(100);
//         updateCount();
//     }
// }

async function canvasPic() {
    let canvas = document.getElementById("main");
    let data = await new Promise((r) => canvas.toBlob(r));

    fetch("/api/frames/" + runId, {
        method: "POST",
        headers: { "Content-Type": "octet-stream" },
        body: data,
    });

    let f = new FileReader();
    f.onload = (e) => console.log(e.target.result);
    f.readAsDataURL(data);
}

window.onload = updateCount;
