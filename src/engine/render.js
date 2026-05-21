export class Renderer {
  constructor(ctx, tile, sheet) {
    this.ctx = ctx;
    this.tile = tile;
    this.sheet = sheet;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    ctx.imageSmoothingEnabled = false;
    ctx.font = '8px monospace';
    ctx.textBaseline = 'top';
  }

  clear(color = '#000') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  fillTile(tx, ty, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(tx * this.tile, ty * this.tile, this.tile, this.tile);
  }

  fillPixel(px, py, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(px, py, w, h);
  }

  // Draw a sprite spec ({ x, y, w, h }) at native pixel destination (dx, dy).
  drawSprite(spec, dx, dy) {
    if (!this.sheet || !spec) return;
    this.ctx.drawImage(this.sheet, spec.x, spec.y, spec.w, spec.h, dx, dy, spec.w, spec.h);
  }

  text(str, px, py, color = '#fff') {
    this.ctx.fillStyle = color;
    this.ctx.fillText(str, px, py);
  }
}
