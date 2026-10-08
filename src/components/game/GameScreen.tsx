import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGame } from '../../hooks/useGame';
import { CHAPTERS } from '../../game/data';
import { GAME_WIDTH, GAME_HEIGHT, type PuzzleDef } from '../../game/types';
import { audio } from '../../game/audio';

/* ───────── Title Screen ───────── */
function TitleScreen({ onStart, hasSave, onContinue }: { onStart: () => void; hasSave: boolean; onContinue: () => void }) {
  const [showInstr, setShowInstr] = useState(false);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-game-dark z-30">
      <div className="scanlines absolute inset-0 z-10" />
      <div className="relative z-20 flex flex-col items-center gap-6 animate-fade-in">
        <div className="text-center mb-4">
          <h1 className="font-pixel text-game-amber text-2xl md:text-4xl tracking-wider mb-2 animate-glitch">
            WATERGATE
          </h1>
          <h2 className="font-pixel text-game-amber text-lg md:text-2xl tracking-widest opacity-80">
            FILES
          </h2>
          <div className="w-48 h-0.5 bg-game-amber mx-auto mt-4 opacity-50" />
          <p className="font-pixel-body text-game-cream text-lg mt-4 opacity-70">
            A Pixel Investigation Adventure
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={onStart}
            className="font-pixel text-sm px-8 py-3 bg-game-amber text-game-dark hover:brightness-110 transition-all pixel-border-amber"
          >
            NEW GAME
          </button>
          {hasSave && (
            <button
              onClick={onContinue}
              className="font-pixel text-xs px-8 py-3 bg-game-brown text-game-cream hover:brightness-110 transition-all pixel-border"
            >
              CONTINUE
            </button>
          )}
          <button
            onClick={() => { audio.menuSelect(); setShowInstr(!showInstr); }}
            className="font-pixel text-xs px-8 py-3 bg-muted text-game-cream hover:brightness-110 transition-all pixel-border"
          >
            HOW TO PLAY
          </button>
        </div>

        {showInstr && (
          <div className="bg-card p-4 pixel-border max-w-md animate-slide-up mt-2">
            <p className="font-pixel text-[10px] text-game-amber mb-2">CONTROLS</p>
            <div className="font-pixel-body text-game-cream text-base space-y-1">
              <p>↑ ↓ ← → or WASD — Move</p>
              <p>SPACE / E — Interact with people & objects</p>
              <p>N — Open evidence notebook</p>
              <p>ESC — Pause / Back</p>
            </div>
            <p className="font-pixel text-[10px] text-game-amber mt-3 mb-1">OBJECTIVE</p>
            <p className="font-pixel-body text-game-cream text-base">
              Investigate the Watergate scandal! Talk to NPCs, collect evidence, solve puzzles, and uncover the truth. Your credibility meter matters — gather evidence carefully.
            </p>
          </div>
        )}

        <p className="font-pixel text-[8px] text-muted-foreground mt-6">
          WASHINGTON D.C. — 1972
        </p>
        <p className="font-pixel text-[7px] text-muted-foreground mt-2 opacity-50">
          Created by Teddy Aaron
        </p>
      </div>
    </div>
  );
}

/* ───────── HUD ───────── */
function GameHUD({ credibility, chapter, evidenceCount, onPause, onNotebook }: {
  credibility: number; chapter: number; evidenceCount: number; onPause: () => void; onNotebook: () => void;
}) {
  const credColor = credibility > 60 ? 'bg-game-green' : credibility > 30 ? 'bg-game-amber' : 'bg-game-red';
  const ch = CHAPTERS[chapter];

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2 bg-game-dark/80">
      <div className="flex items-center gap-3">
        <span className="font-pixel text-[8px] text-game-amber">{ch.title}</span>
        <div className="flex items-center gap-1">
          <span className="font-pixel text-[7px] text-game-cream">CRED</span>
          <div className="w-20 h-2 bg-muted pixel-border">
            <div className={`h-full ${credColor} transition-all`} style={{ width: `${credibility}%` }} />
          </div>
          <span className="font-pixel text-[7px] text-game-cream">{Math.round(credibility)}%</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onNotebook} className="font-pixel text-[7px] text-game-amber hover:text-game-cream px-2 py-1 pixel-border">
          📓 {evidenceCount}
        </button>
        <button onClick={onPause} className="font-pixel text-[7px] text-game-amber hover:text-game-cream px-2 py-1 pixel-border">
          ⏸
        </button>
      </div>
    </div>
  );
}

