import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT, type Position, type Direction, type NPCDef, type EvidenceItem, type PlayerState } from './types';

const TILE_COLORS: Record<string, string> = {
  '.': '#3A3224', '#': '#1A1610', 'D': '#6B4E2E', 'd': '#4A3A20',
  'C': '#5A4A2E', 'F': '#4A6A4A', 'B': '#6B4E2E', 'T': '#5A4530',
  'W': '#2A4A6A', 'P': '#2A2420', 'R': '#6A3030', 'L': '#8A7A30',
  'S': '#4A4A4A',
};

const WALKABLE = new Set(['.', 'C', 'R', 'S']);

export function isWalkable(map: string[], x: number, y: number): boolean {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return false;
  return WALKABLE.has(map[y][x]);
}

export function drawTileMap(ctx: CanvasRenderingContext2D, map: string[], animFrame: number) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const ch = map[y][x];
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;

      // Base floor
      ctx.fillStyle = TILE_COLORS['.'];
      ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

      if (ch === '.') {
        // subtle floor variation
        if ((x + y) % 3 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.02)';
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }
        continue;
      }

      const color = TILE_COLORS[ch] || TILE_COLORS['.'];
      ctx.fillStyle = color;

      if (ch === '#') {
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        // brick pattern
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(px, py, TILE_SIZE, 1);
        ctx.fillRect(px, py + TILE_SIZE / 2, TILE_SIZE, 1);
        if (y % 2 === 0) {
          ctx.fillRect(px + TILE_SIZE / 2, py, 1, TILE_SIZE / 2);
          ctx.fillRect(px, py + TILE_SIZE / 2, 1, TILE_SIZE / 2);
        } else {
          ctx.fillRect(px, py, 1, TILE_SIZE / 2);
          ctx.fillRect(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 1, TILE_SIZE / 2);
        }
      } else if (ch === 'D') {
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      } else if (ch === 'F') {
        ctx.fillRect(px + 4, py + 2, TILE_SIZE - 8, TILE_SIZE - 4);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(px + 6, py + 6, TILE_SIZE - 12, 4);
        ctx.fillRect(px + 6, py + 14, TILE_SIZE - 12, 4);
        ctx.fillRect(px + 6, py + 22, TILE_SIZE - 12, 4);
      } else if (ch === 'W') {
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = '#3A6A9A';
        ctx.fillRect(px + 5, py + 5, TILE_SIZE - 10, TILE_SIZE - 10);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(px + 5, py + 5, (TILE_SIZE - 10) / 2 - 1, (TILE_SIZE - 10) / 2 - 1);
      } else if (ch === 'B') {
        ctx.fillRect(px + 2, py, TILE_SIZE - 4, TILE_SIZE);
        const bookColors = ['#8B1A1A', '#1A3A6A', '#2A6A2A', '#6A5A1A'];
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = bookColors[i];
          ctx.fillRect(px + 4 + i * 6, py + 2, 5, TILE_SIZE - 4);
        }
      } else if (ch === 'T') {
        ctx.fillRect(px + 1, py + 4, TILE_SIZE - 2, TILE_SIZE - 8);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(px + 2, py + 5, TILE_SIZE - 4, 2);
      } else if (ch === 'C') {
        ctx.fillStyle = '#4A3A20';
        ctx.fillRect(px + 8, py + 6, TILE_SIZE - 16, TILE_SIZE - 10);
      } else if (ch === 'P') {
        ctx.fillRect(px + 8, py, TILE_SIZE - 16, TILE_SIZE);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(px + 10, py, 2, TILE_SIZE);
      } else if (ch === 'L') {
        ctx.fillStyle = '#6A5A20';
        ctx.fillRect(px + 12, py + 8, 8, TILE_SIZE - 8);
        ctx.fillStyle = '#DDCC55';
        const glow = 4 + Math.sin(animFrame * 0.1) * 2;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(px + 16, py + 6, glow + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillRect(px + 10, py + 2, 12, 8);
      } else if (ch === 'd') {
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#8A7A40';
        ctx.fillRect(px + 4, py + 2, TILE_SIZE - 8, TILE_SIZE - 4);
        // arrow hint
        const blink = Math.sin(animFrame * 0.08) > 0;
        if (blink) {
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(px + 12, py + 8, 8, 2);
          ctx.fillRect(px + 16, py + 5, 2, 8);
          ctx.fillRect(px + 18, py + 7, 2, 4);
        }
      } else {
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

export function drawPlayer(ctx: CanvasRenderingContext2D, player: PlayerState) {
  const x = player.pixelPos.x;
  const y = player.pixelPos.y;
  const bounce = player.moving ? Math.sin(player.animTimer * 0.3) * 2 : 0;
  const py = y - bounce;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x + 6, y + 26, 20, 4);

  // Body
  ctx.fillStyle = '#2C5F2D';
  ctx.fillRect(x + 8, py + 14, 16, 12);

  // Head
  ctx.fillStyle = '#FDBCB4';
  ctx.fillRect(x + 9, py + 4, 14, 10);

  // Hat (fedora - press hat)
  ctx.fillStyle = '#5A4A2A';
  ctx.fillRect(x + 6, py + 1, 20, 5);
  ctx.fillRect(x + 8, py - 1, 16, 4);

  // Press badge
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(x + 10, py + 15, 4, 3);

  // Eyes based on direction
  ctx.fillStyle = '#1A1A1A';
  if (player.direction === 'left') {
    ctx.fillRect(x + 10, py + 7, 3, 3);
  } else if (player.direction === 'right') {
    ctx.fillRect(x + 19, py + 7, 3, 3);
  } else if (player.direction === 'up') {
    // back of head
  } else {
    ctx.fillRect(x + 11, py + 7, 3, 3);
    ctx.fillRect(x + 18, py + 7, 3, 3);
  }

  // Legs
  const legAnim = player.moving ? Math.sin(player.animTimer * 0.4) * 3 : 0;
  ctx.fillStyle = '#3A3A4A';
  ctx.fillRect(x + 10, py + 26, 5, 4 + legAnim);
  ctx.fillRect(x + 17, py + 26, 5, 4 - legAnim);
}

export function drawNPC(ctx: CanvasRenderingContext2D, npc: NPCDef, animFrame: number) {
  const x = npc.pos.x * TILE_SIZE;
  const y = npc.pos.y * TILE_SIZE;
  const hover = Math.sin(animFrame * 0.05 + npc.pos.x) * 1.5;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x + 6, y + 27, 20, 3);

  // Body
  ctx.fillStyle = npc.bodyColor;
  ctx.fillRect(x + 8, y + 14 + hover, 16, 12);

  // Head
  ctx.fillStyle = npc.skinColor;
  ctx.fillRect(x + 9, y + 4 + hover, 14, 10);

  // Hat
  ctx.fillStyle = npc.hatColor;
  ctx.fillRect(x + 7, y + 2 + hover, 18, 4);

  // Eyes
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(x + 11, y + 7 + hover, 3, 3);
  ctx.fillRect(x + 18, y + 7 + hover, 3, 3);

  // Interaction indicator
  if (!npc.talked) {
    const blink = Math.sin(animFrame * 0.1) > 0;
    if (blink) {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x + 14, y - 6 + hover, 4, 6);
      ctx.fillRect(x + 14, y - 10 + hover, 4, 2);
    }
  }
}

