"use strict";

const FPS = 30;
const METRE = 10; //pixels
const MAXINFECTDIST = 500;
var WIDTH, HEIGHT;
var runId;

var people = [];
var infectData = [];
var deathData = [];
var immuneData = [];
var iterationNum = 0,
    infectcount = 0,
    deathcount = 0,
    vaccinecount = 0,
    vaccineprog = 0;
var currentSettings;
var disease;
var vaccine;
var endscreen;
var endText;
var endReached = false;

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
        this.dosecount = 0;
    }

    develop(infectedPopPercent /*, population*/) {
        if (infectedPopPercent >= this.developmentStart) {
            if (this.developmentProgress < 100) {
                this.developmentProgress += this.developmentRate / 5;
                document.getElementById("vaccineprog").innerHTML = "Vaccine Progress: " + Math.round(this.developmentProgress) + "%";
            } else {
                this.developmentProgress = 100;
                if (this.dosecount == 2) {
                    return;
                } else if (this.dosecount == 0) {
                    this.dosecount = 1;
                    this.developmentProgress = 0;
                    return 1;
                } else {
                    this.dosecount = 2;
                    return 2;
                }
            }
        }
    }

    release(people) {
        for (let p of people) {
            p.vaccinate(this.dosenum);
        }
    }
}

class Person {
    closestNeighbours = [];

    constructor(x, y, immune = 0, antivax = false, infected = false, dead = false) {
        this.antivax = antivax;
        this.infected = infected;
        this.immune = immune;
        this.dead = dead;
        this.x = x;
        this.y = y;
        this.destx = x;
        this.desty = y;
        this.diffx = 0;
        this.diffy = 0;
    }

    getDistance(person) {
        if (this.dead) return Infinity;
        if (person.dead) return Infinity;
        return Math.round(Math.abs(this.x - person.x) + Math.abs(this.y - person.y)) * METRE;
        // return Math.hypot(this.x - person.x, this.y - person.y); is slow
    }

    vaccinate(doseNum) {
        if (!this.infected && this.immune < doseNum && !this.antivax) {
            this.immune = doseNum;
        }
    }

    changedest() {
        let x = Math.floor(Math.random() * WIDTH);
        let y = Math.floor(Math.random() * HEIGHT);
        this.destx = x;
        this.desty = y;
        this.diffx = x - this.x;
        this.diffy = y - this.y;
        if (Math.abs(this.diffx) > 1 || Math.abs(this.diffy) > 1) {
            if (Math.abs(this.diffx) > Math.abs(this.diffy)) {
                this.diffy /= Math.abs(this.diffx);
                this.diffx /= Math.abs(this.diffx);
            } else {
                this.diffx /= Math.abs(this.diffy);
                this.diffy /= Math.abs(this.diffy);
            }
        }
    }

    move() {
        if (Math.abs(this.x - this.destx) + Math.abs(this.y - this.desty) < 1) this.changedest();
        this.x += this.diffx;
        this.y += this.diffy;
        // this.destx = x;
        // this.desty = y;
        // let canvas = document.getElementById("main");
        // let diffx, diffy = this.x - this.destx, this.y - this.desty;

        // if (this.x > canvas.width) {
        //     this.x = 0;
        // } else if (this.x < 0) {
        //     this.x = canvas.width; //this might cause them to clump up at edges but we'll see ig ONCE U PUSH KEVIN SMH
        // }
        // if (this.y > canvas.height) {
        //     this.y = 0;
        // } else if (this.y < 0) {
        //     this.y = canvas.width; //this might cause them to clump up at edges but we'll see ig ONCE U PUSH KEVIN SMH
        // }
    }
}

class Disease {
    constructor(pSpread, pRecovery, pDeath, auto = true) {
        this.pSpread = pSpread;
        this.pRecovery = pRecovery;
        this.pDeath = pDeath;
        this.auto = auto;
    }

