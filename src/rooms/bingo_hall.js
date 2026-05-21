// BINGO HALL — quieter back room. One bingo station + caller booth.
// Door north back to corridor.

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
  '#..............#',
  '################',
];

const tiles = map.map(row => row.split(''));

export const bingoHall = {
  id: 'bingo_hall',
  name: 'BINGO HALL',
  tiles,
  tileTypes,
  start: { x: 8, y: 2, facing: 'down' },
  entries: {
    from_corridor: { x: 8, y: 2, facing: 'down' },
  },
  interactables: [
    // Door north.
    {
      x: 7, y: 1,
      sprite: 'tile_door',
      label: 'door',
      onInteract({ scene, sfx }) {
        if (sfx) sfx.doorOpen();
        scene.loadRoom('corridor', 'from_bingo_hall');
      },
    },
    {
      x: 8, y: 1,
      sprite: 'tile_door',
      label: 'door',
      onInteract({ scene, sfx }) {
        if (sfx) sfx.doorOpen();
        scene.loadRoom('corridor', 'from_bingo_hall');
      },
    },

    // Bingo station — 32x16 sprite (2x1 footprint).
    {
      x: 7, y: 6, w: 2, h: 1,
      sprite: 'prop_bingo',
      label: 'bingo',
      onInteract({ scene }) { scene.enterGame('bingo'); },
    },

    // Caller booth — decorative.
    {
      x: 13, y: 6, w: 1, h: 3,
      color: '#5c2c1c',
      label: 'caller booth',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Glass-fronted booth. Microphone, a hopper full of numbered balls.' },
          { text: 'A coffee cup on the counter is still warm. The caller stepped out at 03:08.' },
        ]);
      },
    },

    // Flavor.
    {
      x: 2, y: 11,
      color: '#3a1a10',
      label: 'folding chair',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Stacked folding chairs against the wall. The top one has a name on tape.' },
          { text: 'It reads: SAVE FOR EILEEN. Someone scratched out EILEEN and wrote NOBODY.' },
        ]);
      },
    },
    {
      x: 13, y: 11,
      color: '#2c2c1c',
      label: 'vending machine',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Vending machine. Three kinds of pretzel, all sold out.' },
          { text: 'A handwritten note on the glass: PLEASE DO NOT SHAKE. SECURITY WATCHES.' },
        ]);
      },
    },
    {
      x: 11, y: 11,
      color: '#3c3c5c',
      label: 'lost board',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Cork lost-and-found board. Pinned: a glove, a single key, a ticket stub for $312.' },
          { text: 'A photo of a smiling man. The caption is gone. The pin is rusted in.' },
        ]);
      },
    },
    {
      x: 4, y: 12,
      color: '#5c2c1c',
      label: 'painting',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Watercolor of the casino exterior, painted from across the parking lot.' },
          { text: 'The marquee reads THE LUCKY PRO. Underneath, in pencil: SINCE 1962.' },
        ]);
      },
    },
  ],
  npcs: [
    {
      id: 'patron_older_1',
      x: 4, y: 8,
      facing: 'right',
      sprite: 'older_woman',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Patron', text: 'Mr. Pro. They called your name on the radio. I heard it twice.' },
          { speaker: 'Patron', text: 'I have been coming here since the buyout. I know what twice means.' },
        ]);
      },
    },
    {
      id: 'patron_older_2',
      x: 11, y: 8,
      facing: 'left',
      sprite: 'older_woman',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Patron', text: 'B-12, I-23, N-34. The same numbers come up every Wednesday.' },
          { speaker: 'Patron', text: 'They think we do not notice. We notice.' },
        ]);
      },
    },
    {
      id: 'patron_track',
      x: 7, y: 9,
      facing: 'down',
      sprite: 'tracksuit',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Patron', text: 'Lost six grand at the cage. Won eleven at this table.' },
          { speaker: 'Patron', text: 'Net positive. The math is the math.' },
        ]);
      },
    },
  ],
};
