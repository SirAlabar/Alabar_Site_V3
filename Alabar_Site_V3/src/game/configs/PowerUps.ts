/**
 * PowerUp.ts - Base class for all power-ups (weapons, powers, passives)
 * Updated with visual system and level-based progression
 */

export type PowerUpType = "weapon" | "power" | "passive";

export interface PowerUpEffect
{
  (player: any, level: number): void;
}

export interface PowerUpConfig
{
  id: string;
  name: string;
  description: string;
  type: PowerUpType;
  
  // Visuals
  spritesheet: string; // "powers_spritesheet"
  animationBase: string; // "Power_explosion", "Weapon_axe"
  hasLeveledAnimations: boolean; // true for explosion/magicfield/etc
  animationTiers?: string[]; // ["lvl1", "lvl2", "lvl3"] or []
  frameCount?: number; // Number of frames in animation
  
  // Progression
  maxLevel?: number; // Default 12 for powers/weapons, 5 for weapon-specific passives
  
  // Rarity (for card generation)
  rarity?: "common" | "uncommon" | "rare";
  
  // Stats per level (arrays with maxLevel values)
  damagePerLevel?: number[];
  cooldownPerLevel?: number[];
  radiusPerLevel?: number[];
  durationPerLevel?: number[];
  speedPerLevel?: number[];
  areaPerLevel?: number[];
  countPerLevel?: number[]; // projectile/effect count
  piercePerLevel?: number[];
  tickRatePerLevel?: number[];
  
  // Effect application
  applyEffect: PowerUpEffect;
}

export class PowerUp
{
  id: string;
  name: string;
  description: string;
  type: PowerUpType;
  
  // Visuals
  spritesheet: string;
  animationBase: string;
  hasLeveledAnimations: boolean;
  animationTiers: string[];
  frameCount: number;
  
  // Progression
  level: number;
  maxLevel: number;
  
  // Rarity
  rarity: "common" | "uncommon" | "rare";
  
  // Stats arrays
  damagePerLevel: number[];
  cooldownPerLevel: number[];
  radiusPerLevel: number[];
  durationPerLevel: number[];
  speedPerLevel: number[];
  areaPerLevel: number[];
  countPerLevel: number[];
  piercePerLevel: number[];
  tickRatePerLevel: number[];
  
  // Effect
  applyEffect: PowerUpEffect;
  
  constructor(config: PowerUpConfig)
  {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.type = config.type;
    
    // Visuals
    this.spritesheet = config.spritesheet;
    this.animationBase = config.animationBase;
    this.hasLeveledAnimations = config.hasLeveledAnimations;
    this.animationTiers = config.animationTiers ?? [];
    this.frameCount = config.frameCount ?? 1;
    
    // Progression
    this.level = 0;
    this.maxLevel = config.maxLevel ?? 12;
    
    // Rarity
    this.rarity = config.rarity ?? "common";
    
    // Stats
    this.damagePerLevel = config.damagePerLevel ?? [];
    this.cooldownPerLevel = config.cooldownPerLevel ?? [];
    this.radiusPerLevel = config.radiusPerLevel ?? [];
    this.durationPerLevel = config.durationPerLevel ?? [];
    this.speedPerLevel = config.speedPerLevel ?? [];
    this.areaPerLevel = config.areaPerLevel ?? [];
    this.countPerLevel = config.countPerLevel ?? [];
    this.piercePerLevel = config.piercePerLevel ?? [];
    this.tickRatePerLevel = config.tickRatePerLevel ?? [];
    
    // Effect
    this.applyEffect = config.applyEffect;
  }
  
  /**
   * Get current animation name based on level
   * Examples:
   * - Power_explosion at level 5 → "Power_explosion_lvl2"
   * - Power_aura at level 10 → "Power_aura_lvl4"
   * - Weapon_axe at level 7 → "Weapon_axe" (no level tiers)
   */
  getAnimationName(): string
  {
    if (!this.hasLeveledAnimations || this.animationTiers.length === 0)
    {
      return this.animationBase;
    }
    
    // For powers with 4 tiers (Aura: lvl1, lvl2, lvl3, lvl4)
    if (this.animationTiers.length === 4)
    {
      if (this.level <= 3) return `${this.animationBase}_${this.animationTiers[0]}`;
      if (this.level <= 6) return `${this.animationBase}_${this.animationTiers[1]}`;
      if (this.level <= 9) return `${this.animationBase}_${this.animationTiers[2]}`;
      return `${this.animationBase}_${this.animationTiers[3]}`;
    }
    
    // For powers with 3 tiers (Explosion, MagicField, WindCut)
    if (this.animationTiers.length === 3)
    {
      if (this.level <= 4) return `${this.animationBase}_${this.animationTiers[0]}`;
      if (this.level <= 8) return `${this.animationBase}_${this.animationTiers[1]}`;
      return `${this.animationBase}_${this.animationTiers[2]}`;
    }
    
    return this.animationBase;
  }
  
