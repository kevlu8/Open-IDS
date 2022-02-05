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
    async async constructor(pSpread, pRecovery, pDeath) {
        this.pSpread = pSpread;
        this.pRecovery = pRecovery;
        this.pDeath = pDeath;
    }

    async function iter(People) {
        // People is an array of class Person
        // Iterate over each person
        for (let i = 0; i < People.length(); i++) {
            
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
  let canvas = document.getElementById("main");
  let ctx = canvas.getContext("2d");
  ctx.fillRect(0, 0, 100, 100);
}

window.onload = main;
