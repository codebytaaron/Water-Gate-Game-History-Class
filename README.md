# Watergate Files

Watergate Files is a browser-based pixel adventure about investigating the Watergate scandal. Explore five chapters set in 1970s Washington, speak with characters, collect evidence, solve puzzles, and build credibility as the story unfolds.

## Play

Run the game locally with Node.js:

```sh
npm install
npm run dev
```

Open the URL printed by Vite. Use the controls shown on the title screen to move, interact, and open the notebook. Progress is saved in your browser's local storage; the title screen lets you continue or start over.

## Development

```sh
npm run build
npm run test
npm run lint
```

The game is a React and TypeScript app built with Vite. Chapter content, maps, dialogue, evidence, and puzzle answers live in `src/game/data.ts`. Game state and saving are handled in `src/hooks/useGame.ts`; rendering and menus are in `src/components/game/`.

This is an interactive interpretation of historical events. Dialogue and gameplay are dramatized for the game.
