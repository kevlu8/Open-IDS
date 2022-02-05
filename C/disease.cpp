#include "disease.hpp"

Disease::Disease(int pSpread, int pRecovery, int pDeath) {
    this->pSpread = pSpread;
    this->pRecovery = pRecovery;
    this->pDeath = pDeath;
}

void Disease::iter(unordered_set<Person *> people) {
    int infectcount = 0, deathcount = 0, vaccinecount = 0, vaccineprog = 0;
    for (Person *p : people) {
        for (Person *n : people) {
            if (p != n && p->getDistance(n) < MAXINFECTDIST) {
                p->closestNeighbours.insert(n);
            }
        }
    }
    // People is an array of class Person
    // Iterate over each person
    // Actual infection rate is calculated a s some function of distance and infection rate
    for (Person *p : people) {
        if (!p->dead) {
            p->move();
        }
        if (p->infected && !p->dead) {
            // infected person tries to infect all neighbors <- bioterrorism at it's finest
            for (Person *n : p->closestNeighbours) {
                if (!n->infected) {
                    // attempting to infect uninfected neighbor:
                    // y = -(x/MAXDIST)^2 + 1
                    // baseInfectionRate is the number when x = 0
                    // (a<b)?b:a;
                    int a = -pow(p->getDistance(n) / MAXINFECTDIST, 2) + 1;
                    // int a = -(pow(p->getDistance(n), 2)) / pow(MAXINFECTDIST, 2) + 1;
                    if (rand() % 100 <= this->pSpread * (a < 0 ? 0 : a)) {
                        if (n->immune > 1) {
                            if (rand() % 10 < 1) {
                                n->infected = true;
                            }
                        } else if (n->immune == 1) {
                            if (rand() % 10 < 3) {
                                n->infected = true;
                            }
                        } else {
                            n->infected = true;
                        }
                    }
                }
            }

            // infected person tries to recover + die + do nothing
            // unvacinated
            if (p->immune < 1) {
                int roll = rand() % 100;
                if (roll < this->pRecovery) {
                    p->infected = false;
                    p->immune = 1;
                } else if (roll > 100 - this->pDeath) {
                    p->infected = false;
                    p->dead = true;
                }
            }
            // "semi-vacinated" (allows virus to penetrate based on size) <- semi permiable lol
            else if (p->immune == 1) {
                int roll = rand() % 100;
                if (roll < this->pRecovery * 2) {
                    p->infected = false;
                } else if (roll > 100 - this->pDeath / 2) {
                    p->infected = false;
                    p->dead = true;
                }
            }
            // fully vaccinated
            else {
                int roll = rand() % 100;
                if (roll < this->pRecovery * 10) {
                    p->infected = false;
                } else if (roll > 100 - this->pDeath / 10) {
                    p->infected = false;
                    p->dead = true;
                }
            }
        }
        if (p->immune >= 1) {
            vaccinecount++;
        }
        if (p->dead) {
            deathcount++;
        } else if (p->infected) {
            infectcount++;
        }
    }
    iterationNum++;
    /*document.getElementById("iter").innerHTML = "Iteration: " + iterationNum;
    document.getElementById("infectcount").innerHTML = "Infected: " + infectcount;
    document.getElementById("deathcount").innerHTML = "Dead: " + deathcount;
    document.getElementById("vaccinecount").innerHTML = "Immune: " + vaccinecount;
    document.getElementById("vaccineprog").innerHTML = "Vaccine Progress: " + vaccineprog + "%";*/
}