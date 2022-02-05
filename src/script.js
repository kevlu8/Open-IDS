"use strict";

const FPS = 15;
const MAXINFECTDIST = 10; // (5, 5) = sqrt(50) in euclidean distance but 10 in manhattan distance
const METRE = 20; //pixels
let WIDTH, HEIGHT;

let people = [];
let iterationNum = 0, infectcount = 0, deathcount = 0, vaccinecount = 0, vaccineprog = 0;
let currentSettings;
let diseas;
let vaccine;

class UserSettings {
    constructor(iterSpeed, numPeople, baseInfectionRate, vaccineDevelopedAfterXPercentInfections, antiVaxxers, developmentRate, /*socialDistance,*/ deathRate, recoveryRate /*peopleMove*/) {
        this.iterSpeed = iterSpeed; // How many iterations per second
        this.numPeople = numPeople; // How many people are in the simulation
        this.baseInfectionRate = baseInfectionRate; // Probability of a person being infected when they are on top of a person who is infected in percent
        this.vaccineDevelopedAfterXPercentInfections = vaccineDevelopedAfterXPercentInfections; // What percentage of people must be infected before the vaccine is developed
        this.antiVaxxers = antiVaxxers; // What percentage of people are ~~immune to the vaccine~~ refusing to take the vaccine
        this.developmentRate = developmentRate; // How much the vaccine will develop per iteration
        //this.socialDistance = socialDistance; // How far apart people are in metres
        this.deathRate = deathRate; // What percentage of people die per iteration
        this.recoveryRate = recoveryRate; // Probability of recovering per iteration
        // this.peopleMove = peopleMove; // Whether people move around or not
    }
}

class Vaccine {
    constructor(startTime, developmentRate) {
        this.progress = 0;
        this.developmentStart = startTime;
        this.developmentRate = developmentRate;
        this.developmentProgress = 0;
    }

    develop(infectedPopPercent /*, population*/) {
        if (infectedPopPercent >= this.developmentStart) {
            if (this.developmentProgress < 100) {
                this.developmentProgress += (this.developmentRate / 5);
            } else {
                this.developmentProgress = 100;
            }
        }
        return 0;
    }
}

class Person {
    closestNeighbours = [];

    constructor(x, y, infected = false, immune = false, dead = false) {
        this.infected = infected;
        this.immune = immune;
        this.dead = dead;
        this.x = x;
        this.y = y;
    }

    getDistance(person) {
        return Math.round(Math.abs(this.x - person.x) + Math.abs(this.y - person.y)) * METRE;
        // return Math.hypot(this.x - person.x, this.y - person.y); is slow
    }
}

class Disease {
    constructor(pSpread, pRecovery, pDeath) {
        this.pSpread = pSpread;
        this.pRecovery = pRecovery;
        this.pDeath = pDeath;
    }

    async iter(people) {
        infectcount = 0;
        // People is an array of class Person
        // Iterate over each person
        // Actual infection rate is calculated as some function of distance and infection rate
        for (let i in people) {
            let p = people[i];
            if (p.infected && !p.dead) {
                // infected person tries to infect all neighbors <- bioterrorism at it's finest
                for (let n of p.closestNeighbours) {
                    if (!n.infected) {
                        // attempting to infect uninfected neighbor:
                        // y = -1/25x^2 + 1
                        // baseInfectionRate is the number when x = 0
                        console.log(currentSettings.pSpread * Math.max(-(p.getDistance(n) ** 2 / 25) + 1, 0))
                        if (Math.random() * 100 <= currentSettings.pSpread * Math.max(-(p.getDistance(n) ** 2 / 25) + 1, 0)) {
                            n.infected = true;
                        }
                    }
                }

                // infected person tries to recover + die + do nothing
                if (!p.immune) {
                    let roll = Math.random() * 100;
                    if (roll <= this.pRecovery) {
                        p.infected = false;
                        p.immune = true;
                    } else if (roll >= 100 - this.pDeath) {
                        people.splice(i, 1);
                    }
                }
                else {
                    let roll = Math.random() * 100;
                    if (roll <= this.pRecovery * 2) {
                        p.infected = false;
                    } else if (roll >= 100 - (this.pDeath / 2)) {
                        people.splice(i, 1);
                    }
                    vaccinecount++;
                }
                infectcount++;
            }
            else if (p.dead) {
                deathcount++;
            }
        }
        iterationNum++;
        document.getElementById("iter").innerHTML = "Iteration: " + iterationNum;
        document.getElementById("infectcount").innerHTML = "Infected: " + infectcount;
        document.getElementById("deathcount").innerHTML = "Dead: " + deathcount;
        document.getElementById("vaccinecount").innerHTML = "Immune: " + vaccinecount;
        document.getElementById("vaccineprog").innerHTML = "Vaccine Progress: " + vaccinecount;
    }
}

