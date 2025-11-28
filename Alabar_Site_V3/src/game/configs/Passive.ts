/**
 * passives.ts - Passive stat upgrades
 * Generic passives (affect all) + Weapon-specific passives
 */

import { PowerUp } from './PowerUps';

/**
 * GENERIC PASSIVES
 * Stack infinitely, max 12 levels each
 */

/**
 * MIGHT
 * Increases all damage dealt
 */
export const MightPassive = new PowerUp({
  id: "might",
  name: "Might",
  description: "Increases all damage dealt by 5% per level.",
  type: "passive",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Power_darkbolt", // Using darkbolt as placeholder icon
  hasLeveledAnimations: false,
  frameCount: 1,
  
  maxLevel: 12,
  rarity: "common",
  
  applyEffect: (player) =>
  {
    player.stats.damageMultiplier = player.stats.damageMultiplier || 1.0;
    player.stats.damageMultiplier += 0.05;
    
    console.log(`[Might] Damage multiplier: ${player.stats.damageMultiplier.toFixed(2)}x`);
  }
});

/**
 * MOVE SPEED
 * Increases movement speed
 */
export const MoveSpeedPassive = new PowerUp({
  id: "move_speed",
  name: "Move Speed",
  description: "Increases movement speed by 5% per level.",
  type: "passive",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Power_flower", // Using flower as placeholder icon
  hasLeveledAnimations: false,
  frameCount: 1,
  
  maxLevel: 12,
  rarity: "common",
  
  applyEffect: (player) =>
  {
    player.stats.moveSpeedMultiplier = player.stats.moveSpeedMultiplier || 1.0;
    player.stats.moveSpeedMultiplier += 0.05;
    
    // Update movement system speed
    if (player.movementSystem)
    {
      const baseSpeed = 3.0; // Base movement speed
      player.movementSystem.setSpeed(baseSpeed * player.stats.moveSpeedMultiplier);
    }
    
    console.log(`[MoveSpeed] Speed multiplier: ${player.stats.moveSpeedMultiplier.toFixed(2)}x`);
  }
});

/**
 * COOLDOWN REDUCTION
 * Reduces all cooldowns
 */
export const CooldownReductionPassive = new PowerUp({
  id: "cooldown_reduction",
  name: "Cooldown Reduction",
  description: "Reduces all weapon and power cooldowns by 3% per level.",
  type: "passive",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Power_firebolt", // Using firebolt as placeholder icon
  hasLeveledAnimations: false,
  frameCount: 1,
  
  maxLevel: 12,
  rarity: "common",
  
  applyEffect: (player) =>
  {
    player.stats.cooldownReduction = player.stats.cooldownReduction || 0;
    player.stats.cooldownReduction += 0.03;
    
    console.log(`[Cooldown] Reduction: ${(player.stats.cooldownReduction * 100).toFixed(0)}%`);
  }
});

/**
 * MAX HEALTH
 * Increases maximum health
 */
export const MaxHealthPassive = new PowerUp({
  id: "max_health",
  name: "Max Health",
  description: "Increases maximum health by 10 HP per level.",
  type: "passive",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Power_darkbolt", // Using darkbolt as placeholder icon
  hasLeveledAnimations: false,
  frameCount: 1,
  
  maxLevel: 12,
  rarity: "common",
  
  applyEffect: (player) =>
  {
    const oldMaxHealth = player.getMaxHealth();
    const newMaxHealth = oldMaxHealth + 10;
    
    // Increase max health
    player.maxHealth = newMaxHealth;
    
    // Heal by the amount increased (so player doesn't lose HP%)
    player.heal(10);
    
    console.log(`[MaxHealth] Max HP: ${oldMaxHealth} → ${newMaxHealth}`);
  }
});

/**
 * ARMOR
 * Flat damage reduction
 */
export const ArmorPassive = new PowerUp({
  id: "armor",
  name: "Armor",
  description: "Reduces incoming damage by 1 per level (flat reduction).",
  type: "passive",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Power_darkbolt", // Using darkbolt as placeholder icon
  hasLeveledAnimations: false,
  frameCount: 1,
  
  maxLevel: 12,
  rarity: "uncommon",
  
  applyEffect: (player) =>
  {
    player.stats.armor = player.stats.armor || 0;
    player.stats.armor += 1;
    
    console.log(`[Armor] Armor: ${player.stats.armor}`);
  }
});

/**
 * PROJECTILE SPEED
 * Increases projectile travel speed
 */
export const ProjectileSpeedPassive = new PowerUp({
  id: "projectile_speed",
  name: "Projectile Speed",
  description: "Increases projectile speed by 10% per level.",
  type: "passive",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Power_firebolt",
  hasLeveledAnimations: false,
  frameCount: 1,
  
  maxLevel: 12,
  rarity: "common",
  
  applyEffect: (player) =>
  {
    player.stats.projectileSpeedMultiplier = player.stats.projectileSpeedMultiplier || 1.0;
    player.stats.projectileSpeedMultiplier += 0.10;
    
    console.log(`[ProjectileSpeed] Speed multiplier: ${player.stats.projectileSpeedMultiplier.toFixed(2)}x`);
  }
});

/**
 * EXTRA PROJECTILE (ALL WEAPONS)
 * Very rare! Adds +1 projectile to ALL weapons
 */
