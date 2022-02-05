"use strict";

const FPS = 15;
var WIDTH;
var HEIGHT;

var people = [];
let iterationNum = 0;

class UserSettings {
    constructor(iterSpeed, numPeople, baseInfectionRate, vaccineDevelopedAfterXPercentInfections, antiVaxxers, developmentRate, socialDistance, deathRate /*peopleMove*/) {
        this.iterSpeed = iterSpeed; // How many iterations per second
        this.numPeople = numPeople; // How many people are in the simulation
        this.baseInfectionRate = baseInfectionRate; // Probability of a person being infected when they are on top of a person who is infected in percent
        this.vaccineDevelopedAfterXPercentInfections = vaccineDevelopedAfterXPercentInfections; // What percentage of people must be infected before the vaccine is developed
        this.antiVaxxers = antiVaxxers; // What percentage of people are ~~immune to the vaccine~~ refusing to take the vaccine
        this.developmentRate = developmentRate; // How much the vaccine will develop per iteration
        this.socialDistance = socialDistance; // How far apart people are in metres
        this.deathRate = deathRate; // What percentage of people die per iteration
        // this.peopleMove = peopleMove; // Whether people move around or not
    }
}

var currentSettings = new UserSettings(2, 9, 60, 10, true, 1, 1, 10 /* false */); // Default settings

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
        return Math.abs(this.x - person.x) + Math.abs(this.y - person.y);
        // return Math.hypot(this.x - person.x, this.y - person.y);
    }
}

class Disease {
    constructor(pSpread, pRecovery, pDeath) {
        this.pSpread = pSpread;
        this.pRecovery = pRecovery;
        this.pDeath = pDeath;
    }

    async iter(people) {
        // People is an array of class Person
        // Iterate over each person
        // Actual infection rate is calculated as some function of distance and infection rate
        for (let i in people) {
            let p = people[i];
            if (p.infected) {
                // infected person tries to infect all neighbors <- bioterrorism at it's finest
                for (let n of people.closestNeighbours) {
                    if (!n.infected) {
                        // attempting to infect uninfected neighbor:
                        // y = -1/25x^2 + 1
                        // baseInfectionRate is the number when x = 0
                        if (Math.random() * 100 <= currentSettings.pSpread * Math.max(-(x ** 2 / 25) + 1, 0)) {
                            n.infected = true;
                        }
                    }
                }

                // infected person tries to recover + die + do nothing
                let roll = Math.random() * 100;
                if (roll <= this.pRecovery) {
                    p.infected = false;
                } else if (roll >= 1 - this.pDeath) {
                    people.splice(i, 1);
                }
            }
        }
        iterationNum++;
    }
}

async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

setInterval(() => {
    let canvas = document.getElementById("main");
    let ctx = canvas.getContext("2d");
    for (let p of people) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.min(WIDTH, HEIGHT) * 0.01, 0, 2 * Math.PI);
        if (p.infected) ctx.fillStyle = "red";
        else if (p.dead) ctx.fillStyle = "black";
        else ctx.fillStyle = "green";
        ctx.fill();
    }
}, 1000 / FPS);

async function main() {
    let canvas = document.getElementById("main");
    for (let i = 0; i < currentSettings.numPeople; i++) {
        let x = Math.random() * canvas.width,
            y = Math.random() * canvas.height;
        people.push(new Person(x, y));
    }
}

async function init() {
    let canvas = document.getElementById("main");
    WIDTH = Math.min(window.innerWidth * 0.75, window.innerHeight);
    HEIGHT = Math.min(window.innerWidth * 0.75, window.innerHeight);
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
}

window.onload = init;