    async iter(people) {
        (infectcount = 0), (deathcount = 0), (vaccinecount = 0), (vaccineprog = 0);
        for (let p of people) {
            if (p.dead) continue;
            for (let n of people) {
                if (n.dead) continue;
                if (p != n && p.getDistance(n) < MAXINFECTDIST) {
                    p.closestNeighbours.push(n);
                }
            }
        }
        // People is an array of class Person
        // Iterate over each person
        // Actual infection rate is calculated a s some function of distance and infection rate
        for (let i in people) {
            let p = people[i];
            if (!p.dead) {
                p.move();
                // console.log("moving");
            }
            if (p.infected && !p.dead) {
                // infected person tries to infect all neighbors <- bioterrorism at it's finest
                for (let n of p.closestNeighbours) {
                    if (!n.infected) {
                        // attempting to infect uninfected neighbor:
                        // y = -1/25x^2 + 1
                        // baseInfectionRate is the number when x = 0
                        // console.log("trying to infect");
                        if (Math.random() * 100 <= this.pSpread * Math.max(-(p.getDistance(n) ** 2 / MAXINFECTDIST ** 2) + 1, 0)) {
                            if (n.immune > 1) {
                                if (Math.random() * 10 < 1) {
                                    n.infected = true;
                                    // console.log("infected");
                                }
                            } else if (n.immune == 1) {
                                if (Math.random() * 10 < 3) {
                                    n.infected = true;
                                    // console.log("infected");
                                }
                            } else {
                                n.infected = true;
                                // console.log("infected");
                            }
                        }
                    }
                }

                // infected person tries to recover + die + do nothing
                // unvacinated
                if (p.immune < 1) {
                    let roll = Math.round(Math.random() * 100);
                    if (roll < this.pRecovery) {
                        // console.log("recovery");
                        p.infected = false;
                        p.immune = 1;
                    } else if (roll > 100 - this.pDeath) {
                        // console.log("it should die");
                        // console.log(roll + " > " + (100 - this.pDeath));
                        p.infected = false;
                        p.dead = true;
                    }
                }
                // "semi-vacinated" (allows virus to penetrate based on size) <- semi permiable lol
                else if (p.immune == 1) {
                    let roll = Math.round(Math.random() * 100);
                    if (roll < this.pRecovery * 2) {
                        // console.log("recovery");
                        p.infected = false;
                    } else if (roll > 100 - this.pDeath / 2) {
                        // console.log("it should die");
                        p.infected = false;
                        p.dead = true;
                    }
                }
                // fully vaccinated
                else {
                    let roll = Math.round(Math.random() * 100);
                    if (roll < this.pRecovery * 10) {
                        // console.log("recovery");
                        p.infected = false;
                    } else if (roll > 100 - this.pDeath / 10) {
                        // console.log("it should die");
                        p.infected = false;
                        p.dead = true;
                    }
                }
            }
            if (p.immune >= 1) {
                vaccinecount++;
            }
            if (p.dead) {
                deathcount++;
            } else if (p.infected) {
                infectcount++;
            }
        }
        iterationNum++;
        deathData.push(deathcount);
        infectData.push(infectcount);
        immuneData.push(vaccinecount);
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

function main() {
    let canvas = document.getElementById("main");
}

function init() {
    let canvas = document.getElementById("main");
    WIDTH = window.innerWidth * 0.75;
    HEIGHT = window.innerHeight * 0.9;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    document.getElementById("iter").innerHTML = "";
    document.getElementById("infectcount").innerHTML = "";
    document.getElementById("deathcount").innerHTML = "";
    document.getElementById("vaccinecount").innerHTML = "";
    document.getElementById("vaccineprog").innerHTML = "";
}

async function drawGraph(infData, deadData, immuneData) {
    // x = iterationNum
    // y = numPeople
    var xValues = [];
    for (let i = 0; i < iterationNum; i++) {
        xValues.push(i);
    }

    new Chart("finalChart", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [
                {
                    // Infected
                    data: infData,
                    borderColor: "red",
                    fill: false,
                    backgroundColor: "white",
                },
                {
                    // Deaths
                    data: deadData,
                    borderColor: "grey",
                    fill: false,
                    backgroundColor: "white",
                },
                {
                    // Immune
                    data: immuneData,
                    borderColor: "blue",
                    fill: false,
                    backgroundColor: "white",
                },
            ],
        },
        options: {
            legend: { display: false },
        },
    });
}

//starting simulation
async function startSimulation() {
    runId = (await fetch("/api/getId", { method: "GET" })).text();
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
        document.getElementById("recovery-rate").value //recovery rate
    );
    console.log(currentSettings);
    let amtAntiVax = (currentSettings.numPeople * currentSettings.antiVaxxers) / 100;
    for (let i = 1; i < currentSettings.numPeople; i++) {
        let x = Math.random() * canvas.width,
            y = Math.random() * canvas.height;

        if (i < amtAntiVax) {
            people.push(new Person(x, y, 0, true));
        } else {
            people.push(new Person(x, y, 0, false));
        }
    }

    vaccine = new Vaccine(currentSettings.vaccineDevelopedAfterXPercentInfections, currentSettings.developmentRate);
    disease = new Disease(currentSettings.baseInfectionRate, currentSettings.recoveryRate, currentSettings.deathRate);

    people[Math.floor(Math.random() * people.length)].infected = true; // Patient Zero
    // Start the simulation
    procSimulation();
}

