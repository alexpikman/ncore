import { STARTING_BALANCE } from './catalog';
import type { GameplaySave } from './types';

const SAVE_VERSION = 1;

export function createInitialSave(): GameplaySave {
  return {
    version: SAVE_VERSION,
    balance: STARTING_BALANCE,
    inventory: [],
    servers: [],
  };
}

export function loadGameplaySave(userId: string): GameplaySave {
  try {
    const raw = localStorage.getItem(getSaveKey(userId));
    if (!raw) return createInitialSave();

    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('version' in parsed) ||
      parsed.version !== SAVE_VERSION ||
      !('balance' in parsed) ||
      typeof parsed.balance !== 'number' ||
      !('inventory' in parsed) ||
      !Array.isArray(parsed.inventory) ||
      !('servers' in parsed) ||
      !Array.isArray(parsed.servers)
    ) {
      return createInitialSave();
    }

    return parsed as GameplaySave;
  } catch {
    return createInitialSave();
  }
}

export function saveGameplaySave(userId: string, save: GameplaySave): void {
  try {
    localStorage.setItem(getSaveKey(userId), JSON.stringify(save));
  } catch {
    // The game remains playable for this session if browser storage is unavailable.
  }
}

function getSaveKey(userId: string): string {
  return \`ncore:gameplay:v\${SAVE_VERSION}:\${userId}\`;
}
