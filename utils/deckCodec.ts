import { DeckEntry } from "../types";

// Standard Base35 Implementation (0-9, A-Y)
// 0123456789ABCDEFGHIJKLMNOPQRSTUVWXY
const BASE35_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXY";

function toBase35(num: number): string {
  if (num === 0) return "00";
  let result = "";
  let n = num;
  while (n > 0) {
    result = BASE35_CHARS[n % 35] + result;
    n = Math.floor(n / 35);
  }
  // Pad with leading zero to ensure it's always 2 characters per index as requested
  return result.padStart(2, '0');
}

export function generateDeckCode(deck: DeckEntry[]): string {
  let isFst = false;
  let code = "";
  
  const copyZ: number[] = [];
  const copyZZ: number[] = [];
  const copyZZZ: number[] = [];

  // Sort for consistency
  const sortedDeck = [...deck].sort((a, b) => a.card.index - b.card.index);

  for (const entry of sortedDeck) {
    // Shift index by 1 so the code starts at 1 instead of 0
    const id = entry.card.index + 1;

    if (entry.count === 1) {
      copyZ.push(id);
    } else if (entry.count === 2) {
      copyZZ.push(id);
    } else if (entry.count === 3) {
      copyZZZ.push(id);
    }
  }

  // 1 Copy Block
  isFst = true;
  for (const index of copyZ) {
    if (isFst) {
      code += "Z";
      isFst = false;
    }
    code += toBase35(index);
  }

  // 2 Copies Block
  isFst = true;
  for (const index of copyZZ) {
    if (isFst) {
      code += "ZZ";
      isFst = false;
    }
    code += toBase35(index);
  }

  // 3 Copies Block
  isFst = true;
  for (const index of copyZZZ) {
    if (isFst) {
      code += "ZZZ";
      isFst = false;
    }
    code += toBase35(index);
  }

  return code;
}