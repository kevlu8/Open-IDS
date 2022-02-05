#include "disease.hpp"
#include "person.hpp"
#include "usersettings.hpp"
#include "vaccine.hpp"
#include <SDL.h>

void *paint(void *) {
    return NULL;
}

int main() {
    SDL_Init(SDL_INIT_VIDEO);
    SDL_Window *window = SDL_CreateWindow("Open-IDS", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, 0, 0, SDL_WINDOW_FULLSCREEN_DESKTOP | SDL_WINDOW_MAXIMIZED);
    SDL_Renderer *renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);
    SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
    SDL_RenderClear(renderer);

    pthread_t thread;
    pthread_create(&thread, NULL, paint, NULL);

    SDL_Event e;
    bool quit = false;
    // Event loop
    while (!quit) {
        SDL_PollEvent(&e);
        switch (e.type) {
        case SDL_QUIT:
            quit = true;
            break;
        default:
            break;
        }
    }
}