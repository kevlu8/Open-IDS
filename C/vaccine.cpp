#include "vaccine.hpp"

Vaccine::Vaccine(int startTime, int developmentRate) {
    this->progress = 0;
    this->developmentStart = startTime;
    this->developmentRate = developmentRate;
    this->developmentProgress = 0;
    this->dosecount = 0;
}

void Vaccine::develop(int infectedPopPercent /*, population*/) {
    if (infectedPopPercent >= this->developmentStart) {
        if (this->developmentProgress < 100) {
            this->developmentProgress += (this->developmentRate / 5);
            // document.getElementById("vaccineprog").innerHTML = "Vaccine Progress: " + round(this->developmentProgress) + "%";
        } else {
            this->developmentProgress = 100;
            if (this->dosecount == 2) {
                return;
            } else if (this->dosecount == 0) {
                this->dosecount = 1;
                this->developmentProgress = 0;
                return;
            } else {
                this->dosecount = 2;
                return;
            }
        }
    }
}

void Vaccine::release(unordered_set<Person *> people) {
    for (Person *p : people) {
        p->vaccinate(this->dosecount);
    }
}