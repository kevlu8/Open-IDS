"use strict";

const FPS = 30;
const METRE = 10; //pixels
const MAXINFECTDIST = 500;
let WIDTH, HEIGHT;

let people = [];
let iterationNum = 0, infectcount = 0, deathcount = 0, vaccinecount = 0, vaccineprog = 0;
let currentSettings;
let diseas;
let vaccine;
let dosecount = 0;

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
                document.getElementById("vaccineprog").innerHTML = "Vaccine Progress: " + Math.round(this.developmentProgress) + "%";
            } else {
                this.developmentProgress = 100;
                if (dosecount == 0) {
                    dosecount++;
                    this.developmentProgress = 0;
                    return 1;
                }
                else {
                    dosecount++;
                    return 2;
                }
            }
        }
    }

    release(people, dosenum) {
        for (let p of people) {
            p.vaccinate(dosenum);
        }
    }
}

class Person {
    closestNeighbours = [];

    constructor(x, y, immune, antivax = false, infected = false, dead = false) {
        this.antivax = antivax;
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

    vaccinate(doseNum) {
        if (!this.infected && this.immune < doseNum && !this.antivax) {
            this.immune = doseNum;
        }
    }

    move() {
        let canvas = document.getElementById("main");
        this.x += Math.random() * 2 - 1;
        this.y += Math.random() * 2 - 1;
        if (this.x > canvas.width) {
            x = 0;
        } else if (this.x < 0) {
            x = canvas.width; //this might cause them to clump up at edges but we'll see ig ONCE U PUSH KEVIN SMH
        }
        if (this.y > canvas.height) {
            y = 0;
        } else if (this.y < 0) {
            y = canvas.width; //this might cause them to clump up at edges but we'll see ig ONCE U PUSH KEVIN SMH
        }
    }
}

class Disease {
    constructor(pSpread, pRecovery, pDeath, auto=true) {
        this.pSpread = pSpread;
        this.pRecovery = pRecovery;
        this.pDeath = pDeath;
        this.auto = auto;
    }

    async iter(people) {
        infectcount = 0, deathcount = 0, vaccinecount = 0, vaccineprog = 0;
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
                        console.log("trying to infect");
                        console.log(this.pSpread * Math.max(-(p.getDistance(n) ** 2 / (MAXINFECTDIST ** 2)) + 1, 0));
                        if (Math.random() * 100 <= this.pSpread * Math.max(-(p.getDistance(n) ** 2 / (MAXINFECTDIST ** 2)) + 1, 0)) {
                            n.infected = true;
                            console.log("infected");
                        }
                    }
                }
                // infected person tries to recover + die + do nothing
                if (p.immune < 1) {
                    let roll = Math.round(Math.random() * 100); 
                    if (roll < this.pRecovery) {
                        console.log("recovery")
                        p.infected = false;
                        p.immune = 1;
                    } else if (roll >= (100 - this.pDeath)) {
                        console.log("it should die");
                        p.infected = false;
                        p.dead = true;
                    }
                }
                else if (p.immune == 1) {
                    let roll = Math.round(Math.random() * 100);
                    if (roll < this.pRecovery * 2) {
                        console.log("recovery")
                        p.infected = false;
                    } else if (roll >= (100 - (this.pDeath / 2))) {
                        console.log("it should die");
                        p.infected = false;
                        p.dead = true;
                    }
                }
                else {
                    let roll = Math.round(Math.random() * 100);
                    if (roll < this.pRecovery * 3) {
                        console.log("recovery")
                        p.infected = false;
                    } else if (roll >= (100 - (this.pDeath / 4))) {
                        console.log("it should die");
                        p.infected = false;
                        p.dead = true;
                    }
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
        document.getElementById("vaccineprog").innerHTML = "Vaccine Progress: " + vaccineprog + "%";
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
    WIDTH = window.innerWidth * 0.9;
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
async function startSimulation() {
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
        //document.getElementById("vaccine-after").value, //social distancing
        document.getElementById("death-rate").value, //death rate
        document.getElementById("recovery-rate").value, //recovery rate
    );
    let amtAntiVax = currentSettings.numPeople * currentSettings.antiVaxxers / 100;
    for (let i = 1; i < currentSettings.numPeople; i++) {
        let x = Math.random() * canvas.width,
            y = Math.random() * canvas.height;

        if (i < amtAntiVax) {
            people.push(new Person(x, y, 0, true));
        } else {
            people.push(new Person(x, y, 0, false));
        }
    }

    for (let p of people) {
        for (let n of people) {
            if (p != n && p.getDistance(n) < MAXINFECTDIST) {
                p.closestNeighbours.push(n);
            }
        }
    }

    vaccine = new Vaccine(currentSettings.vaccineDevelopedAfterXPercentInfections, currentSettings.developmentRate);
    diseas = new Disease(currentSettings.baseInfectionRate, currentSettings.recoveryRate, currentSettings.deathRate);

    people[Math.round(Math.random() * people.length)].infected = true; // Patient Zero
    // Start the simulation
    autoSimulate();
}

//procing simulation
async function procSimulation() {
    //"one proc" -> one cycle (maybe allow user to see simulation in steps or smt)
    //have loop to call procs if they're too lazy to click "next" button themselves
    await diseas.iter(people);
    let currentPopInf = document.getElementById("infectcount").innerHTML.split(" ")[1];
    let infPercent = Math.round(currentPopInf / people.length * 100);
    
    let done = await vaccine.develop(infPercent);
    if (done > 0) {
        vaccine.release(people, done);
    }
}

async function autoSimulate() {
    while (diseas.auto) {
        await sleep(1000 / currentSettings.iterSpeed);
        procSimulation();
    }
}

//updating drawing
setInterval(() => {
    let canvas = document.getElementById("main");
    let ctx = canvas.getContext("2d");
    for (let p of people) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.min(WIDTH, HEIGHT) * 0.01, 0, 2 * Math.PI);
        if (p.dead) ctx.fillStyle = "grey";
        else if (p.infected) ctx.fillStyle = "red";
        else ctx.fillStyle = "green";
        ctx.fill();
    }
}, 1000 / FPS);

window.onload = init;

//managing simulation
document.getElementById("start").addEventListener("click", () => {
    if (document.getElementById("start").innerText == "Start") {
        document.getElementById("start").innerText = "Pause";
        init();
        startSimulation();
    } else if (document.getElementById("start").innerText == "Pause") {
        document.getElementById("start").innerText = "Resume";
        diseas.auto = false;
    } else if (document.getElementById("start").innerText == "Resume") {
        document.getElementById("start").innerText = "Pause";
        diseas.auto = true;
        autoSimulate();
    }
});

document.getElementById("next").addEventListener("click", () => {
    procSimulation();
});

document.getElementById("reset").addEventListener("click", () => {
    document.getElementById("start").innerText = "Start";
    diseas.auto = false;
    init();
});