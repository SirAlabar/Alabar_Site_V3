/**
 * PowerManager.ts - Manages all power-ups, active powers, and level-up cards
 */

import { PowerUp } from './PowerUps';
import { ALL_POWERS } from './Power';
import { ALL_PASSIVES, GENERIC_PASSIVES, WEAPON_SPECIFIC_PASSIVES } from './Passive';
import { ALL_WEAPONS } from './Weapons';

export interface CardOption
{
  powerUp: PowerUp;
  isNew: boolean; // True if player doesn't have this yet
}

export class PowerManager
{
  // All available power-ups
  private allPowers: PowerUp[];
  private allPassives: PowerUp[];
  private allWeapons: PowerUp[];
  
  // Player's acquired power-ups (by id)
  private ownedPowerUps: Map<string, PowerUp>;
  
  // Reference to player
  private player: any;
  
  constructor(player: any)
  {
    this.player = player;
    
    // Initialize all power-ups
    this.allPowers = [...ALL_POWERS];
    this.allPassives = [...ALL_PASSIVES];
    this.allWeapons = [...ALL_WEAPONS];
    
    // Track owned power-ups
    this.ownedPowerUps = new Map();
    
    // Initialize player stats if not exists
    this.initializePlayerStats();
  }
  
  /**
   * Initialize player stats structure
   */
  private initializePlayerStats(): void
  {
    if (!this.player.stats)
    {
      this.player.stats = {};
    }
    
    if (!this.player.weaponStats)
    {
      this.player.weaponStats = {};
    }
    
    if (!this.player.powers)
    {
      this.player.powers = [];
    }
    
    // Default stat values
    this.player.stats.damageMultiplier = this.player.stats.damageMultiplier ?? 1.0;
    this.player.stats.moveSpeedMultiplier = this.player.stats.moveSpeedMultiplier ?? 1.0;
    this.player.stats.cooldownReduction = this.player.stats.cooldownReduction ?? 0;
    this.player.stats.armor = this.player.stats.armor ?? 0;
    this.player.stats.projectileSpeedMultiplier = this.player.stats.projectileSpeedMultiplier ?? 1.0;
    this.player.stats.projectileCount = this.player.stats.projectileCount ?? 1;
    this.player.stats.pierce = this.player.stats.pierce ?? 0;
  }
  
  /**
   * Add a weapon to player (called at game start or when picking new weapon)
   */
  addWeapon(weaponId: string): boolean
  {
    const weapon = this.allWeapons.find(w => w.id === weaponId);
    
    if (!weapon)
    {
      console.error(`[PowerManager] Weapon not found: ${weaponId}`);
      return false;
    }
    
    // Level up to 1
    weapon.levelUp(this.player);
    
    // Track as owned
    this.ownedPowerUps.set(weaponId, weapon);
    
    console.log(`[PowerManager] Added weapon: ${weapon.name}`);
    return true;
  }
  
  /**
   * Add or level up a power-up
   */
  addPowerUp(powerUpId: string): boolean
  {
    // Check if already owned
    const owned = this.ownedPowerUps.get(powerUpId);
    
    if (owned)
    {
      // Level up existing
      if (owned.canLevelUp())
      {
        owned.levelUp(this.player);
        console.log(`[PowerManager] Leveled up: ${owned.name} (${owned.level}/${owned.maxLevel})`);
        return true;
      }
      else
      {
        console.warn(`[PowerManager] ${owned.name} is already max level`);
        return false;
      }
    }
    
    // Find in all power-ups
    const powerUp = [...this.allPowers, ...this.allPassives, ...this.allWeapons]
      .find(p => p.id === powerUpId);
    
    if (!powerUp)
    {
      console.error(`[PowerManager] Power-up not found: ${powerUpId}`);
      return false;
    }
    
    // Add new power-up (level to 1)
    powerUp.levelUp(this.player);
    
    // Track as owned
    this.ownedPowerUps.set(powerUpId, powerUp);
    
    console.log(`[PowerManager] Added new power-up: ${powerUp.name}`);
    return true;
  }
  
