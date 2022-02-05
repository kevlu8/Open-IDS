#include "includes.hpp"
#include "person.hpp"

class Disease {
  public:
    int pSpread, pRecovery, pDeath;

    Disease(int pSpread, int pRecovery, int pDeath);
    void iter(unordered_set<Person *> people);
};