var people = [];

class Person {
    async constructor(x, y, infected=false, immune=false) {
        this.infected = infected;
        this.immune = immune;
        this.x = x;
        this.y = y;
    }
}

class Disease {
    async constructor(pSpread, pRecovery, pDeath) {
        this.pSpread = pSpread;
        this.pRecovery = pRecovery;
        this.pDeath = pDeath;
    }

    async iter(people) {
        // People is an array of class Person
        // Iterate over each person
        // Actual infection rate is calculates as some function of distance + infection rate
        for (let i = 0; i < people.length(); i++) {
            if (people[i].infected) {
                
            }
        }
    }
}

async function sleep(ms) {
    setTimeout()
}

async function render() {

}

async function main() {
  let canvas = document.getElementById("main");
  canvas.width = window.clientWidth;
  canvas.height = window.clientHeight;
}

window.onload = main;

window.onload = main;
