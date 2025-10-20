// Minimal Secret Santa backend logic

export function shuffle(array: string[]): string[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Recursive retry to avoid self assignment
export function drawNames(names: string[]): Record<string, string> {
  const shuffled = shuffle([...names]);
  const result: Record<string, string> = {};
  for (let i = 0; i < names.length; i++) {
    if (names[i] === shuffled[i]) {
      return drawNames(names); // retry if any fixed point
    }
    result[names[i]] = shuffled[i];
  }
  return result;
}

export function computePersonsWithoutGift(names: string[], assignments: Record<string,string>): string[] {
  const receivers = new Set(Object.values(assignments));
  return names.filter(n => !receivers.has(n));
}
