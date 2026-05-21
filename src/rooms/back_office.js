// BACK OFFICE — start room. The Pro wakes up here.
//
// Tile legend:
//   . floor (linoleum strip near the walls)
//   # wall (slate brick)
//   ~ casino carpet (the bad one — purple/yellow/red diamonds)

const tileTypes = {
  '.': { sprite: 'tile_floor' },
  '#': { sprite: 'tile_wall', solid: true },
  '~': { sprite: 'tile_carpet' },
};

const map = [
  '################',
  '#..............#',
  '#..............#',
  '#..............#',
  '#..~~~~~~~~~~..#',
  '#..~~~~~~~~~~..#',
  '#..~~~~~~~~~~..#',
  '#..~~~~~~~~~~..#',
  '#..~~~~~~~~~~..#',
  '#..~~~~~~~~~~..#',
  '#..~~~~~~~~~~..#',
  '#..............#',
  '#......##......#',
  '################',
];

const tiles = map.map(row => row.split(''));

function exitToCorridor({ scene, sfx }) {
  if (sfx) sfx.doorOpen();
  scene.loadRoom('corridor', 'from_back_office');
}

export const backOffice = {
  id: 'back_office',
  name: 'BACK OFFICE',
  tiles,
  tileTypes,
  start: { x: 7, y: 8, facing: 'down' },
  entries: {
    from_corridor: { x: 7, y: 11, facing: 'up' },
  },
  interactables: [
    {
      x: 2, y: 2, w: 2, h: 1,
      color: '#5c2c1c',
      label: 'desk',
      onInteract({ dialogue, sfx }) {
        if (sfx) sfx.pickup();
        dialogue.show([
          { text: 'A cluttered desk. Coffee mug, comp tickets, a stained logbook.' },
          { text: 'Top drawer is half-open. Inside: a small flathead screwdriver. You pocket it.' },
        ]);
      },
    },
    {
      x: 2, y: 3,
      color: '#3a1a10',
      label: 'chair',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Office chair. Leather worn through to foam in the seat.' },
          { text: 'You decide not to sit. Calderone could be back any minute.' },
        ]);
      },
    },
    {
      x: 6, y: 1,
      color: '#1a1a2e',
      label: 'wall safe',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Wall safe, dial lock. Sticky from a thousand sweaty hands.' },
          { text: 'You spin it once for luck. Of course nothing happens.' },
        ]);
      },
    },
    {
      x: 9, y: 1,
      color: '#2c6c6c',
      label: 'security monitor',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'A small monitor cycles between camera feeds.' },
          { text: 'CAM 04: the bar. Sal is wiping a glass that is already clean.' },
          { text: 'CAM 07: the floor. Two pit bosses talking near table 13.' },
          { text: 'CAM 12: this room. You see yourself, looking at a monitor of yourself.' },
        ]);
      },
    },
    {
      x: 12, y: 2, w: 2, h: 2,
      sprite: 'slot',
      label: 'broken slot',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Tag', text: 'OUT OF ORDER. Reels jammed on triple bar. Reset key in the cage.' },
          { text: 'The reels are stopped on bar-bar-bar. A jackpot, frozen in place.' },
          { text: 'Carpet is soaked under the coin tray. Someone got close.' },
        ]);
      },
    },
    {
      x: 13, y: 11,
      color: '#3c3c5c',
      label: 'filing cabinet',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Four-drawer steel filing cabinet. Three are locked. The middle one rattles.' },
          { text: 'Inside: a stack of self-exclusion forms. Top one is dated last Tuesday. Name redacted.' },
        ]);
      },
    },
    // Doors — both exit to the corridor for now (puzzle gating tomorrow).
    {
      x: 7, y: 12,
      sprite: 'tile_door',
      label: 'door',
      onInteract: exitToCorridor,
    },
    {
      x: 8, y: 12,
      sprite: 'tile_door',
      label: 'door',
      onInteract: exitToCorridor,
    },
  ],
};
