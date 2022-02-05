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
}

async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function loop() {
    while (true) {
        await sleep(100);
        updateCount();
    }
}

window.onload = loop;