export const ExtraProjectilePassive = new PowerUp({
  id: "extra_projectile",
  name: "Extra Projectile",
  description: "ALL weapons fire 1 additional projectile.",
  type: "passive",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Power_darkbolt",
  hasLeveledAnimations: false,
  frameCount: 1,
  
  maxLevel: 12,
  rarity: "rare",
  
  applyEffect: (player) =>
  {
    player.stats.projectileCount = player.stats.projectileCount || 1;
    player.stats.projectileCount += 1;
    
    console.log(`[ExtraProjectile] ALL weapons now fire ${player.stats.projectileCount} projectiles`);
  }
});

/**
 * PIERCING SHOT (ALL PROJECTILES)
 * Projectiles pierce through enemies
 */
export const PiercingShotPassive = new PowerUp({
  id: "piercing_shot",
  name: "Piercing Shot",
  description: "ALL projectiles pierce +1 enemy per level.",
  type: "passive",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Power_flower",
  hasLeveledAnimations: false,
  frameCount: 1,
  
  maxLevel: 12,
  rarity: "uncommon",
  
  applyEffect: (player) =>
  {
    player.stats.pierce = player.stats.pierce || 0;
    player.stats.pierce += 1;
    
    console.log(`[PiercingShot] Pierce count: ${player.stats.pierce}`);
  }
});

/**
 * WEAPON-SPECIFIC PASSIVES
 * Only appear if player has the weapon. Max 5 levels.
 */

/**
 * EXTRA AXE
 * Adds +1 axe projectile
 */
export const ExtraAxePassive = new PowerUp({
  id: "extra_axe",
  name: "Extra Axe",
  description: "Throws 1 additional axe.",
  type: "passive",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Weapon_axe",
  hasLeveledAnimations: false,
  frameCount: 1,
  
  maxLevel: 5,
  rarity: "common",
  
  applyEffect: (player) =>
  {
    player.weaponStats.axe = player.weaponStats.axe || {};
    player.weaponStats.axe.extraProjectiles = (player.weaponStats.axe.extraProjectiles || 0) + 1;
    
    console.log(`[ExtraAxe] Axe projectiles: +${player.weaponStats.axe.extraProjectiles}`);
  }
});

/**
 * EXTRA DAGGER
 * Adds +1 dagger projectile
 */
export const ExtraDaggerPassive = new PowerUp({
  id: "extra_dagger",
  name: "Extra Dagger",
  description: "Throws 1 additional dagger.",
  type: "passive",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Weapon_dagger",
  hasLeveledAnimations: false,
  frameCount: 1,
  
  maxLevel: 5,
  rarity: "common",
  
  applyEffect: (player) =>
  {
    player.weaponStats.dagger = player.weaponStats.dagger || {};
    player.weaponStats.dagger.extraProjectiles = (player.weaponStats.dagger.extraProjectiles || 0) + 1;
    
    console.log(`[ExtraDagger] Dagger projectiles: +${player.weaponStats.dagger.extraProjectiles}`);
  }
});

/**
 * EXTRA SWORD
 * Adds +1 sword projectile
 */
export const ExtraSwordPassive = new PowerUp({
  id: "extra_sword",
  name: "Extra Sword",
  description: "Throws 1 additional sword.",
  type: "passive",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Weapon_sword",
  hasLeveledAnimations: false,
  frameCount: 1,
  
  maxLevel: 5,
  rarity: "common",
  
  applyEffect: (player) =>
  {
    player.weaponStats.sword = player.weaponStats.sword || {};
    player.weaponStats.sword.extraProjectiles = (player.weaponStats.sword.extraProjectiles || 0) + 1;
    
    console.log(`[ExtraSword] Sword projectiles: +${player.weaponStats.sword.extraProjectiles}`);
  }
});

/**
 * EXTRA SHURIKEN
 * Adds +1 orbiting shuriken
 */
export const ExtraShurikenPassive = new PowerUp({
  id: "extra_shuriken",
  name: "Extra Shuriken",
  description: "Adds 1 additional orbiting shuriken.",
  type: "passive",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Weapon_shuriken",
  hasLeveledAnimations: false,
  frameCount: 1,
  
  maxLevel: 5,
  rarity: "common",
  
  applyEffect: (player) =>
  {
    player.weaponStats.shuriken = player.weaponStats.shuriken || {};
    player.weaponStats.shuriken.extraProjectiles = (player.weaponStats.shuriken.extraProjectiles || 0) + 1;
    
    console.log(`[ExtraShuriken] Shuriken count: +${player.weaponStats.shuriken.extraProjectiles}`);
  }
});

/**
 * EXPORT ALL PASSIVES
 */
export const GENERIC_PASSIVES = [
  MightPassive,
  MoveSpeedPassive,
  CooldownReductionPassive,
  MaxHealthPassive,
  ArmorPassive,
  ProjectileSpeedPassive,
  ExtraProjectilePassive, // RARE
  PiercingShotPassive
];

export const WEAPON_SPECIFIC_PASSIVES = [
  ExtraAxePassive,
  ExtraDaggerPassive,
  ExtraSwordPassive,
  ExtraShurikenPassive
];

export const ALL_PASSIVES = [
  ...GENERIC_PASSIVES,
  ...WEAPON_SPECIFIC_PASSIVES
];