//procing simulation
async function procSimulation() {
    let startTime = Date.now();
    //"one proc" -> one cycle (maybe allow user to see simulation in steps or smt)
    //have loop to call procs if they're too lazy to click "next" button themselves
    await disease.iter(people);
    let currentPopInf = document.getElementById("infectcount").innerHTML.split(" ")[1];
    let currentPopDead = document.getElementById("deathcount").innerHTML.split(" ")[1];
    let currentPopImmune = document.getElementById("vaccinecount").innerHTML.split(" ")[1];
    let infPercent = Math.round(((currentPopInf + currentPopDead) / people.length) * 100);

    let done = await vaccine.develop(infPercent);
    if (done > 0) {
        vaccine.release(people, done);
    }

    if (!disease.auto) return;

    disease.auto = false;
    if (currentPopInf == 0 && deathData[iterationNum] < people.length / 3) {
        document.getElementById("endscreen").innerHTML = "The virus was eradicated before it could kill 30% of the population.";
        endReached = true;
        endText = "The virus was eradicated before it could kill 30% of the population.";
    } else if (currentPopInf == 0 && deathData[iterationNum] > people.length / 2) {
        document.getElementById("endscreen").innerHTML = "The virus killed more than 50% of the population before killing all hosts";
        endReached = true;
        endText = "The virus killed more than 50% of the population before killing all hosts";
    } else if (currentPopInf == 0 && deathData[iterationNum] == people.length) {
        document.getElementById("endscreen").innerHTML = "The virus killed the entire population.";
        endReached = true;
        endText = "The virus killed the entire population.";
    } else if (currentPopImmune == people.length) {
        document.getElementById("endscreen").innerHTML = "The entire population was able to form immunity.";
        endReached = true;
        endText = "The entire population was able to form immunity.";
    } else if (currentPopInf == 0) {
        document.getElementById("endscreen").innerHTML = "It went decently, I guess?";
        endReached = true;
        endText = "It went decently, I guess?";
    } else {
        disease.auto = true;
        setTimeout(procSimulation, 1000 / FPS - Date.now() + startTime);
    }
}

// async function autoSimulate() {
//     while (disease.auto) {
//         procSimulation();
//         await sleep(1000 / currentSettings.iterSpeed);
//     }
// }

// updating drawing
new Promise(async () => {
    while (true) {
        let startTime = Date.now();
        let canvas = document.getElementById("main");
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        for (let p of people) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.min(WIDTH, HEIGHT) * 0.01, 0, 2 * Math.PI);
            if (!p.dead) {
                if (p.immune == 1) {
                    ctx.strokeStyle = "blue";
                    ctx.lineWidth = "2";
                    ctx.stroke();
                } else if (p.immune == 2) {
                    ctx.strokeStyle = "blue";
                    ctx.lineWidth = "5";
                    ctx.stroke();
                }
            }
            if (p.dead) ctx.fillStyle = "grey";
            else if (p.infected) ctx.fillStyle = "red";
            else ctx.fillStyle = "green";
            ctx.fill();
        }
        if (endReached) {
            ctx.clearRect(0, 0, WIDTH, HEIGHT);
            ctx.font = "50px Arial";
            ctx.textAlign = "center";
            ctx.fillText(endText, WIDTH / 2, HEIGHT / 2);
            //drawGraph(infectData, deathData, immuneData);
        }
        let wait = 1000 / FPS - Date.now() + startTime;
        if (wait > 1) await sleep(wait);
    }
});

document.onload = init;

// managing simulation
document.getElementById("start").addEventListener("click", () => {
    if (document.getElementById("start").innerText == "Start") {
        document.getElementById("start").innerText = "Pause";
        init();
        startSimulation();
    } else if (document.getElementById("start").innerText == "Pause") {
        document.getElementById("start").innerText = "Resume";
        disease.auto = false;
    } else if (document.getElementById("start").innerText == "Resume") {
        document.getElementById("start").innerText = "Pause";
        disease.auto = true;
        procSimulation();
    }
});

document.getElementById("next").addEventListener("click", () => {
    procSimulation();
});

document.getElementById("reset").addEventListener("click", () => {
    document.getElementById("start").innerText = "Start";
    disease.auto = false;
    endReached = false;
    init();
});

document.getElementById("graph").addEventListener("click", () => {
    document.getElementById("finalChart").hidden = false;
    drawGraph(infectData, deathData, immuneData);
});
