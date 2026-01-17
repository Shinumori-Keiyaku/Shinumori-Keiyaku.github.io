export enum CardType {
  UNIT = 'unit',
  SUPPORT = 'support',
  BUILDING = 'building',
  FIELD = 'field'
}

export interface CardData {
  index: number; // Required for deck code generation
  name: string;
  type: CardType;
  effect: string;
  group: string;
  // Optional properties for UI enhancement if needed
  cost?: number;
  attack?: number;
  defense?: number;
}

export interface DeckEntry {
  card: CardData;
  count: number;
}

export type Deck = Map<number, DeckEntry>;