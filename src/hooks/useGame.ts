import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAPTERS } from '../game/data';
import { TILE_SIZE, type GamePhase, type GameState, type PlayerState, type Direction, type DialogueLine, type GameSave } from '../game/types';
import { isWalkable, clearCanvas, drawTileMap, drawPlayer, drawNPC, drawEvidence, drawGuard } from '../game/renderer';
import { audio } from '../game/audio';

const SAVE_KEY = 'watergate_files_save';
const MOVE_SPEED = 6; // pixels per frame for smooth movement

function createInitialPlayer(chapterIdx: number): PlayerState {
  const ch = CHAPTERS[chapterIdx];
  return {
    pos: { ...ch.playerStart },
    pixelPos: { x: ch.playerStart.x * TILE_SIZE, y: ch.playerStart.y * TILE_SIZE },
    direction: 'down',
    moving: false,
    credibility: 70,
    animFrame: 0,
    animTimer: 0,
  };
}

export function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [state, setState] = useState<GameState>({
    phase: 'title',
    chapter: 0,
    player: createInitialPlayer(0),
    collectedEvidence: [],
    talkedNPCs: [],
    completedPuzzles: [],
    currentDialogue: null,
    dialogueIndex: 0,
    transitionText: '',
    showInstructions: false,
  });

  const keysRef = useRef<Set<string>>(new Set());
  const animFrameRef = useRef(0);
  const guardPosRef = useRef<{ x: number; y: number }[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  const getChapter = useCallback(() => CHAPTERS[state.chapter], [state.chapter]);

  // Save game
  const saveGame = useCallback(() => {
    const save: GameSave = {
      chapter: state.chapter,
      credibility: state.player.credibility,
      collectedEvidence: state.collectedEvidence,
      talkedNPCs: state.talkedNPCs,
      completedPuzzles: state.completedPuzzles,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  }, [state]);

  const loadGame = useCallback((): GameSave | null => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }, []);

  const deleteSave = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
  }, []);

  // Start game
  const startGame = useCallback((loadSave = false) => {
    audio.menuConfirm();
    let chapter = 0;
    let cred = 70;
    let evidence: string[] = [];
    let npcs: string[] = [];
    let puzzles: number[] = [];

    if (loadSave) {
      const save = loadGame();
      if (save) {
        chapter = save.chapter;
        cred = save.credibility;
        evidence = save.collectedEvidence;
        npcs = save.talkedNPCs;
        puzzles = save.completedPuzzles;
      }
    }

    const player = createInitialPlayer(chapter);
    player.credibility = cred;

    setState({
      phase: 'transition',
      chapter,
      player,
      collectedEvidence: evidence,
      talkedNPCs: npcs,
      completedPuzzles: puzzles,
      currentDialogue: null,
      dialogueIndex: 0,
      transitionText: `${CHAPTERS[chapter].title}: ${CHAPTERS[chapter].subtitle}`,
      showInstructions: false,
    });

    audio.transition();
    setTimeout(() => {
      setState(s => ({ ...s, phase: 'playing' }));
    }, 2500);
  }, [loadGame]);

  // Move to next chapter
  const nextChapter = useCallback(() => {
    setState(s => {
      const next = s.chapter + 1;
      if (next >= CHAPTERS.length) {
        audio.victory();
        return { ...s, phase: 'win' as GamePhase };
      }
      const player = createInitialPlayer(next);
      player.credibility = s.player.credibility;
      audio.transition();
      return {
        ...s,
        phase: 'transition' as GamePhase,
        chapter: next,
        player,
        transitionText: `${CHAPTERS[next].title}: ${CHAPTERS[next].subtitle}`,
      };
    });
    setTimeout(() => {
      setState(s => {
        if (s.phase === 'transition') return { ...s, phase: 'playing' };
        return s;
      });
    }, 2500);
  }, []);

  // Interact with nearby NPC or evidence
  const interact = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'playing') return;
    const ch = CHAPTERS[s.chapter];
    const px = s.player.pos.x;
    const py = s.player.pos.y;

    const dirOffsets: Record<Direction, [number, number]> = {
      up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
    };
    const [dx, dy] = dirOffsets[s.player.direction];
    const tx = px + dx;
    const ty = py + dy;

    // Check for NPC at target, adjacent tiles, or player pos
    for (const npc of ch.npcs) {
      const dist = Math.abs(npc.pos.x - px) + Math.abs(npc.pos.y - py);
      if ((npc.pos.x === tx && npc.pos.y === ty) || dist <= 1) {
        audio.menuSelect();
        setState(prev => ({
          ...prev,
          phase: 'dialogue',
          currentDialogue: npc.dialogue,
          dialogueIndex: 0,
          talkedNPCs: prev.talkedNPCs.includes(npc.id)
            ? prev.talkedNPCs
            : [...prev.talkedNPCs, npc.id],
        }));
        return;
      }
    }

    // Check for evidence at faced tile OR player tile
    for (const ev of ch.evidence) {
      const atFaced = ev.pos.x === tx && ev.pos.y === ty;
      const atPlayer = ev.pos.x === px && ev.pos.y === py;
      if ((atFaced || atPlayer) && !s.collectedEvidence.includes(ev.id)) {
        audio.collect();
        setState(prev => ({
          ...prev,
          collectedEvidence: [...prev.collectedEvidence, ev.id],
          player: { ...prev.player, credibility: Math.min(100, prev.player.credibility + 5) },
        }));
        return;
      }
    }

    // Check for exit at faced tile OR player tile
    const atExitFaced = tx === ch.exitPos.x && ty === ch.exitPos.y;
    const atExitPlayer = px === ch.exitPos.x && py === ch.exitPos.y;
    if (atExitFaced || atExitPlayer) {
      if (!s.completedPuzzles.includes(s.chapter)) {
        audio.menuSelect();
        setState(prev => ({ ...prev, phase: 'puzzle' }));
      } else {
        setState(prev => ({ ...prev, phase: 'recap' }));
      }
    }
  }, []);

  // Advance dialogue
  const advanceDialogue = useCallback(() => {
    setState(s => {
      if (!s.currentDialogue) return { ...s, phase: 'playing' as GamePhase };
      const line = s.currentDialogue[s.dialogueIndex];
      let newCred = s.player.credibility;
      const newEvidence = [...s.collectedEvidence];

      if (line?.credBonus) newCred = Math.min(100, newCred + line.credBonus);
      if (line?.evidenceGiven && !newEvidence.includes(line.evidenceGiven)) {
        newEvidence.push(line.evidenceGiven);
        audio.collect();
      } else {
        audio.talk();
      }

      const nextIdx = s.dialogueIndex + 1;
      if (nextIdx >= s.currentDialogue.length) {
        return {
          ...s,
          phase: 'playing' as GamePhase,
          currentDialogue: null,
          dialogueIndex: 0,
          collectedEvidence: newEvidence,
          player: { ...s.player, credibility: newCred },
        };
      }
      return {
        ...s,
        dialogueIndex: nextIdx,
        collectedEvidence: newEvidence,
        player: { ...s.player, credibility: newCred },
      };
    });
  }, []);

  // Complete puzzle
  const completePuzzle = useCallback((success: boolean) => {
    if (success) {
      audio.puzzleCorrect();
      setState(s => ({
        ...s,
        completedPuzzles: [...s.completedPuzzles, s.chapter],
        player: { ...s.player, credibility: Math.min(100, s.player.credibility + 10) },
        phase: 'recap',
      }));
    } else {
      audio.puzzleWrong();
      setState(s => ({
        ...s,
        player: { ...s.player, credibility: Math.max(0, s.player.credibility - 5) },
      }));
    }
  }, []);

  // Finish recap → next chapter
  const finishRecap = useCallback(() => {
    saveGame();
    nextChapter();
  }, [saveGame, nextChapter]);

  // Toggle pause
  const togglePause = useCallback(() => {
    setState(s => {
      if (s.phase === 'playing') return { ...s, phase: 'paused' };
      if (s.phase === 'paused') return { ...s, phase: 'playing' };
      return s;
    });
  }, []);

  const closePuzzle = useCallback(() => {
    setState(s => {
      if (s.phase === 'puzzle') return { ...s, phase: 'playing' };
      return s;
    });
  }, []);

  const toggleNotebook = useCallback(() => {
    setState(s => {
      if (s.phase === 'playing') return { ...s, phase: 'notebook' };
      if (s.phase === 'notebook') return { ...s, phase: 'playing' };
      return s;
    });
  }, []);

  const toggleInstructions = useCallback(() => {
    setState(s => ({ ...s, showInstructions: !s.showInstructions }));
  }, []);

  // Keyboard
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      const s = stateRef.current;

      if (e.key === 'Escape') {
        if (s.phase === 'notebook') setState(prev => ({ ...prev, phase: 'playing' }));
        else if (s.phase === 'puzzle') setState(prev => ({ ...prev, phase: 'playing' }));
        else togglePause();
        return;
      }
      if (e.key.toLowerCase() === 'n' && (s.phase === 'playing' || s.phase === 'notebook')) {
        toggleNotebook();
        return;
      }
      if ((e.key === ' ' || e.key.toLowerCase() === 'e') && s.phase === 'playing') {
        e.preventDefault();
        interact();
        return;
      }
      if ((e.key === ' ' || e.key === 'Enter') && s.phase === 'dialogue') {
        e.preventDefault();
        advanceDialogue();
        return;
      }
    };
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, [interact, advanceDialogue, togglePause, toggleNotebook]);

  // Game loop
  useEffect(() => {
    let raf: number;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const s = stateRef.current;
      if (s.phase !== 'playing') {
        // Still render but don't update
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) renderFrame(ctx, s);
        }
        return;
      }

      animFrameRef.current++;
      const keys = keysRef.current;
      let dir = s.player.direction;
      let dx = 0, dy = 0;

      if (keys.has('arrowup') || keys.has('w')) { dy = -1; dir = 'up'; }
      else if (keys.has('arrowdown') || keys.has('s')) { dy = 1; dir = 'down'; }
      else if (keys.has('arrowleft') || keys.has('a')) { dx = -1; dir = 'left'; }
      else if (keys.has('arrowright') || keys.has('d')) { dx = 1; dir = 'right'; }

      const ch = CHAPTERS[s.chapter];
      const moving = dx !== 0 || dy !== 0;

      // Update guard positions
      if (ch.guardPatrols) {
        ch.guardPatrols.forEach((patrol, i) => {
          if (!guardPosRef.current[i]) guardPosRef.current[i] = { ...patrol.path[0] };
          const g = guardPosRef.current[i];
          const progress = (animFrameRef.current * patrol.speed) % patrol.path.length;
          const idx = Math.floor(progress);
          const nextIdx = (idx + 1) % patrol.path.length;
          const t = progress - idx;
          g.x = patrol.path[idx].x + (patrol.path[nextIdx].x - patrol.path[idx].x) * t;
          g.y = patrol.path[idx].y + (patrol.path[nextIdx].y - patrol.path[idx].y) * t;

          // Check player proximity to guard
          const dist = Math.abs(s.player.pos.x - g.x) + Math.abs(s.player.pos.y - g.y);
          if (dist < 2) {
            setState(prev => ({
              ...prev,
              player: { ...prev.player, credibility: Math.max(0, prev.player.credibility - 0.2) },
            }));
          }
        });
      }

      setState(prev => {
        const newPlayer = { ...prev.player, direction: dir, animFrame: animFrameRef.current };

        // Linear pixel movement toward grid position
        const moveToward = (current: number, target: number, speed: number) => {
          const diff = target - current;
          if (Math.abs(diff) <= speed) return target;
          return current + Math.sign(diff) * speed;
        };

        const tgtPx = prev.player.pos.x * TILE_SIZE;
        const tgtPy = prev.player.pos.y * TILE_SIZE;
        const atTarget = prev.player.pixelPos.x === tgtPx && prev.player.pixelPos.y === tgtPy;

        if (moving) {
          newPlayer.animTimer = prev.player.animTimer + 1;
          newPlayer.moving = true;

          if (atTarget) {
            const newX = prev.player.pos.x + dx;
            const newY = prev.player.pos.y + dy;
            const npcBlocking = ch.npcs.some(n => n.pos.x === newX && n.pos.y === newY);

            if (isWalkable(ch.map, newX, newY) && !npcBlocking) {
              newPlayer.pos = { x: newX, y: newY };
              if (animFrameRef.current % 6 === 0) audio.step();
            }
          }
        } else {
          newPlayer.moving = false;
        }

        // Always move pixel position toward grid position
        const newTgtPx = newPlayer.pos.x * TILE_SIZE;
        const newTgtPy = newPlayer.pos.y * TILE_SIZE;
        newPlayer.pixelPos = {
          x: moveToward(prev.player.pixelPos.x, newTgtPx, MOVE_SPEED),
          y: moveToward(prev.player.pixelPos.y, newTgtPy, MOVE_SPEED),
        };

        return { ...prev, player: newPlayer };
      });

      // Render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) renderFrame(ctx, stateRef.current);
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [canvasRef]);

  function renderFrame(ctx: CanvasRenderingContext2D, s: GameState) {
    const ch = CHAPTERS[s.chapter];
    clearCanvas(ctx);
    drawTileMap(ctx, ch.map, animFrameRef.current);

    // Draw evidence
    ch.evidence.forEach(ev => {
      if (!s.collectedEvidence.includes(ev.id)) {
        drawEvidence(ctx, ev, animFrameRef.current);
      }
    });

    // Draw guards
    if (ch.guardPatrols) {
      guardPosRef.current.forEach(g => {
        if (g) drawGuard(ctx, g, animFrameRef.current);
      });
    }

    // Draw NPCs
    ch.npcs.forEach(npc => {
      const talked = s.talkedNPCs.includes(npc.id);
      drawNPC(ctx, { ...npc, talked }, animFrameRef.current);
    });

    // Draw player
    drawPlayer(ctx, s.player);
  }

  return {
    state,
    getChapter,
    startGame,
    interact,
    advanceDialogue,
    completePuzzle,
    closePuzzle,
    finishRecap,
    togglePause,
    toggleNotebook,
    toggleInstructions,
    loadGame,
    deleteSave,
    saveGame,
  };
}