/* ───────── Dialogue Box ───────── */
function DialogueBox({ line, onAdvance }: { line: { speaker: string; text: string }; onAdvance: () => void }) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 animate-slide-up">
      <div className="bg-card/95 pixel-border-amber p-4 max-w-lg mx-auto">
        <p className="font-pixel text-[10px] text-game-amber mb-2">{line.speaker}</p>
        <p className="font-pixel-body text-game-cream text-lg leading-relaxed">{line.text}</p>
        <button
          onClick={onAdvance}
          className="font-pixel text-[8px] text-game-amber mt-3 animate-blink"
        >
          ▼ CONTINUE
        </button>
      </div>
    </div>
  );
}

/* ───────── Pause Screen ───────── */
function PauseScreen({ onResume, onSave, onQuit }: { onResume: () => void; onSave: () => void; onQuit: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-game-dark/90 z-30">
      <div className="bg-card pixel-border-amber p-6 flex flex-col gap-3 items-center animate-fade-in">
        <p className="font-pixel text-game-amber text-sm mb-2">PAUSED</p>
        <button onClick={onResume} className="font-pixel text-[10px] px-6 py-2 bg-game-amber text-game-dark pixel-border-amber hover:brightness-110">
          RESUME
        </button>
        <button onClick={onSave} className="font-pixel text-[10px] px-6 py-2 bg-game-brown text-game-cream pixel-border hover:brightness-110">
          SAVE GAME
        </button>
        <button onClick={onQuit} className="font-pixel text-[10px] px-6 py-2 bg-destructive text-game-cream pixel-border hover:brightness-110">
          QUIT TO TITLE
        </button>
      </div>
    </div>
  );
}