//utility ig
async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function main() {
    let canvas = document.getElementById("main");
}

async function init() {
    let canvas = document.getElementById("main");
    WIDTH = window.innerWidth * 0.8;
    HEIGHT = window.innerHeight * 0.9;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    document.getElementById("iter").innerHTML = "";
    document.getElementById("infectcount").innerHTML = "";
    document.getElementById("deathcount").innerHTML = "";
    document.getElementById("vaccinecount").innerHTML = "";
    document.getElementById("vaccineprog").innerHTML = "";
}

//starting simulation
async function startSimulation(stop=false) {
    let canvas = document.getElementById("main");
    people = [];
    iterationNum = 0;
    currentSettings = new UserSettings(
        document.getElementById("iter-rate").value, //iter speed
        document.getElementById("population").value, //population
        document.getElementById("infection-rate").value, //infection rate
        document.getElementById("vaccine-after").value, //vaccine development start
        document.getElementById("anti-vaxxers").value, //antivaxxers
        document.getElementById("vaccine-rate").value, //vaccine develepment rate
        document.getElementById("vaccine-after"), //social distancing
        document.getElementById("death-rate").value, //death rate
        document.getElementById("recovery-rate").value //recovery rate
    );

    for (let i = 0; i < currentSettings.numPeople; i++) {
        let x = Math.random() * canvas.width,
            y = Math.random() * canvas.height;
        people.push(new Person(x, y));
    }

    for (let p of people) {
        p.closestNeighbours.push(people.filter(n => n.getDistance(p) < MAXINFECTDIST));
    }

    vaccine = new Vaccine(currentSettings.vaccineDevelopedAfterXPercentInfections, currentSettings.developmentRate);
    diseas = new Disease(currentSettings.baseInfectionRate, currentSettings.recoveryRate, currentSettings.deathRate);

    people[Math.round(Math.random() * people.length)].infected = true; // Patient Zero
    // Start the simulation
    let sleepTime = 1000 / currentSettings.iterSpeed;
    
    while (!stop) {
        await sleep(sleepTime);
        await diseas.iter(people);
        await vaccine.develop(currentSettings.vaccineDevelopedAfterXPercentInfections, currentSettings.developmentRate);
        //await draw();
    }
}

//procing simulation
async function procSimulation() {
    //"one proc" -> one cycle (maybe allow user to see simulation in steps or smt)
    //have loop to call procs if they're too lazy to click "next" button themselves
    await diseas.iter(people);
    await vaccine.develop(currentSettings.vaccineDevelopedAfterXPercentInfections, currentSettings.developmentRate);
}

document.getElementById("start").addEventListener("click", () => {
    if (document.getElementById("start").innerText == "Start") {
        document.getElementById("start").innerText = "Stop";
        init();
        startSimulation();
    } else {
        document.getElementById("start").innerText = "Start";
        startSimulation(true);
        init();
    }
});

//updating drawing
setInterval(() => {
    let canvas = document.getElementById("main");
    let ctx = canvas.getContext("2d");
    for (let p of people) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.min(WIDTH, HEIGHT) * 0.01, 0, 2 * Math.PI);
        if (p.immune) ctx.strokeStyle = "blue";
        else ctx.strokeStyle = "black";
        if (p.infected) ctx.fillStyle = "red";
        else if (p.dead) ctx.fillStyle = "black";
        else ctx.fillStyle = "green";
        ctx.fill();
    }
}, 1000 / FPS);

window.onload = init;
