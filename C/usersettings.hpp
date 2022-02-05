#include "includes.hpp"

class UserSettings {
  public:
    int iterSpeed;
    int numPeople;
    int baseInfectionRate;
    int vaccineDevelopedAfterXPercentInfections;
    int antiVaxxers;
    int developmentRate;
    /*socialDistance,*/
    int deathRate;
    int recoveryRate;
    UserSettings(int iterSpeed, int numPeople, int baseInfectionRate, int vaccineDevelopedAfterXPercentInfections, int antiVaxxers, int developmentRate, /*socialDistance,*/ int deathRate, int recoveryRate) {
        this->iterSpeed = iterSpeed; // How many iterations per second
        this->numPeople = numPeople; // How many people are in the simulation
        this->baseInfectionRate = baseInfectionRate; // Probability of a person being infected when they are on top of a person who is infected in percent
        this->vaccineDevelopedAfterXPercentInfections = vaccineDevelopedAfterXPercentInfections; // What percentage of people must be infected before the vaccine is developed
        this->antiVaxxers = antiVaxxers; // What percentage of people are ~~immune to the vaccine~~ refusing to take the vaccine
        this->developmentRate = developmentRate; // How much the vaccine will develop per iteration
        // this.socialDistance = socialDistance; // How far apart people are in metres
        this->deathRate = deathRate; // What percentage of people die per iteration
        this->recoveryRate = recoveryRate; // Probability of recovering per iteration
    }
};