  /**
   * Get current frame for weapons (changes every 3 levels)
   * Weapon_axe at level 7 → "Weapon_axe_2"
   */
  getWeaponFrame(): string
  {
    if (this.type !== "weapon")
    {
      return `${this.animationBase}_0`;
    }
    
    if (this.level <= 3) return `${this.animationBase}_0`;
    if (this.level <= 6) return `${this.animationBase}_1`;
    if (this.level <= 9) return `${this.animationBase}_2`;
    return `${this.animationBase}_3`;
  }
  
  /**
   * Get icon frame for card display
   * - Weapons: Use current level frame
   * - Powers: Use frame 0 of current animation
   * - Passives: Use frame 0
   */
  getIconFrame(): string
  {
    if (this.type === "weapon")
    {
      return this.getWeaponFrame();
    }
    
    if (this.hasLeveledAnimations)
    {
      return `${this.getAnimationName()}_0`;
    }
    
    return `${this.animationBase}_0`;
  }
  
  /**
   * Get current stat value by level
   */
  getCurrentDamage(): number
  {
    return this.damagePerLevel[this.level - 1] ?? 0;
  }
  
  getCurrentCooldown(): number
  {
    return this.cooldownPerLevel[this.level - 1] ?? 0;
  }
  
  getCurrentRadius(): number
  {
    return this.radiusPerLevel[this.level - 1] ?? 0;
  }
  
  getCurrentDuration(): number
  {
    return this.durationPerLevel[this.level - 1] ?? 0;
  }
  
  getCurrentSpeed(): number
  {
    return this.speedPerLevel[this.level - 1] ?? 0;
  }
  
  getCurrentArea(): number
  {
    return this.areaPerLevel[this.level - 1] ?? 1;
  }
  
  getCurrentCount(): number
  {
    return this.countPerLevel[this.level - 1] ?? 1;
  }
  
  getCurrentPierce(): number
  {
    return this.piercePerLevel[this.level - 1] ?? 0;
  }
  
  getCurrentTickRate(): number
  {
    return this.tickRatePerLevel[this.level - 1] ?? 1;
  }
  
  /**
   * Get next level stat value (for card preview)
   */
  getNextDamage(): number
  {
    return this.damagePerLevel[this.level] ?? this.getCurrentDamage();
  }
  
  getNextCooldown(): number
  {
    return this.cooldownPerLevel[this.level] ?? this.getCurrentCooldown();
  }
  
  getNextRadius(): number
  {
    return this.radiusPerLevel[this.level] ?? this.getCurrentRadius();
  }
  
  /**
   * Check if can level up
   */
  canLevelUp(): boolean
  {
    return this.level < this.maxLevel;
  }
  
  /**
   * Level up and apply effect
   */
  levelUp(player: any): void
  {
    if (!this.canLevelUp())
    {
      return;
    }
    
    this.level++;
    
    // Apply effect with current level
    this.applyEffect(player, this.level);
    
    console.log(`[PowerUp] ${this.name} leveled up to ${this.level}/${this.maxLevel}`);
  }
  
  /**
   * Get description with current stats
   */
  getDescriptionWithStats(): string
  {
    let desc = this.description;
    
    // Add current stats if available
    if (this.level > 0)
    {
      const stats: string[] = [];
      
      if (this.damagePerLevel.length > 0)
      {
        stats.push(`Damage: ${Math.floor(this.getCurrentDamage())}`);
      }
      
      if (this.cooldownPerLevel.length > 0)
      {
        stats.push(`Cooldown: ${this.getCurrentCooldown().toFixed(1)}s`);
      }
      
      if (this.radiusPerLevel.length > 0)
      {
        stats.push(`Radius: ${Math.floor(this.getCurrentRadius())}`);
      }
      
      if (this.countPerLevel.length > 0 && this.getCurrentCount() > 1)
      {
        stats.push(`Count: ${this.getCurrentCount()}`);
      }
      
      if (this.piercePerLevel.length > 0 && this.getCurrentPierce() > 0)
      {
        stats.push(`Pierce: ${this.getCurrentPierce()}`);
      }
      
      if (stats.length > 0)
      {
        desc += `\n\n${stats.join(" | ")}`;
      }
    }
    
    return desc;
  }
  
  /**
   * Get level progress text
   */
  getLevelText(): string
  {
    if (this.level === 0)
    {
      return "NEW";
    }
    
    return `Level ${this.level}/${this.maxLevel}`;
  }
}