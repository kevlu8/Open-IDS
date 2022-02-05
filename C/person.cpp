#include "person.hpp"
#include <math.h>
#include <unordered_set>

using namespace std; // .

unordered_set<Person *> closestNeighbours;
int antivax;
int infected;
int immune;
int dead;
int x;
int y;
int destx;
int desty;
int diffx;
int diffy;

Person::Person(int x, int y, int immune = 0, int antivax = false, int infected = false, int dead = false) {
    this->antivax = antivax;
    this->infected = infected;
    this->immune = immune;
    this->dead = dead;
    this->x = x;
    this->y = y;
    this->destx = x;
    this->desty = y;
    this->diffx = 0;
    this->diffy = 0;
}

int Person::getDistance(Person *person) {
    return round(abs(this->x - person->x) + abs(this->y - person->y));
    // return Math.hypot(this.x - person.x, this.y - person.y); is slow
}

void Person::vaccinate(int doseNum) {
    if (!this->infected && this->immune < doseNum && !this->antivax) {
        this->immune = doseNum;
    }
}

void Person::changedest() {
    // int x = floor(rand() % /** WIDTH*/);
    // int y = floor(rand() % /** HEIGHT*/);
    int x, y;
    this->destx = x;
    this->desty = y;
    this->diffx = x - this->x;
    this->diffy = y - this->y;
    if (abs(this->diffx) > 1 || abs(this->diffy) > 1) {
        if (abs(this->diffx) > abs(this->diffy)) {
            this->diffy /= abs(this->diffx);
            this->diffx /= abs(this->diffx);
        } else {
            this->diffx /= abs(this->diffy);
            this->diffy /= abs(this->diffy);
        }
    }
}

void Person::move() {
    if (abs(this->x - this->destx) + abs(this->y - this->desty) < 1)
        this->changedest();
    this->x += this->diffx;
    this->y += this->diffy;
}