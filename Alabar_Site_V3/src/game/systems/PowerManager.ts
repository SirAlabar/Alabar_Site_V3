/**
 * PowerManager.ts - Manages all power-ups, active powers, and level-up cards
 */

import { PowerUp } from '../configs/PowerUps';
import { ALL_POWERS } from '../configs/Power';
import { ALL_PASSIVES, GENERIC_PASSIVES, WEAPON_SPECIFIC_PASSIVES } from '../configs/Passive';
import { ALL_WEAPONS } from '../configs/Weapons';

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
   * Generate level-up cards (ALWAYS 3 cards)
   * LEVELS 1-3: Guarantee 1 NEW weapon + 1 NEW power + 1 passive (shuffled randomly)
   * LEVEL 4+: Completely random (any weapon/power/passive, new or upgrade)
   */
  generateLevelUpCards(): CardOption[]
  {
    const level = this.player.getLevel();
    const earlyGame = level <= 3;

    console.log(`[PowerManager] Generating cards for level ${level}`);

    // =============================================================
    // LEVELS 1-3: Guarantee 1 NEW weapon + 1 NEW power + 1 passive
    // =============================================================
    if (earlyGame)
    {
      const cards: CardOption[] = [];

      // CARD 1: Pick random NEW weapon
      const unownedWeapons = this.allWeapons.filter(w => !this.ownedPowerUps.has(w.id));
      
      if (unownedWeapons.length > 0)
      {
        const randomWeapon = unownedWeapons[Math.floor(Math.random() * unownedWeapons.length)];
        cards.push({
          powerUp: randomWeapon,
          isNew: true
        });
        console.log(`[PowerManager] Early game - NEW weapon: ${randomWeapon.name}`);
      }

      // CARD 2: Pick random NEW power
      const unownedPowers = this.allPowers.filter(p => !this.ownedPowerUps.has(p.id));
      
      if (unownedPowers.length > 0)
      {
        const randomPower = unownedPowers[Math.floor(Math.random() * unownedPowers.length)];
        cards.push({
          powerUp: randomPower,
          isNew: true
        });
        console.log(`[PowerManager] Early game - NEW power: ${randomPower.name}`);
      }

      // CARD 3: Pick random passive
      const passiveOptions: PowerUp[] = [];

      // Add generic passives
      for (const passive of GENERIC_PASSIVES)
      {
        passiveOptions.push(passive);
      }

      // Add weapon-specific passives ONLY if player owns the weapon
      for (const passive of WEAPON_SPECIFIC_PASSIVES)
      {
        const weaponId = passive.id.replace('extra_', '');
        if (this.ownedPowerUps.has(weaponId))
        {
          passiveOptions.push(passive);
        }
      }

      if (passiveOptions.length > 0)
      {
        const randomPassive = passiveOptions[Math.floor(Math.random() * passiveOptions.length)];
        const isNew = !this.ownedPowerUps.has(randomPassive.id);
        
        cards.push({
          powerUp: randomPassive,
          isNew: isNew
        });
        console.log(`[PowerManager] Early game - passive: ${randomPassive.name} (${isNew ? 'NEW' : 'UPGRADE'})`);
      }

      // SHUFFLE the cards randomly
      for (let i = cards.length - 1; i > 0; i--)
      {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }

      console.log(`[PowerManager] Generated ${cards.length} cards (SHUFFLED) for level ${level}`);
      return cards;
    }

    // =============================================================
    // LEVEL 4+: Completely random
    // =============================================================
    const allOptions: { powerUp: PowerUp; weight: number; isNew: boolean }[] = [];

    // NEW weapons
    for (const weapon of this.allWeapons)
    {
      if (!this.ownedPowerUps.has(weapon.id))
      {
        allOptions.push({
          powerUp: weapon,
          weight: 20,
          isNew: true
        });
      }
    }

    // OWNED weapon upgrades
    for (const weapon of this.allWeapons)
    {
      const owned = this.ownedPowerUps.get(weapon.id);
      if (owned && owned.canLevelUp())
      {
        allOptions.push({
          powerUp: owned,
          weight: 20,
          isNew: false
        });
      }
    }

    // NEW powers
    for (const power of this.allPowers)
    {
      if (!this.ownedPowerUps.has(power.id))
      {
        allOptions.push({
          powerUp: power,
          weight: 20,
          isNew: true
        });
      }
    }

    // OWNED power upgrades
    for (const power of this.allPowers)
    {
      const owned = this.ownedPowerUps.get(power.id);
      if (owned && owned.canLevelUp())
      {
        allOptions.push({
          powerUp: owned,
          weight: 20,
          isNew: false
        });
      }
    }

    // Generic passives
    for (const passive of GENERIC_PASSIVES)
    {
      const owned = this.ownedPowerUps.get(passive.id);
      allOptions.push({
        powerUp: passive,
        weight: 20,
        isNew: !owned
      });
    }

    // Weapon-specific passives (ONLY if player owns the weapon)
    for (const passive of WEAPON_SPECIFIC_PASSIVES)
    {
      const weaponId = passive.id.replace('extra_', '');
      const ownsWeapon = this.ownedPowerUps.has(weaponId);

      if (ownsWeapon)
      {
        const owned = this.ownedPowerUps.get(passive.id);
        allOptions.push({
          powerUp: passive,
          weight: 20,
          isNew: !owned
        });
      }
    }

    // Pick 3 random cards (no duplicates)
    const cards: CardOption[] = [];
    const availableCopy = [...allOptions];

    for (let i = 0; i < 3 && availableCopy.length > 0; i++)
    {
      const choice = this.weightedRandomChoice(availableCopy);
      if (!choice) break;

      cards.push({
        powerUp: choice.item.powerUp,
        isNew: choice.item.isNew
      });

      console.log(`[PowerManager] Card ${i + 1}: ${choice.item.isNew ? 'NEW' : 'UPGRADE'} ${choice.item.powerUp.name}`);

      // Remove selected option
      availableCopy.splice(choice.index, 1);
    }

    console.log(`[PowerManager] Generated ${cards.length} cards for level ${level}`);
    return cards;
  }
  
  /**
   * Weighted random selection
   */
  private weightedRandomChoice<T extends { weight: number }>(options: T[]): { item: T, index: number } | null
  {
    if (options.length === 0) return null;

    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < options.length; i++)
    {
      const opt = options[i];
      random -= opt.weight;

      if (random <= 0)
      {
        return { item: opt, index: i };
      }
    }

    return { item: options[0], index: 0 }; // fallback
  }
  
  /**
   * Update all active powers
   */
  update(delta: number): void
  {
    // Update all active powers on player
    if (!this.player.powers)
    {
      console.warn('[PowerManager] No powers array on player!');
      return;
    }
    
    for (const power of this.player.powers)
    {
      if (!power.update)
      {
        console.warn(`[PowerManager] Power ${power.id} has no update method!`);
        continue;
      }
      
      power.update(delta);
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
  }
}