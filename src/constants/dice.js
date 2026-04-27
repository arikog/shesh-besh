export const DICE_NAMES = {
  "1-1": "Yak-Yak",
  "2-1": "Yak-Du",
  "2-2": "Dü-Dü",
  "3-1": "Seh-Yek",
  "3-2": "Seh-Du",
  "3-3": "Seh-Seh",
  "4-1": "Char-Yek",
  "4-2": "Char-Du",
  "4-3": "Char-Seh",
  "4-4": "Dört-Dört",
  "5-1": "Panj-Yek",
  "5-2": "Panj-Du",
  "5-3": "Panj-Seh",
  "5-4": "Panj-Char",
  "5-5": "Hamsa",
  "6-1": "Shesh-Yek",
  "6-2": "Shesh-Du",
  "6-3": "Shesh-Seh",
  "6-4": "Shesh-Char",
  "6-5": "Shesh-Besh",
  "6-6": "Shesh-Shesh",
};

export const diceLabel = (d1, d2) =>
  DICE_NAMES[`${Math.max(d1, d2)}-${Math.min(d1, d2)}`] || `${d1}-${d2}`;
