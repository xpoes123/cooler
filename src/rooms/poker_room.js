// POKER ROOM — VIP-feel side room. Single Hold'em table.
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
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#~~~~~~~~~~~~~~#',
  '#..............#',
  '#..............#',
  '################',
];

const tiles = map.map(row => row.split(''));

export const pokerRoom = {
  id: 'poker_room',
  name: 'POKER ROOM',
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
        scene.loadRoom('corridor', 'from_poker_room');
      },
    },
    {
      x: 8, y: 1,
      sprite: 'tile_door',
      label: 'door',
      onInteract({ scene, sfx }) {
        if (sfx) sfx.doorOpen();
        scene.loadRoom('corridor', 'from_poker_room');
      },
    },

    // Hold'em table — 32x16 sprite (2x1 footprint).
    {
      x: 7, y: 6, w: 2, h: 1,
      sprite: 'prop_holdem',
      label: 'hold em',
      onInteract({ scene }) { scene.enterGame('holdem'); },
    },

    // Flavor.
    {
      x: 2, y: 11,
      color: '#3a1a10',
      label: 'leather chair',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Tufted leather captain\'s chair. Worth more than the rest of the room.' },
          { text: 'Initials gouged into the armrest with a casino pen: D.J. \'19.' },
        ]);
      },
    },
    {
      x: 13, y: 11,
      color: '#3c3c5c',
      label: 'tournament board',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Dry-erase tournament leaderboard. Most names half-erased.' },
          { text: 'Top of last week: Tarrant, $9,840. Tarrant has not been back since.' },
        ]);
      },
    },
    {
      x: 4, y: 12,
      color: '#1c1c1c',
      label: 'tip jar',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Jar at the rail, three singles and a $5 chip. House rule: dealers pool tips.' },
          { text: 'A folded napkin in the bottom: numbers in pen, none of them rounded.' },
        ]);
      },
    },
    {
      x: 11, y: 12,
      color: '#5c2c1c',
      label: 'painting',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Oil painting of dogs playing poker. Every dog is the same dog.' },
          { text: 'The signature reads: bought wholesale, hung crooked, kept anyway.' },
        ]);
      },
    },
  ],
  npcs: [
    {
      id: 'poker_dealer',
      x: 7, y: 8,
      facing: 'up',
      sprite: 'dealer_m',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Dealer', text: 'Mr. Pro. Buy-in is $412. Cash only at this table.' },
          { speaker: 'Dealer', text: 'Hands are dealt clockwise. You sit when I tell you to sit.' },
        ]);
      },
    },
    {
      id: 'patron_hawaii',
      x: 4, y: 7,
      facing: 'right',
      sprite: 'hawaii',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Patron', text: 'Vacation. Wife thinks I am at a conference.' },
          { speaker: 'Patron', text: 'Three nights in. Conference does not have a buy-in.' },
        ]);
      },
    },
    {
      id: 'patron_suit',
      x: 11, y: 7,
      facing: 'left',
      sprite: 'suit_guy',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Patron', text: 'You played at the Borgata in oh-eight, didn\'t you.' },
          { speaker: 'Patron', text: 'No? My mistake. You all start to look the same after a while.' },
        ]);
      },
    },
  ],
};
