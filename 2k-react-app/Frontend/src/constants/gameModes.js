// Single source of truth for the game modes offered throughout the app - update here only.
export const GAME_MODES = [
   { id: 1, mode_name: "Rec Center", playerCount: 5, usesPositions: true },

   { id: 2, mode_name: "2v2 Park", playerCount: 2, usesPositions: false },
   { id: 3, mode_name: "3v3 Park", playerCount: 3, usesPositions: false },

   { id: 4, mode_name: "3v3 Crew", playerCount: 3, usesPositions: false },
   { id: 5, mode_name: "5v5 Crew", playerCount: 5, usesPositions: true },

   { id: 6, mode_name: "1v1 Proving Grounds", playerCount: 1, usesPositions: false },
   { id: 7, mode_name: "2v2 Proving Grounds", playerCount: 2, usesPositions: false },
   { id: 8, mode_name: "3v3 Proving Grounds", playerCount: 3, usesPositions: false },

   { id: 9, mode_name: "1v1 Ante Up", playerCount: 1, usesPositions: false },
   { id: 10, mode_name: "2v2 Ante Up", playerCount: 2, usesPositions: false },
   { id: 11, mode_name: "3v3 Ante Up", playerCount: 3, usesPositions: false },
];

export const GAME_MODE_NAMES = Object.fromEntries(GAME_MODES.map((mode) => [mode.id, mode.mode_name]));
export const GAME_MODES_BY_ID = Object.fromEntries(GAME_MODES.map((mode) => [mode.id, mode]));
