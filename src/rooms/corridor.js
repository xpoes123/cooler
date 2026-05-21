// CORRIDOR — back-of-house spine. Everything hangs off this hallway.
//
// Long horizontal hall. Doors sit ON the top and bottom wall tiles; the
// player approaches from the floor tile adjacent and presses E. Convention
// matches back_office.js (doors are interactables placed on '#' tiles).
//
// Top wall (y=1) doors: back office, bar, cashier's cage.
// Bottom wall (y=12) doors: slot aisle, table games floor, poker room, bingo hall.
// Security guard paces row 6.
//
// Tile legend matches back_office.js.

const tileTypes = {
  '.': { sprite: 'tile_floor' },
  '#': { sprite: 'tile_wall', solid: true },
  '~': { sprite: 'tile_carpet' },
};

const map = [
  '################',
  '################',
  '#..............#',
  '#..~~~~~~~~~~..#',
  '#..~~~~~~~~~~..#',
  '#..~~~~~~~~~~..#',
  '#..~~~~~~~~~~..#',
  '#..~~~~~~~~~~..#',
  '#..~~~~~~~~~~..#',
  '#..~~~~~~~~~~..#',
  '#..~~~~~~~~~~..#',
  '#..............#',
  '################',
  '################',
];

const tiles = map.map(row => row.split(''));

function door(targetId, x, y) {
  return {
    x, y,
    sprite: 'tile_door',
    label: 'door',
    onInteract({ scene, sfx }) {
      if (sfx) sfx.doorOpen();
      scene.loadRoom(targetId, 'from_corridor');
    },
  };
}

export const corridor = {
  id: 'corridor',
  name: 'CORRIDOR',
  tiles,
  tileTypes,
  start: { x: 7, y: 2, facing: 'down' },
  entries: {
    // Each entry sits on a walkable tile adjacent to its corresponding door.
    from_back_office:        { x: 7, y: 2, facing: 'down' },
    from_bar:                { x: 2, y: 2, facing: 'down' },
    from_cashiers_cage:      { x: 13, y: 2, facing: 'down' },
    from_slot_aisle:         { x: 2, y: 11, facing: 'up' },
    from_table_games_floor:  { x: 6, y: 11, facing: 'up' },
    from_poker_room:         { x: 9, y: 11, facing: 'up' },
    from_bingo_hall:         { x: 13, y: 11, facing: 'up' },
  },
  interactables: [
    // Top-wall doors (y=1, on wall tiles).
    { ...door('back_office', 7, 1) },
    { ...door('bar', 2, 1) },
    { ...door('cashiers_cage', 13, 1) },

    // Bottom-wall doors (y=12, on wall tiles).
    { ...door('slot_aisle', 2, 12) },
    { ...door('table_games_floor', 6, 12) },
    { ...door('poker_room', 9, 12) },
    { ...door('bingo_hall', 13, 12) },

    // Flavor.
    {
      x: 1, y: 6,
      color: '#3c3c5c',
      label: 'time clock',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Punch clock. Slot for paper cards. Most slots empty.' },
          { text: 'A handwritten note taped above: NO MORE BREAK SWAPS. CALDERONE.' },
        ]);
      },
    },
    {
      x: 14, y: 6,
      color: '#5c2c1c',
      label: 'guard desk',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'A small folding desk. A phone face-down on a stack of incident reports.' },
          { text: 'Top report: 03:14, west aisle, subject acquired without incident. Your timestamp.' },
        ]);
      },
    },
    {
      x: 4, y: 11,
      color: '#2c2c1c',
      label: 'water cooler',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Five-gallon jug, half empty. The cone-cup dispenser is empty.' },
          { text: 'A water ring on the carpet has been there long enough to grow its own pattern.' },
        ]);
      },
    },
    {
      x: 9, y: 2,
      color: '#1c1c1c',
      label: 'ashtray',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Standing ashtray. Sand pocked with a hundred filters.' },
          { text: 'One of them is still warm. Calderone smokes Nat Shermans.' },
        ]);
      },
    },
  ],
  npcs: [
    {
      id: 'security_guard',
      x: 7, y: 6,
      facing: 'right',
      sprite: 'guard',
      spritePrefix: 'guard',  // walk-cycle prefix for the renderer
      moving: true,           // always render with walk frame so the patrol animates
      walkPhase: 0,
      // Patrol state — back-and-forth on row 6, columns 4..11.
      _t: 0,
      _phaseT: 0,
      _dir: 1,
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Guard', text: 'Mr. Pro. You are not supposed to be out here.' },
          { speaker: 'Guard', text: 'Calderone said sit tight. So go sit tight.' },
        ]);
      },
      update(dt /*, room, scene */) {
        // Walk-cycle phase ticks at 6 fps regardless of position step.
        this._phaseT += dt;
        if (this._phaseT >= 0.33) {
          this._phaseT -= 0.33;
          this.walkPhase = 1 - this.walkPhase;
        }
        // Position step every 0.7s.
        this._t += dt;
        if (this._t < 0.7) return;
        this._t = 0;
        const nextX = this.x + this._dir;
        if (nextX <= 4) {
          this.x = 4;
          this._dir = 1;
          this.facing = 'right';
        } else if (nextX >= 11) {
          this.x = 11;
          this._dir = -1;
          this.facing = 'left';
        } else {
          this.x = nextX;
        }
      },
    },
    {
      id: 'janitor_lou',
      x: 12, y: 8,
      facing: 'down',
      sprite: 'janitor_lou',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Lou', text: 'Mr. Pro. Heard about you on the radio. Sorry to hear it.' },
          { speaker: 'Lou', text: 'Vent in the back office goes up to the ceiling. Ceiling goes everywhere.' },
          { speaker: 'Lou', text: 'I did not say that. We did not talk.' },
        ]);
      },
    },
  ],
};
