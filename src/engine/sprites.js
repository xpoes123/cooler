// Sprite cell registry for assets/sprite_sheet.png (native 256x384).
// All cell coordinates are documented in design/README.md (sprite-sheet cell map).
// Generated entries (walk cycles, etc.) use the helpers below to keep the
// registry under control.

export const SHEET_PATH = 'assets/sprite_sheet.png';

// Standard 8-frame walk cycle layout for a character that lives on one row:
//   down-A · down-B · up-A · up-B · left-A · left-B · right-A · right-B
function walk(prefix, y) {
  const out = {};
  out[`${prefix}_walk_down_a`]  = { x:   0, y, w: 16, h: 16 };
  out[`${prefix}_walk_down_b`]  = { x:  16, y, w: 16, h: 16 };
  out[`${prefix}_walk_up_a`]    = { x:  32, y, w: 16, h: 16 };
  out[`${prefix}_walk_up_b`]    = { x:  48, y, w: 16, h: 16 };
  out[`${prefix}_walk_left_a`]  = { x:  64, y, w: 16, h: 16 };
  out[`${prefix}_walk_left_b`]  = { x:  80, y, w: 16, h: 16 };
  out[`${prefix}_walk_right_a`] = { x:  96, y, w: 16, h: 16 };
  out[`${prefix}_walk_right_b`] = { x: 112, y, w: 16, h: 16 };
  return out;
}

const glyph = (x) => ({ x, y: 256, w: 8, h: 8 });

