// BAR — Sal's territory. Sports book wall on the east, freezer at the back.
//
// Door (south) goes back to corridor. Loading dock door (north wall) is
// flavor only — locked from the outside. Sal stands behind a long bar.

const tileTypes = {
  '.': { sprite: 'tile_floor' },
  '#': { sprite: 'tile_wall', solid: true },
  '~': { sprite: 'tile_carpet' },
};

const map = [
  '################',
  '#......##......#',
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
  '#......##......#',
  '################',
];

const tiles = map.map(row => row.split(''));

export const bar = {
  id: 'bar',
  name: 'BAR',
  tiles,
  tileTypes,
  start: { x: 8, y: 11, facing: 'up' },
  entries: {
    from_corridor: { x: 8, y: 11, facing: 'up' },
  },
  interactables: [
    // Door south — back to corridor. Sit on the row-12 wall tiles so the
    // player approaches from the row-11 walkable strip.
    {
      x: 7, y: 12,
      sprite: 'tile_door',
      label: 'door',
      onInteract({ scene, sfx }) {
        if (sfx) sfx.doorOpen();
        scene.loadRoom('corridor', 'from_bar');
      },
    },
    {
      x: 8, y: 12,
      sprite: 'tile_door',
      label: 'door',
      onInteract({ scene, sfx }) {
        if (sfx) sfx.doorOpen();
        scene.loadRoom('corridor', 'from_bar');
      },
    },

    // Loading dock door (north wall) — locked from outside.
    {
      x: 7, y: 0,
      sprite: 'tile_door',
      label: 'loading dock',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Steel fire door. LOADING DOCK stenciled at eye level.' },
          { text: 'No handle on this side. Pushes don\'t move it. Locked from out there.' },
        ]);
      },
    },
    {
      x: 8, y: 0,
      sprite: 'tile_door',
      label: 'loading dock',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Steel fire door. LOADING DOCK stenciled at eye level.' },
          { text: 'No handle on this side. Pushes don\'t move it. Locked from out there.' },
        ]);
      },
    },

    // Bar counter — long wood plank along x=4..11, row 7. Flavor.
    {
      x: 4, y: 7, w: 8, h: 1,
      color: '#3a1a10',
      label: 'bar',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Brass-railed bar, lacquer worn through where elbows live.' },
          { text: 'A water-stained ring of $412 in singles sits under the lip. Tonight\'s tips, so far.' },
        ]);
      },
    },

    // Sports book — wall-mounted TV bank along the north wall, 32x16 sprite.
    // Player approaches from row 1 (cols 10-11 are walkable floor).
    {
      x: 10, y: 0, w: 2, h: 1,
      sprite: 'prop_sportsbook',
      label: 'sports book',
      onInteract({ scene }) {
        scene.enterGame('sports_book');
      },
    },

    // Jukebox.
    {
      x: 2, y: 9,
      color: '#5c2c1c',
      label: 'jukebox',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Wall-mounted touchscreen jukebox. Promises 80,000 songs and delivers eleven.' },
          { text: 'Currently playing: a song you would never have chosen, three minutes in.' },
        ]);
      },
    },

    // Freezer door (decorative — locked).
    {
      x: 1, y: 5,
      sprite: 'tile_door',
      label: 'freezer',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Walk-in freezer. Heavy aluminum handle. Frost crusted at the seam.' },
          { text: 'Padlocked. Sal probably has the key. Or used to.' },
        ]);
      },
    },

    // ATM flavor.
    {
      x: 13, y: 11,
      color: '#3c3c5c',
      label: 'ATM',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Off-brand ATM. $7.50 surcharge. Out-of-network fee on top.' },
          { text: 'A receipt sticking out of the trash slot reads: balance $38.12.' },
        ]);
      },
    },

    // Stained chair on the carpet.
    {
      x: 5, y: 10,
      color: '#3a1a10',
      label: 'stained chair',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Vinyl bar stool. Seat cushion split, foam yellowing.' },
          { text: 'A drink ring on the carpet beneath, the diamond pattern darker where it landed.' },
        ]);
      },
    },
  ],
  npcs: [
    {
      id: 'sal',
      x: 7, y: 6,
      facing: 'down',
      sprite: 'sal',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Sal', text: 'Mr. Pro. Heard your name on the radio twice tonight.' },
          { speaker: 'Sal', text: 'I pour drinks. I do not pour information. Usually.' },
          { speaker: 'Sal', text: 'Loading dock is locked from outside. Has been since the buyout.' },
        ]);
      },
    },
    {
      id: 'patron_tipsy',
      x: 4, y: 8,
      facing: 'right',
      sprite: 'tipsy',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Patron', text: 'You ever just sit and watch the carpet for a while.' },
          { speaker: 'Patron', text: 'It moves. The pattern moves. Sal says it is the lighting.' },
          { speaker: 'Patron', text: 'Sal lies sometimes.' },
        ]);
      },
    },
    {
      id: 'patron_hawaii',
      x: 11, y: 8,
      facing: 'left',
      sprite: 'hawaii',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Patron', text: 'Beer number five. Or six.' },
          { speaker: 'Patron', text: 'Not driving. Not really walking either.' },
        ]);
      },
    },
  ],
};
