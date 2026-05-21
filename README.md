# cooler — *The Lucky Pro*

**Archived 2026-05-21.**

A small browser-based 8-bit retro escape-room game. You were a card counter
who got caught at a sleazy modern Pennsylvania racino at 3 AM. Goal: get
out before the floor manager and the owner come back. Realistic noir tone
— no supernatural elements, just human-scale crime, surveillance, and bad
carpet.

Tech: vanilla JavaScript + HTML + Canvas, custom tile engine, 8 explorable
rooms, 8 gambling minigames, dialogue system, inventory, save state.
Previously hosted at `cooler.djiang.xyz`.

## Why archived

In May 2026 I decided to redirect the URL to a different project (a
puzzle game called *Left to the Reader*). This codebase is preserved
here for reference — the engine work in `src/engine/` (room loading,
sprite rendering, dialogue, inventory) was substantial and may be
useful for future projects.

## Layout

```
index.html
style.css
src/
  main.js            entry point
  engine/            tile engine, dialogue, inventory, audio, sprites
  rooms/             8 casino rooms
  games/             8 gambling minigames (slots, holdem, baccarat,
                     craps, pai gow, roulette, bingo, sports book)
assets/
  sprite_sheet.png   256x320 native, ~4 colors per sprite
  wall_only.png
  carpet_only.png
```

## Run locally

```
python3 -m http.server 8000
# then open http://localhost:8000
```

ES modules require an HTTP server — don't open `file://`.