export function drawEvidence(ctx: CanvasRenderingContext2D, item: EvidenceItem, animFrame: number) {
  if (item.collected) return;
  const x = item.pos.x * TILE_SIZE;
  const y = item.pos.y * TILE_SIZE;
  const hover = Math.sin(animFrame * 0.08 + item.pos.x * 2) * 3;

  // Glow
  ctx.globalAlpha = 0.2 + Math.sin(animFrame * 0.06) * 0.1;
  ctx.fillStyle = item.glowColor;
  ctx.beginPath();
  ctx.arc(x + 16, y + 16 + hover, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Document icon
  ctx.fillStyle = '#F5E6C8';
  ctx.fillRect(x + 8, y + 6 + hover, 16, 20);
  ctx.fillStyle = '#8A7A5A';
  ctx.fillRect(x + 10, y + 10 + hover, 12, 2);
  ctx.fillRect(x + 10, y + 14 + hover, 10, 2);
  ctx.fillRect(x + 10, y + 18 + hover, 8, 2);

  // Sparkle
  ctx.fillStyle = item.glowColor;
  const sp = animFrame % 40;
  if (sp < 10) {
    ctx.fillRect(x + 6 + sp, y + 4 + hover, 2, 2);
  }
}

export function drawGuard(ctx: CanvasRenderingContext2D, pos: Position, animFrame: number) {
  const x = pos.x * TILE_SIZE;
  const y = pos.y * TILE_SIZE;
  const hover = Math.sin(animFrame * 0.06) * 1;

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x + 6, y + 27, 20, 3);

  ctx.fillStyle = '#1B3A5C';
  ctx.fillRect(x + 8, y + 14 + hover, 16, 12);

  ctx.fillStyle = '#D4A574';
  ctx.fillRect(x + 9, y + 4 + hover, 14, 10);

  ctx.fillStyle = '#0D1F33';
  ctx.fillRect(x + 7, y + 1 + hover, 18, 5);

  // Red eyes (alert)
  ctx.fillStyle = '#FF4444';
  ctx.fillRect(x + 11, y + 7 + hover, 3, 3);
  ctx.fillRect(x + 18, y + 7 + hover, 3, 3);

  // Vision cone hint
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#FF4444';
  ctx.fillRect(x - TILE_SIZE, y + 4, TILE_SIZE * 3, TILE_SIZE - 8);
  ctx.globalAlpha = 1;
}

export function clearCanvas(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#1A1610';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}
