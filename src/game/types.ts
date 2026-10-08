export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export type GamePhase =
  | 'title'
  | 'playing'
  | 'paused'
  | 'dialogue'
  | 'puzzle'
  | 'transition'
  | 'recap'
  | 'notebook'
  | 'win';

export interface PlayerState {
  pos: Position;
  pixelPos: Position;
  direction: Direction;
  moving: boolean;
  credibility: number;
  animFrame: number;
  animTimer: number;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  evidenceGiven?: string;
  credBonus?: number;
}

export interface NPCDef {
  id: string;
  name: string;
  pos: Position;
  bodyColor: string;
  hatColor: string;
  skinColor: string;
  dialogue: DialogueLine[];
  talked: boolean;
}

export interface EvidenceItem {
  id: string;
  name: string;
  description: string;
  pos: Position;
  collected: boolean;
  glowColor: string;
}

export interface PuzzleDef {
  type: 'order' | 'match' | 'select';
  title: string;
  instruction: string;
  items: string[];
  correctAnswer: number[];
  pairs?: string[];
}

export interface ChapterDef {
  id: number;
  title: string;
  subtitle: string;
  map: string[];
  playerStart: Position;
  npcs: NPCDef[];
  evidence: EvidenceItem[];
  puzzle: PuzzleDef;
  recap: string[];
  exitPos: Position;
  guardPatrols?: { path: Position[]; speed: number }[];
}

export interface GameState {
  phase: GamePhase;
  chapter: number;
  player: PlayerState;
  collectedEvidence: string[];
  talkedNPCs: string[];
  completedPuzzles: number[];
  currentDialogue: DialogueLine[] | null;
  dialogueIndex: number;
  transitionText: string;
  showInstructions: boolean;
}

export interface GameSave {
  chapter: number;
  credibility: number;
  collectedEvidence: string[];
  talkedNPCs: string[];
  completedPuzzles: number[];
}

export const TILE_SIZE = 32;
export const MAP_COLS = 20;
export const MAP_ROWS = 15;
export const GAME_WIDTH = MAP_COLS * TILE_SIZE;
export const GAME_HEIGHT = MAP_ROWS * TILE_SIZE;