/* ───────── Notebook ───────── */
function NotebookUI({ evidence, chapter, onClose }: { evidence: string[]; chapter: number; onClose: () => void }) {
  // Gather all evidence descriptions
  const allEvidence: { name: string; description: string; chapter: number }[] = [];
  CHAPTERS.forEach((ch, i) => {
    ch.evidence.forEach(ev => {
      if (evidence.includes(ev.id)) {
        allEvidence.push({ name: ev.name, description: ev.description, chapter: i + 1 });
      }
    });
    ch.npcs.forEach(npc => {
      npc.dialogue.forEach(d => {
        if (d.evidenceGiven && evidence.includes(d.evidenceGiven)) {
          allEvidence.push({ name: d.evidenceGiven.replace(/_/g, ' ').toUpperCase(), description: `Intelligence from ${npc.name}`, chapter: i + 1 });
        }
      });
    });
  });

  // Deduplicate
  const seen = new Set<string>();
  const unique = allEvidence.filter(e => {
    if (seen.has(e.name)) return false;
    seen.add(e.name);
    return true;
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-game-dark/90 z-30">
      <div className="bg-card pixel-border-amber p-5 max-w-md w-full max-h-[80%] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <p className="font-pixel text-game-amber text-xs">📓 EVIDENCE NOTEBOOK</p>
          <button onClick={onClose} className="font-pixel text-[8px] text-game-cream hover:text-game-amber">✕ CLOSE</button>
        </div>
        <p className="font-pixel text-[8px] text-muted-foreground mb-3">Chapter {chapter + 1} / {CHAPTERS.length} — {unique.length} items collected</p>
        {unique.length === 0 ? (
          <p className="font-pixel-body text-game-cream text-base opacity-60">No evidence collected yet. Explore and talk to people!</p>
        ) : (
          <div className="space-y-2">
            {unique.map((ev, i) => (
              <div key={i} className="bg-muted p-2 pixel-border">
                <p className="font-pixel text-[8px] text-game-amber">CH.{ev.chapter} — {ev.name}</p>
                <p className="font-pixel-body text-game-cream text-sm">{ev.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────── Transition ───────── */
function TransitionScreen({ text }: { text: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-game-dark z-30">
      <div className="text-center animate-fade-in">
        <p className="font-pixel text-game-amber text-lg md:text-2xl tracking-wider">{text}</p>
        <div className="w-32 h-0.5 bg-game-amber mx-auto mt-4 opacity-50" />
      </div>
    </div>
  );
}

/* ───────── Puzzle ───────── */
function PuzzleUI({ puzzle, onComplete, onBack }: { puzzle: PuzzleDef; onComplete: (success: boolean) => void; onBack: () => void }) {
  const [items, setItems] = useState(() =>
    puzzle.items.map((text, i) => ({ text, origIdx: i }))
  );
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Shuffle for order/match puzzles
    if (puzzle.type === 'order' || puzzle.type === 'match') {
      setItems(prev => [...prev].sort(() => Math.random() - 0.5));
    }
  }, [puzzle.type]);

  const handleClick = (idx: number) => {
    if (puzzle.type === 'select') {
      audio.menuSelect();
      setSelected(prev => {
        const n = new Set(prev);
        if (n.has(idx)) n.delete(idx); else n.add(idx);
        return n;
      });
    } else if (puzzle.type === 'order' || puzzle.type === 'match') {
      audio.menuSelect();
      if (selected.size === 0) {
        setSelected(new Set([idx]));
      } else {
        const firstIdx = Array.from(selected)[0];
        setItems(prev => {
          const n = [...prev];
          [n[firstIdx], n[idx]] = [n[idx], n[firstIdx]];
          return n;
        });
        setSelected(new Set());
      }
    }
  };

  const checkAnswer = () => {
    let correct = false;
    if (puzzle.type === 'order' || puzzle.type === 'match') {
      correct = items.every((item, i) => item.origIdx === puzzle.correctAnswer[i]);
    } else if (puzzle.type === 'select') {
      const correctSet = new Set(puzzle.correctAnswer);
      correct = selected.size === correctSet.size && Array.from(selected).every(i => correctSet.has(i));
    }

    if (correct) {
      setFeedback('CORRECT!');
      setTimeout(() => onComplete(true), 1000);
    } else {
      setFeedback('Not quite... try again!');
      setTimeout(() => setFeedback(null), 1500);
      onComplete(false);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-game-dark/95 z-30">
      <div className="bg-card pixel-border-amber p-5 max-w-lg w-full animate-fade-in">
        <p className="font-pixel text-game-amber text-xs mb-1">{puzzle.title}</p>
        <p className="font-pixel-body text-game-cream text-base mb-4">{puzzle.instruction}</p>

        {(puzzle.type === 'order' || puzzle.type === 'match') && (
          <div className="space-y-1 mb-4">
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className={`w-full text-left font-pixel-body text-sm px-3 py-2 pixel-border transition-all ${
                  selected.has(i)
                    ? 'bg-game-amber text-game-dark'
                    : 'bg-muted text-game-cream hover:bg-game-brown'
                }`}
              >
                <span className="font-pixel text-[8px] mr-2 opacity-60">{i + 1}.</span>
                {item.text}
                {puzzle.type === 'match' && puzzle.pairs && (
                  <span className="float-right text-game-amber opacity-70">→ {puzzle.pairs[item.origIdx]}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {puzzle.type === 'select' && (
          <div className="space-y-1 mb-4">
            {puzzle.items.map((item, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className={`w-full text-left font-pixel-body text-sm px-3 py-2 pixel-border transition-all ${
                  selected.has(i)
                    ? 'bg-game-green text-game-dark'
                    : 'bg-muted text-game-cream hover:bg-game-brown'
                }`}
              >
                <span className="mr-2">{selected.has(i) ? '☑' : '☐'}</span>
                {item}
              </button>
            ))}
          </div>
        )}

        {feedback && (
          <p className={`font-pixel text-xs mb-2 ${feedback === 'CORRECT!' ? 'text-game-green' : 'text-game-red'}`}>
            {feedback}
          </p>
        )}

        <div className="flex gap-2">
          <button onClick={checkAnswer} className="font-pixel text-[10px] px-6 py-2 bg-game-amber text-game-dark pixel-border-amber hover:brightness-110">
            SUBMIT
          </button>
          <button onClick={onBack} className="font-pixel text-[10px] px-4 py-2 bg-muted text-game-cream pixel-border hover:brightness-110">
            BACK
          </button>
        </div>

        <p className="font-pixel text-[7px] text-muted-foreground mt-3">
          {puzzle.type === 'order' ? 'Click two items to swap their positions.' :
           puzzle.type === 'match' ? 'Click two items to swap. Match left to right.' :
           'Click items to select/deselect them.'}
        </p>
      </div>
    </div>
  );
}

/* ───────── Recap ───────── */
function RecapScreen({ recap, chapter, onContinue }: { recap: string[]; chapter: number; onContinue: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-game-dark/95 z-30">
      <div className="bg-card pixel-border-amber p-5 max-w-lg w-full animate-fade-in">
        <p className="font-pixel text-game-amber text-xs mb-1">CHAPTER {chapter + 1} COMPLETE</p>
        <p className="font-pixel text-[10px] text-game-cream mb-3">KEY TAKEAWAYS</p>
        <div className="space-y-2 mb-4">
          {recap.map((line, i) => (
            <div key={i} className="flex gap-2 animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
              <span className="font-pixel text-game-amber text-[8px] mt-1">•</span>
              <p className="font-pixel-body text-game-cream text-base">{line}</p>
            </div>
          ))}
        </div>
        <button onClick={onContinue} className="font-pixel text-[10px] px-6 py-2 bg-game-amber text-game-dark pixel-border-amber hover:brightness-110">
          {chapter < CHAPTERS.length - 1 ? 'NEXT CHAPTER →' : 'FINISH GAME'}
        </button>
      </div>
    </div>
  );
}

/* ───────── Win Screen ───────── */
function WinScreen({ credibility, evidenceCount, onRestart }: { credibility: number; evidenceCount: number; onRestart: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-game-dark z-30">
      <div className="scanlines absolute inset-0" />
      <div className="relative z-10 text-center animate-fade-in max-w-lg px-4">
        <p className="font-pixel text-game-amber text-xl mb-2">★ CASE CLOSED ★</p>
        <div className="w-48 h-0.5 bg-game-amber mx-auto mb-4 opacity-50" />
        <p className="font-pixel-body text-game-cream text-xl mb-6">
          You uncovered the truth behind the Watergate scandal.
        </p>

        <div className="bg-card pixel-border-amber p-4 mb-6 text-left">
          <p className="font-pixel text-[10px] text-game-amber mb-2">FINAL REPORT</p>
          <p className="font-pixel-body text-game-cream text-base">Credibility Rating: {Math.round(credibility)}%</p>
          <p className="font-pixel-body text-game-cream text-base">Evidence Collected: {evidenceCount} items</p>
          <p className="font-pixel-body text-game-cream text-base">Chapters Completed: {CHAPTERS.length}/{CHAPTERS.length}</p>
        </div>

        <div className="bg-card pixel-border p-4 mb-6 text-left">
          <p className="font-pixel text-[10px] text-game-amber mb-2">WHY WATERGATE MATTERS</p>
          <div className="font-pixel-body text-game-cream text-base space-y-2">
            <p>The Watergate scandal (1972-1974) proved that in the United States, no one is above the law — not even the President.</p>
            <p>It demonstrated the vital role of a free press, an independent judiciary, and congressional oversight in holding power accountable.</p>
            <p>69 people were indicted and 48 were convicted. Richard Nixon became the only U.S. president to resign from office.</p>
            <p>The lasting lesson: democracy depends on transparency, accountability, and the courage of individuals who pursue the truth.</p>
          </div>
        </div>

        <button onClick={onRestart} className="font-pixel text-[10px] px-8 py-3 bg-game-amber text-game-dark pixel-border-amber hover:brightness-110">
          PLAY AGAIN
        </button>

        <p className="font-pixel text-[7px] text-muted-foreground mt-6 opacity-50">
          Created by Teddy Aaron
        </p>
      </div>
    </div>
  );
}

/* ───────── Mobile Controls ───────── */
function MobileControls({ onMove, onInteract, onNotebook }: {
  onMove: (dir: string) => void;
  onInteract: () => void;
  onNotebook: () => void;
}) {
  const sendKey = (key: string, up = false) => {
    window.dispatchEvent(new KeyboardEvent(up ? 'keyup' : 'keydown', { key }));
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-game-dark/90 border-t border-border">
      <div className="grid grid-cols-3 gap-1 w-28">
        <div />
        <button
          onTouchStart={() => sendKey('ArrowUp')}
          onTouchEnd={() => sendKey('ArrowUp', true)}
          onMouseDown={() => sendKey('ArrowUp')}
          onMouseUp={() => sendKey('ArrowUp', true)}
          className="w-9 h-9 bg-muted pixel-border flex items-center justify-center font-pixel text-game-cream text-xs active:bg-game-amber active:text-game-dark"
        >▲</button>
        <div />
        <button
          onTouchStart={() => sendKey('ArrowLeft')}
          onTouchEnd={() => sendKey('ArrowLeft', true)}
          onMouseDown={() => sendKey('ArrowLeft')}
          onMouseUp={() => sendKey('ArrowLeft', true)}
          className="w-9 h-9 bg-muted pixel-border flex items-center justify-center font-pixel text-game-cream text-xs active:bg-game-amber active:text-game-dark"
        >◄</button>
        <button
          onTouchStart={() => sendKey('ArrowDown')}
          onTouchEnd={() => sendKey('ArrowDown', true)}
          onMouseDown={() => sendKey('ArrowDown')}
          onMouseUp={() => sendKey('ArrowDown', true)}
          className="w-9 h-9 bg-muted pixel-border flex items-center justify-center font-pixel text-game-cream text-xs active:bg-game-amber active:text-game-dark"
        >▼</button>
        <button
          onTouchStart={() => sendKey('ArrowRight')}
          onTouchEnd={() => sendKey('ArrowRight', true)}
          onMouseDown={() => sendKey('ArrowRight')}
          onMouseUp={() => sendKey('ArrowRight', true)}
          className="w-9 h-9 bg-muted pixel-border flex items-center justify-center font-pixel text-game-cream text-xs active:bg-game-amber active:text-game-dark"
        >►</button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onNotebook}
          className="w-12 h-12 bg-muted pixel-border flex items-center justify-center font-pixel text-game-amber text-xs active:bg-game-amber active:text-game-dark"
        >📓</button>
        <button
          onClick={onInteract}
          className="w-12 h-12 bg-game-amber pixel-border-amber flex items-center justify-center font-pixel text-game-dark text-xs active:brightness-110"
        >ACT</button>
      </div>
    </div>
  );
}

/* ───────── Main Game Screen ───────── */
export default function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useGame(canvasRef);
  const { state } = game;
  const ch = CHAPTERS[state.chapter];
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
  }, []);

  const handleQuit = () => {
    game.deleteSave();
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-game-dark select-none">
      <div className="relative" style={{ width: GAME_WIDTH, height: GAME_HEIGHT, maxWidth: '100vw' }}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="block w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Scanlines overlay */}
        <div className="scanlines absolute inset-0 pointer-events-none" />

        {/* Title */}
        {state.phase === 'title' && (
          <TitleScreen
            onStart={() => game.startGame(false)}
            hasSave={!!game.loadGame()}
            onContinue={() => game.startGame(true)}
          />
        )}

        {/* HUD */}
        {(state.phase === 'playing' || state.phase === 'dialogue') && (
          <GameHUD
            credibility={state.player.credibility}
            chapter={state.chapter}
            evidenceCount={state.collectedEvidence.length}
            onPause={game.togglePause}
            onNotebook={game.toggleNotebook}
          />
        )}

        {/* Dialogue */}
        {state.phase === 'dialogue' && state.currentDialogue && (
          <DialogueBox
            line={state.currentDialogue[state.dialogueIndex]}
            onAdvance={game.advanceDialogue}
          />
        )}

        {/* Interaction hint */}
        {state.phase === 'playing' && (
          <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
            <span className="font-pixel text-[7px] text-game-amber opacity-60">
              SPACE/E: interact • N: notebook • ESC: pause
            </span>
          </div>
        )}

        {/* Pause */}
        {state.phase === 'paused' && (
          <PauseScreen
            onResume={game.togglePause}
            onSave={() => { game.saveGame(); audio.menuConfirm(); }}
            onQuit={handleQuit}
          />
        )}

        {/* Notebook */}
        {state.phase === 'notebook' && (
          <NotebookUI
            evidence={state.collectedEvidence}
            chapter={state.chapter}
            onClose={game.toggleNotebook}
          />
        )}

        {/* Transition */}
        {state.phase === 'transition' && (
          <TransitionScreen text={state.transitionText} />
        )}

        {/* Puzzle */}
        {state.phase === 'puzzle' && (
          <PuzzleUI puzzle={ch.puzzle} onComplete={game.completePuzzle} onBack={game.closePuzzle} />
        )}

        {/* Recap */}
        {state.phase === 'recap' && (
          <RecapScreen recap={ch.recap} chapter={state.chapter} onContinue={game.finishRecap} />
        )}

        {/* Win */}
        {state.phase === 'win' && (
          <WinScreen
            credibility={state.player.credibility}
            evidenceCount={state.collectedEvidence.length}
            onRestart={handleQuit}
          />
        )}
      </div>

      {/* Mobile controls */}
      {isMobile && state.phase === 'playing' && (
        <MobileControls
          onMove={() => {}}
          onInteract={game.interact}
          onNotebook={game.toggleNotebook}
        />
      )}
    </div>
  );
}
