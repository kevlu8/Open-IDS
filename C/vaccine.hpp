#include "includes.hpp"
#include "person.hpp"

class Vaccine {
  public:
    int developmentStart;
    int developmentRate;
    int developmentProgress;
    int progress;
    int dosecount;
    /**
     * @brief Creates vaccine class
     * @param startTime When does the vaccine start developing
     * @param developmentRate The rate at which the vaccine develops
     * @return None
     */
    Vaccine(int startTime, int developmentRate);
    /**
     * @brief Sets dose count of vaccine
     * @param infectedPopPercent Percent of population infected
     * @return None
     */
    void develop(int infectedPopPercent /*, population*/);
    /**
     * @brief Releases vaccines onto people
     * @param infectedPopPercent List of people to release vaccine onto
     * @return None
     */
    void release(unordered_set<Person *> people);
};