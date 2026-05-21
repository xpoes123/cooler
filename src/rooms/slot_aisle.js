// SLOT AISLE — narrow aisle of slot machines.
//
// Three slot stations, all gameId 'slots'. Door north back to corridor.

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

export const slotAisle = {
  id: 'slot_aisle',
  name: 'SLOT AISLE',
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
        scene.loadRoom('corridor', 'from_slot_aisle');
      },
    },
    {
      x: 8, y: 1,
      sprite: 'tile_door',
      label: 'door',
      onInteract({ scene, sfx }) {
        if (sfx) sfx.doorOpen();
        scene.loadRoom('corridor', 'from_slot_aisle');
      },
    },

    // Three slot machines (32x32 sprites, w=2 h=2).
    {
      x: 3, y: 5, w: 2, h: 2,
      sprite: 'slot',
      label: 'slot machine',
      onInteract({ scene }) { scene.enterGame('slots'); },
    },
    {
      x: 7, y: 5, w: 2, h: 2,
      sprite: 'slot',
      label: 'slot machine',
      onInteract({ scene }) { scene.enterGame('slots'); },
    },
    {
      x: 11, y: 5, w: 2, h: 2,
      sprite: 'slot',
      label: 'slot machine',
      onInteract({ scene }) { scene.enterGame('slots'); },
    },

    // Flavor.
    {
      x: 2, y: 11,
      color: '#1c1c1c',
      label: 'ashtray',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Ashtray bolted to the floor between two stools.' },
          { text: 'Seven filters, all the same brand. Someone sat here a while.' },
        ]);
      },
    },
    {
      x: 13, y: 11,
      color: '#5c2c1c',
      label: 'change cart',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Abandoned change cart. Empty plastic buckets stacked on top.' },
          { text: 'Ticket stub on the wheel: TITO printer 4, $63.25, 02:51.' },
        ]);
      },
    },
    {
      x: 7, y: 11,
      color: '#3c3c5c',
      label: 'players club kiosk',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'PLAYER\'S CLUB self-service. Insert your loyalty card.' },
          { text: 'Yours is in two pieces in the back office. Calderone made a point.' },
        ]);
      },
    },
    {
      x: 5, y: 11,
      color: '#2c2c1c',
      label: 'suspicious USB',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'A black USB stick, taped under the lip of the change cart.' },
          { text: 'No label. Whoever left it meant for someone like you to find it.' },
        ]);
      },
    },
  ],
  npcs: [
    {
      id: 'patron_track',
      x: 4, y: 7,
      facing: 'right',
      sprite: 'tracksuit',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Patron', text: 'I have been on this machine for forty minutes.' },
          { speaker: 'Patron', text: 'It owes me. They all owe me, eventually.' },
        ]);
      },
    },
    {
      id: 'patron_older',
      x: 8, y: 7,
      facing: 'right',
      sprite: 'older_woman',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Patron', text: 'I do not look at the screen anymore. The button is enough.' },
          { speaker: 'Patron', text: 'Press the button. Press the button. Press the button.' },
        ]);
      },
    },
    {
      id: 'patron_hawaii',
      x: 12, y: 7,
      facing: 'left',
      sprite: 'hawaii',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Patron', text: 'You see that guy? Floor manager.' },
          { speaker: 'Patron', text: 'He has been watching you for an hour. Just so you know.' },
        ]);
      },
    },
  ],
};
