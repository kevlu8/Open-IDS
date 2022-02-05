#pragma once

#include "includes.hpp"

class Person {
  public:
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
    Person(int x, int y, int immune = 0, int antivax = false, int infected = false, int dead = false);
    int getDistance(Person *person);
    void vaccinate(int doseNum);
    void changedest();
    void move();
};