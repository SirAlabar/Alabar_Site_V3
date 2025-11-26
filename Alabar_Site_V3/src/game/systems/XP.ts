/**
 * XP and Leveling System
 * Formula: XP_needed(level) = floor(5 + level * 3 + level^1.7)
 */

export interface XPManagerConfig
{
  startingLevel?: number;
  startingXP?: number;
  onLevelUp?: (newLevel: number) => void;
}

export class XPManager
{
  private currentXP: number = 0;
  private level: number = 1;
  private xpNeeded: number = 0;
  
  // Level-up callback
  private onLevelUpCallback: ((newLevel: number) => void) | null = null;
  
  constructor(config?: XPManagerConfig)
  {
    this.level = config?.startingLevel ?? 1;
    this.currentXP = config?.startingXP ?? 0;
    this.onLevelUpCallback = config?.onLevelUp ?? null;
    
    // Calculate initial XP requirement
    this.xpNeeded = this.calculateXPNeeded(this.level);
  }
  
  /**
   * Calculate XP needed for a specific level
   * Formula: floor(5 + level * 3 + level^1.7)
   */
  private calculateXPNeeded(level: number): number
  {
    return Math.floor(5 + level * 3 + Math.pow(level, 1.7));
  }
  
  /**
   * Add XP and check for level-ups
   */
  addXP(amount: number): void
  {
    if (amount <= 0)
    {
      return;
    }
    
    this.currentXP += amount;
    
    // Check for level-up(s) - can level up multiple times at once
    while (this.currentXP >= this.xpNeeded)
    {
      this.levelUp();
    }
  }
  
  /**
   * Level up the player
   */
  private levelUp(): void
  {
    // Subtract XP cost
    this.currentXP -= this.xpNeeded;
    
    // Increase level
    this.level++;
    
    // Calculate new XP requirement
    this.xpNeeded = this.calculateXPNeeded(this.level);
    
    // Trigger level-up callback
    if (this.onLevelUpCallback)
    {
      this.onLevelUpCallback(this.level);
    }
    
    console.log(`[XPManager] LEVEL UP! Now level ${this.level} (Next: ${this.xpNeeded} XP)`);
  }
  
  /**
   * Get current XP
   */
  getCurrentXP(): number
  {
    return this.currentXP;
  }
  
  /**
   * Get current level
   */
  getLevel(): number
  {
    return this.level;
  }
  
  /**
   * Get XP needed for next level
   */
  getXPNeeded(): number
  {
    return this.xpNeeded;
  }
  
  /**
   * Get XP progress as percentage (0-1)
   */
  getXPProgress(): number
  {
    return this.currentXP / this.xpNeeded;
  }
  
  /**
   * Get XP progress as percentage string
   */
  getXPProgressPercent(): string
  {
    return `${Math.floor(this.getXPProgress() * 100)}%`;
  }
  
  /**
   * Set level-up callback
   */
  setOnLevelUp(callback: (newLevel: number) => void): void
  {
    this.onLevelUpCallback = callback;
  }
  
  /**
   * Reset XP and level to initial state
   */
  reset(startingLevel: number = 1, startingXP: number = 0): void
  {
    this.level = startingLevel;
    this.currentXP = startingXP;
    this.xpNeeded = this.calculateXPNeeded(this.level);
    
    console.log(`[XPManager] Reset to level ${this.level}`);
  }
  
  /**
   * Get stats for debugging
   */
  getStats(): { level: number; currentXP: number; xpNeeded: number; progress: string }
  {
    return {
      level: this.level,
      currentXP: this.currentXP,
      xpNeeded: this.xpNeeded,
      progress: this.getXPProgressPercent()
    };
  }
  
  /**
   * Preview XP requirements for future levels
   */
  previewXPCurve(startLevel: number, endLevel: number): { level: number; xpNeeded: number }[]
  {
    const curve: { level: number; xpNeeded: number }[] = [];
    
    for (let lvl = startLevel; lvl <= endLevel; lvl++)
    {
      curve.push({
        level: lvl,
        xpNeeded: this.calculateXPNeeded(lvl)
      });
    }
    
    return curve;
  }
}