export const SPRITES = {
  // ===== Phase 1: Protagonist + Calderone =====
  pro_down:  { x:  0, y: 0, w: 16, h: 16 },
  pro_up:    { x: 16, y: 0, w: 16, h: 16 },
  pro_left:  { x: 32, y: 0, w: 16, h: 16 },
  pro_right: { x: 48, y: 0, w: 16, h: 16 },
  calderone: { x: 64, y: 0, w: 16, h: 16 },

  // ===== Phase 1.5: NPC variety (idle facing down) =====
  sal:         { x:  80, y: 0, w: 16, h: 16 },
  janitor_lou: { x:  96, y: 0, w: 16, h: 16 },
  guard:       { x: 112, y: 0, w: 16, h: 16 },
  dealer_m:    { x: 128, y: 0, w: 16, h: 16 },
  dealer_w:    { x: 144, y: 0, w: 16, h: 16 },
  suit_guy:    { x: 160, y: 0, w: 16, h: 16 },
  older_woman: { x: 176, y: 0, w: 16, h: 16 },
  hawaii:      { x: 192, y: 0, w: 16, h: 16 },
  tracksuit:   { x: 208, y: 0, w: 16, h: 16 },
  waitress:    { x: 224, y: 0, w: 16, h: 16 },
  tipsy:       { x: 240, y: 0, w: 16, h: 16 },

  // Backwards-compat aliases for older room references
  security_guard: { x: 112, y: 0, w: 16, h: 16 },
  dealer:         { x: 128, y: 0, w: 16, h: 16 },
  lou:            { x:  96, y: 0, w: 16, h: 16 },

  // ===== Phase 1: Tiles =====
  tile_floor:  { x:  0, y: 16, w: 16, h: 16 },
  tile_wall:   { x: 16, y: 16, w: 16, h: 16 },
  tile_door:   { x: 32, y: 16, w: 16, h: 16 },
  tile_carpet: { x: 48, y: 16, w: 16, h: 16 },

  // ===== Phase 1: Slot machine =====
  slot: { x: 0, y: 32, w: 32, h: 32 },

  // ===== Phase 2: Walk cycles (rows y=96..159) =====
  ...walk('pro',          96),
  ...walk('calderone',   112),
  ...walk('guard',       128),
  ...walk('janitor_lou', 144),

  // ===== Phase 2: Game-station props (row y=160) =====
  prop_roulette:   { x:   0, y: 160, w: 32, h: 32 },
  prop_craps:      { x:  32, y: 160, w: 32, h: 16 },
  prop_baccarat:   { x:  64, y: 160, w: 32, h: 16 },
  prop_pai_gow:    { x:  96, y: 160, w: 32, h: 16 },
  prop_holdem:     { x: 128, y: 160, w: 32, h: 16 },
  prop_bingo:      { x: 160, y: 160, w: 32, h: 16 },
  prop_sportsbook: { x: 192, y: 160, w: 32, h: 16 },

  // ===== Phase 2: Room flavor tiles (row y=192) =====
  tile_bar_wood:      { x:   0, y: 192, w: 16, h: 16 },
  tile_neon_tube:     { x:  16, y: 192, w: 16, h: 16 },
  tile_vent_grate:    { x:  32, y: 192, w: 16, h: 16 },
  tile_poker_felt:    { x:  48, y: 192, w: 16, h: 16 },
  tile_red_carpet:    { x:  64, y: 192, w: 16, h: 16 },
  tile_cashier_glass: { x:  80, y: 192, w: 16, h: 16 },
  tile_bingo_lino:    { x:  96, y: 192, w: 16, h: 16 },
  tile_slot_runner:   { x: 112, y: 192, w: 16, h: 16 },

  // ===== Phase 3: Interactable props (rows y=224, y=240) =====
  prop_keycard:    { x:   0, y: 224, w: 16, h: 16 },
  prop_brass_key:  { x:  16, y: 224, w: 16, h: 16 },
  prop_poker_chip: { x:  32, y: 224, w: 16, h: 16 },
  prop_cash:       { x:  48, y: 224, w: 16, h: 16 },
  prop_dice:       { x:  64, y: 224, w: 16, h: 16 },
  prop_smoke_pack: { x:  80, y: 224, w: 16, h: 16 },
  prop_matchbook:  { x:  96, y: 224, w: 16, h: 16 },
  prop_martini:    { x: 112, y: 224, w: 16, h: 16 },
  prop_whiskey:    { x: 128, y: 224, w: 16, h: 16 },
  prop_beer:       { x: 144, y: 224, w: 16, h: 16 },
  prop_paper:      { x: 160, y: 224, w: 16, h: 16 },
  prop_clipboard:  { x: 176, y: 224, w: 16, h: 16 },
  prop_briefcase:  { x: 192, y: 224, w: 16, h: 16 },
  prop_phone:      { x: 208, y: 224, w: 16, h: 16 },
  prop_camera:     { x: 224, y: 224, w: 16, h: 16 },
  prop_keyring:    { x: 240, y: 224, w: 16, h: 16 },

  prop_butt:       { x:   0, y: 240, w: 16, h: 16 },
  prop_ashtray:    { x:  16, y: 240, w: 16, h: 16 },
  prop_blood:      { x:  32, y: 240, w: 16, h: 16 },
  prop_casing:     { x:  48, y: 240, w: 16, h: 16 },
  prop_safe:       { x:  64, y: 240, w: 16, h: 16 },
  prop_badge:      { x:  80, y: 240, w: 16, h: 16 },
  prop_newspaper:  { x:  96, y: 240, w: 16, h: 16 },
  prop_dicecup:    { x: 112, y: 240, w: 16, h: 16 },
  prop_wallet:     { x: 128, y: 240, w: 16, h: 16 },
  prop_lighter:    { x: 144, y: 240, w: 16, h: 16 },
  prop_receipt:    { x: 160, y: 240, w: 16, h: 16 },
  prop_cassette:   { x: 176, y: 240, w: 16, h: 16 },
  prop_ball:       { x: 192, y: 240, w: 16, h: 16 },
  prop_mopbucket:  { x: 208, y: 240, w: 16, h: 16 },

  // ===== Phase 4: HUD glyphs (8x8, row y=256) =====
  glyph_heart: glyph(0),
  glyph_clock: glyph(8),
  glyph_chip:  glyph(16),
  glyph_key:   glyph(24),
  glyph_eye:   glyph(32),
  glyph_alert: glyph(40),
  glyph_exit:  glyph(48),
  glyph_box:   glyph(56),
  glyph_talk:  glyph(64),
  glyph_save:  glyph(72),
  glyph_map:   glyph(80),
  glyph_cig:   glyph(88),
  glyph_lock:  glyph(96),
  glyph_note:  glyph(104),
  glyph_skull: glyph(112),
  glyph_chev:  glyph(120),

  // ===== Phase 4: Marquee logo =====
  logo: { x: 128, y: 259, w: 78, h: 10 },

  // ===== Phase 4: More walk cycles (rows y=272..335) =====
  ...walk('sal',         272),
  ...walk('dealer_m',    288),
  ...walk('older_woman', 304),
  ...walk('suit_guy',    320),
};

export function loadSheet() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('failed to load ' + SHEET_PATH));
    img.src = SHEET_PATH;
  });
}

// Helper for callers that want to pick a walk-cycle frame for a given prefix.
// `prefix` is the character key (e.g. 'pro', 'guard'); returns null if no
// walk cycle is registered.
export function walkSprite(prefix, facing, phase) {
  const name = `${prefix}_walk_${facing}_${phase ? 'b' : 'a'}`;
  return SPRITES[name] ?? null;
}
