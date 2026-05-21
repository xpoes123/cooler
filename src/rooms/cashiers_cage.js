// CASHIER'S CAGE — gate to the back half. Vault, security computer,
// hidden elevator. Door south back to corridor; elevator (north) is
// flavor only — locked from this side for now.

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

export const cashiersCage = {
  id: 'cashiers_cage',
  name: 'CASHIER\'S CAGE',
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
        scene.loadRoom('corridor', 'from_cashiers_cage');
      },
    },
    {
      x: 8, y: 12,
      sprite: 'tile_door',
      label: 'door',
      onInteract({ scene, sfx }) {
        if (sfx) sfx.doorOpen();
        scene.loadRoom('corridor', 'from_cashiers_cage');
      },
    },

    // Elevator door (north wall) — flavor only.
    {
      x: 7, y: 0,
      sprite: 'tile_door',
      label: 'elevator',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Brushed-steel elevator door. No call button on this side.' },
          { text: 'Card reader above the seam. Black light, not green. Not for you. Not yet.' },
        ]);
      },
    },
    {
      x: 8, y: 0,
      sprite: 'tile_door',
      label: 'elevator',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Brushed-steel elevator door. No call button on this side.' },
          { text: 'Card reader above the seam. Black light, not green. Not for you. Not yet.' },
        ]);
      },
    },

    // Cage counter — long bulletproof glass partition along row 7.
    {
      x: 4, y: 7, w: 8, h: 1,
      color: '#3c3c5c',
      label: 'cage counter',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Bulletproof glass, drawer slot at the bottom. Cash trays behind it.' },
          { text: 'A sign: NO TRANSACTIONS OVER $9,999 WITHOUT ID. Underlined twice.' },
        ]);
      },
    },

    // Vault door (decorative).
    {
      x: 1, y: 5,
      color: '#1a1a2e',
      label: 'vault',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Round vault door, six-spoke wheel. Combination dial in the center.' },
          { text: 'Closed. Heavy enough that closed is a permanent state without the sequence.' },
        ]);
      },
    },

    // Security computer.
    {
      x: 14, y: 5,
      color: '#2c6c6c',
      label: 'security PC',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Old beige tower humming under the counter. Monitor on a swivel arm.' },
          { text: 'Lock screen prompts for FLOOR_MGR. Cursor blinks. Patient as a cat.' },
        ]);
      },
    },

    // Flavor.
    {
      x: 2, y: 11,
      color: '#5c2c1c',
      label: 'tip jar',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Tip jar. CASHIERS APPRECIATE YOU written in marker.' },
          { text: '$4.12 in coins. Carpet pattern visible through the bottom of the jar.' },
        ]);
      },
    },
    {
      x: 13, y: 11,
      color: '#3a1a10',
      label: 'photo frame',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Framed photo behind the counter. Six employees, smiling, ribbon-cutting.' },
          { text: 'Date plaque: GRAND REOPENING 2019. Two of the six faces have been crossed out in pen.' },
        ]);
      },
    },
    {
      x: 11, y: 11,
      color: '#2c2c1c',
      label: 'shredder',
      onInteract({ dialogue }) {
        dialogue.show([
          { text: 'Industrial cross-cut shredder. Bin two-thirds full.' },
          { text: 'A strip on top reads: ...SELF-EXCLUSION REQ... ...DENIED... ...CALDERONE...' },
        ]);
      },
    },
  ],
  npcs: [
    {
      id: 'cage_dealer',
      x: 7, y: 6,
      facing: 'down',
      sprite: 'dealer_w',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Cashier', text: 'Mr. Pro. Cage is closed. Comp tickets only after 3 AM.' },
          { speaker: 'Cashier', text: 'I cannot help you. Whatever you came for, I cannot help.' },
        ]);
      },
    },
    {
      id: 'cage_guard',
      x: 9, y: 6,
      facing: 'down',
      sprite: 'guard',
      onInteract({ dialogue }) {
        dialogue.show([
          { speaker: 'Guard', text: 'You should not be in here, Mr. Pro.' },
          { speaker: 'Guard', text: 'Calderone is on his way. Sit. Stand. Do whatever. Just be here when he gets here.' },
        ]);
      },
    },
  ],
};
