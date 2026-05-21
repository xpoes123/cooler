// TABLE GAMES FLOOR — open floor, four game stations side-by-side.
// Roulette, Craps, Baccarat, Pai Gow. Door north back to corridor.

const tileTypes = {
  '.': { sprite: 'tile_floor' },
  '#': { sprite: 'tile_wall', solid: true },
  '~': { sprite: 'tile_carpet' },
};

const map = [
  '################',
  '#......##......#',
  '#..............#',
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#..............#',
  '################',
];

const tiles = map.map(row => row.split(''));

export const tableGamesFloor = {
  id: 'table_games_floor',
  name: 'TABLE GAMES FLOOR',
  tiles,
  tileTypes,
  start: { x: 8, y: 2, facing: 'down' },
  entries: {
    from_corridor: { x: 8, y: 2, facing: 'down' },
  },
  interactables: [
    // Door north — back to corridor.
    {
      x: 7, y: 1,
      sprite: 'tile_door',
      label: 'door',
      onInteract({ scene, sfx }) {
        if (sfx) sfx.doorOpen();
        scene.loadRoom('corridor', 'from_table_games_floor');
      },
    },
    {
      x: 8, y: 1,
      sprite: 'tile_door',
      label: 'door',
      onInteract({ scene, sfx }) {
        if (sfx) sfx.doorOpen();
        scene.loadRoom('corridor', 'from_table_games_floor');
      },
    },

    // Four game stations across row 6-7. Real sprites from the v2 design.
    // Roulette wheel is 32x32 (2x2 footprint); the other tables are 32x16
    // (2x1 footprint) — players can walk underneath them.
    {
      x: 1, y: 6, w: 2, h: 2,
      sprite: 'prop_roulette',
      label: 'roulette',
      onInteract({ scene }) { scene.enterGame('roulette'); },
    },
    {
      x: 5, y: 6, w: 2, h: 1,
      sprite: 'prop_craps',
      label: 'craps',
      onInteract({ scene }) { scene.enterGame('craps'); },
    },
    {
      x: 9, y: 6, w: 2, h: 1,
      sprite: 'prop_baccarat',
      label: 'baccarat',
      onInteract({ scene }) { scene.enterGame('baccarat'); },
    },
    {
      x: 13, y: 6, w: 2, h: 1,
      sprite: 'prop_pai_gow',
      label: 'pai gow',
      onInteract({ scene }) { scene.enterGame('pai_gow'); },
    },

    // Flavor.
    {
      x: 3, y: 12,
      color: '#1c1c1c',
      label: 'comp drink',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'A half-finished vodka soda on a cocktail napkin.' },
          { text: 'Lipstick on the rim. The napkin reads: room 412 if you survive.' },
        ]);
      },
    },
    {
      x: 8, y: 12,
      color: '#3a1a10',
      label: 'pit boss podium',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Small lectern with a chip rack and a clipboard.' },
          { text: 'Top sheet, last entry: Mr. Pro, table 7, 02:34. Three flag icons in a row.' },
        ]);
      },
    },
    {
      x: 12, y: 12,
      color: '#3c3c5c',
      label: 'photo wall',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Framed photos of past jackpot winners. All smiling. All holding the same oversize check.' },
          { text: 'The dates skip 2019 entirely. The frame for that year is empty.' },
        ]);
      },
    },
  ],
  npcs: [
    {
      id: 'dealer_13',
      x: 9, y: 8,
      facing: 'up',
      sprite: 'dealer_w',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Dealer', text: 'Mr. Pro. Table is open. House rules are posted.' },
          { speaker: 'Dealer', text: 'No conferring, no marking, no counting. You know the last one.' },
        ]);
      },
    },
    {
      id: 'patron_suit',
      x: 5, y: 8,
      facing: 'up',
      sprite: 'suit_guy',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Patron', text: 'Up four hundred. Down twelve. Net negative if you ask the IRS.' },
          { speaker: 'Patron', text: 'But who is asking the IRS at three in the morning.' },
        ]);
      },
    },
    {
      id: 'patron_waitress',
      x: 13, y: 9,
      facing: 'left',
      sprite: 'waitress',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Waitress', text: 'Mr. Pro. Comp drink, room 412. Calderone said put it on his tab.' },
          { speaker: 'Waitress', text: 'I would not drink it.' },
        ]);
      },
    },
  ],
};