  /**
   * Generate 3 random power-up cards for level-up
   */
  generateLevelUpCards(): CardOption[]
  {
    const availableOptions: { powerUp: PowerUp; weight: number; isNew: boolean }[] = [];
    
    // Check if player has a weapon
    const hasWeapon = this.player.activeWeapon !== undefined;
    
    // 1. WEAPON UPGRADES (25% weight) - only if player has weapon
    if (hasWeapon)
    {
      const weaponId = this.player.activeWeapon.id;
      const weapon = this.ownedPowerUps.get(weaponId);
      
      if (weapon && weapon.canLevelUp())
      {
        availableOptions.push({
          powerUp: weapon,
          weight: 25,
          isNew: false
        });
      }
    }
    
    // 2. ACTIVE POWERS
    for (const power of this.allPowers)
    {
      const owned = this.ownedPowerUps.get(power.id);
      
      if (!owned)
      {
        // New power (20% weight)
        availableOptions.push({
          powerUp: power,
          weight: 20,
          isNew: true
        });
      }
      else if (owned.canLevelUp())
      {
        // Upgrade existing power (15% weight)
        availableOptions.push({
          powerUp: owned,
          weight: 15,
          isNew: false
        });
      }
    }
    
    // 3. GENERIC PASSIVES (25% weight)
    for (const passive of GENERIC_PASSIVES)
    {
      const owned = this.ownedPowerUps.get(passive.id);
      
      if (!owned)
      {
        // New passive
        availableOptions.push({
          powerUp: passive,
          weight: passive.rarity === "rare" ? 5 : 25,
          isNew: true
        });
      }
      else if (owned.canLevelUp())
      {
        // Upgrade passive
        availableOptions.push({
          powerUp: owned,
          weight: passive.rarity === "rare" ? 5 : 25,
          isNew: false
        });
      }
    }
    
    // 4. WEAPON-SPECIFIC PASSIVES (10% weight) - only if player has that weapon
    if (hasWeapon)
    {
      const weaponId = this.player.activeWeapon.id;
      
      for (const passive of WEAPON_SPECIFIC_PASSIVES)
      {
        // Check if this passive is for player's weapon
        if (passive.id.includes(weaponId))
        {
          const owned = this.ownedPowerUps.get(passive.id);
          
          if (!owned)
          {
            availableOptions.push({
              powerUp: passive,
              weight: 10,
              isNew: true
            });
          }
          else if (owned.canLevelUp())
          {
            availableOptions.push({
              powerUp: owned,
              weight: 10,
              isNew: false
            });
          }
        }
      }
    }
    
    // If no options available, return empty
    if (availableOptions.length === 0)
    {
      console.warn('[PowerManager] No power-ups available for level-up!');
      return [];
    }
    
    // Weighted random selection (pick 3 unique)
    const selected: CardOption[] = [];
    const availableCopy = [...availableOptions];
    
    for (let i = 0; i < 3 && availableCopy.length > 0; i++)
    {
      const choice = this.weightedRandomChoice(availableCopy);
      
      if (choice)
      {
        selected.push({
          powerUp: choice.powerUp,
          isNew: choice.isNew
        });
        
        // Remove from available to prevent duplicates
        const index = availableCopy.indexOf(choice);
        availableCopy.splice(index, 1);
      }
    }
    
    return selected;
  }
  
  /**
   * Weighted random selection
   */
  private weightedRandomChoice<T extends { weight: number }>(options: T[]): T | null
  {
    if (options.length === 0) return null;
    
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const option of options)
    {
      random -= option.weight;
      if (random <= 0)
      {
        return option;
      }
    }
    
    return options[0]; // Fallback
  }
  
  /**
   * Update all active powers
   */
  update(delta: number): void
  {
    // Update all active powers on player
    if (this.player.powers)
    {
      for (const power of this.player.powers)
      {
        if (power.update)
        {
          power.update(delta);
        }
      }
    }
  }
  
  /**
   * Get owned power-up by id
   */
  getOwnedPowerUp(id: string): PowerUp | undefined
  {
    return this.ownedPowerUps.get(id);
  }
  
  /**
   * Get all owned power-ups
   */
  getAllOwnedPowerUps(): PowerUp[]
  {
    return Array.from(this.ownedPowerUps.values());
  }
  
  /**
   * Check if player has a specific power-up
   */
  hasPowerUp(id: string): boolean
  {
    return this.ownedPowerUps.has(id);
  }
  
  /**
   * Get stats summary for debugging
   */
  getStatsSummary(): string
  {
    const lines: string[] = [];
    
    lines.push('=== PLAYER STATS ===');
    lines.push(`Damage Multiplier: ${this.player.stats.damageMultiplier.toFixed(2)}x`);
    lines.push(`Move Speed Multiplier: ${this.player.stats.moveSpeedMultiplier.toFixed(2)}x`);
    lines.push(`Cooldown Reduction: ${(this.player.stats.cooldownReduction * 100).toFixed(0)}%`);
    lines.push(`Armor: ${this.player.stats.armor}`);
    lines.push(`Projectile Count: ${this.player.stats.projectileCount}`);
    lines.push(`Pierce: ${this.player.stats.pierce}`);
    
    lines.push('\n=== OWNED POWER-UPS ===');
    for (const powerUp of this.ownedPowerUps.values())
    {
      lines.push(`${powerUp.name}: Level ${powerUp.level}/${powerUp.maxLevel}`);
    }
    
    return lines.join('\n');
  }
  
  /**
   * Reset all power-ups (for game restart)
   */
  reset(): void
  {
    this.ownedPowerUps.clear();
    this.player.powers = [];
    this.player.activeWeapon = undefined;
    this.initializePlayerStats();
    
    // Reset all power-up levels
    for (const power of [...this.allPowers, ...this.allPassives, ...this.allWeapons])
    {
      power.level = 0;
    }
    
    console.log('[PowerManager] Reset complete');
  }
}