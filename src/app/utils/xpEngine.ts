export const MAX_LEVEL = 50;
export const MAX_XP = 50000;

/**
 * Calculates XP thresholds dynamically.
 * Level 1: 0 XP
 * Level 2: 100 XP
 * Level 50: ~50,000 XP
 * Total XP scales quadratically to reach 50k at Level 50.
 */
const XP_THRESHOLDS: number[] = [0];
let currentXp = 0;
let increment = 100;

for (let i = 2; i <= MAX_LEVEL; i++) {
  currentXp += increment;
  XP_THRESHOLDS.push(currentXp);
  // Increase the gap by ~40 each level so the sum of 49 steps reaches ~50,000
  increment += 40;
}

export const getLevelInfo = (totalXp: number) => {
  const safeXp = Math.max(0, totalXp);

  let currentLevel = 1;
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (safeXp >= XP_THRESHOLDS[i]) {
      currentLevel = i + 1;
    } else {
      break;
    }
  }

  // Cap at MAX_LEVEL
  if (currentLevel > MAX_LEVEL) {
    return {
      level: MAX_LEVEL,
      currentLevelXp: XP_THRESHOLDS[MAX_LEVEL - 1],
      nextLevelXp: XP_THRESHOLDS[MAX_LEVEL - 1],
      progressPercent: 100,
      xpInCurrentLevel: safeXp - XP_THRESHOLDS[MAX_LEVEL - 1],
      xpNeededForNextLevel: 0
    };
  }

  const currentLevelThreshold = XP_THRESHOLDS[currentLevel - 1];
  const nextLevelThreshold = XP_THRESHOLDS[currentLevel] || XP_THRESHOLDS[currentLevel - 1];
  
  const xpInCurrentLevel = safeXp - currentLevelThreshold;
  const xpNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;
  
  let progressPercent = 100;
  if (xpNeededForNextLevel > 0) {
    progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));
  }

  return {
    level: currentLevel,
    currentLevelXp: currentLevelThreshold,
    nextLevelXp: nextLevelThreshold,
    progressPercent,
    xpInCurrentLevel,
    xpNeededForNextLevel
  };
};
