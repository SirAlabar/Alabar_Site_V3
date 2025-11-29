/**
 * weapons.ts - Weapons with unique behaviors
 * Axe (arc), Dagger (straight), Sword (boomerang), Shuriken (orbital)
 * UPDATED: Works with multiple weapons array system
 */

import { PowerUp } from './PowerUps';

/**
 * Helper: Calculate weapon stats with scaling
 * Every level: +5% damage, +3% area, -2% cooldown
 */
function calculateWeaponStats(
  baseDamage: number,
  baseArea: number,
  baseCooldown: number,
  level: number
): { damage: number; area: number; cooldown: number }
{
  const damageMultiplier = Math.pow(1.05, level - 1);
  const areaMultiplier = Math.pow(1.03, level - 1);
  const cooldownMultiplier = Math.pow(0.98, level - 1);
  
  return {
    damage: baseDamage * damageMultiplier,
    area: baseArea * areaMultiplier,
    cooldown: baseCooldown * cooldownMultiplier
  };
}

/**
 * Generate full stat arrays for 12 levels
 */
function generateWeaponStats(
  baseDamage: number,
  baseArea: number,
  baseCooldown: number
): { damage: number[]; area: number[]; cooldown: number[] }
{
  const damage: number[] = [];
  const area: number[] = [];
  const cooldown: number[] = [];
  
  for (let level = 1; level <= 12; level++)
  {
    const stats = calculateWeaponStats(baseDamage, baseArea, baseCooldown, level);
    damage.push(stats.damage);
    area.push(stats.area);
    cooldown.push(stats.cooldown);
  }
  
  return { damage, area, cooldown };
}

/**
 * AXE
 * Behavior: Throw upward at 45° angle, arcs down
 * Pierce: Starts at 5, +5 every 3 levels (5, 5, 5, 10, 10, 10, 15, 15, 15, 20, 20, 20)
 */
const axeStats = generateWeaponStats(6, 1.2, 1.8);

export const AxeWeapon = new PowerUp({
  id: "axe",
  name: "Battle Axe",
  description: "Throws an axe that arcs through the air.",
  type: "weapon",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Weapon_axe",
  hasLeveledAnimations: false,
  frameCount: 5,
  
  maxLevel: 12,
  rarity: "common",
  
  damagePerLevel: axeStats.damage,
  areaPerLevel: axeStats.area,
  cooldownPerLevel: axeStats.cooldown,
  speedPerLevel: Array(12).fill(5), // Speed stays constant
  piercePerLevel: [5, 5, 5, 10, 10, 10, 15, 15, 15, 20, 20, 20], // +5 pierce every 3 levels
  
  applyEffect: (player, level) =>
  {
    const stats = AxeWeapon;
    
    // Calculate pierce for this weapon at this level
    const weaponPierce = stats.piercePerLevel ? stats.piercePerLevel[level - 1] : 0;
    
    // Store pierce in weaponStats
    player.weaponStats["axe"] = player.weaponStats["axe"] || {};
    player.weaponStats["axe"].pierce = weaponPierce;
    
    // Add or upgrade weapon in player's weapons array
    player.addOrUpgradeWeapon({
      id: "axe",
      name: "Battle Axe",
      level: level,
      damage: stats.damagePerLevel[level - 1],
      area: stats.areaPerLevel[level - 1],
      cooldown: stats.cooldownPerLevel[level - 1],
      speed: stats.speedPerLevel[level - 1],
      behavior: "arc", // Axe behavior
      frameName: stats.getWeaponFrame()
    });
    
    console.log(`[Axe] Level ${level} - Damage: ${stats.damagePerLevel[level - 1].toFixed(1)}, Cooldown: ${stats.cooldownPerLevel[level - 1].toFixed(2)}s, Pierce: ${weaponPierce}`);
  }
});

/**
 * DAGGER
 * Behavior: Throw in straight line (facing direction)
 */
const daggerStats = generateWeaponStats(4, 0.8, 0.6);

export const DaggerWeapon = new PowerUp({
  id: "dagger",
  name: "Dagger",
  description: "Throws a dagger in a straight line.",
  type: "weapon",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Weapon_dagger",
  hasLeveledAnimations: false,
  frameCount: 4,
  
  maxLevel: 12,
  rarity: "common",
  
  damagePerLevel: daggerStats.damage,
  areaPerLevel: daggerStats.area,
  cooldownPerLevel: daggerStats.cooldown,
  speedPerLevel: Array(12).fill(8), // Speed stays constant
  
  applyEffect: (player, level) =>
  {
    const stats = DaggerWeapon;
    
    // Add or upgrade weapon in player's weapons array
    player.addOrUpgradeWeapon({
      id: "dagger",
      name: "Dagger",
      level: level,
      damage: stats.damagePerLevel[level - 1],
      area: stats.areaPerLevel[level - 1],
      cooldown: stats.cooldownPerLevel[level - 1],
      speed: stats.speedPerLevel[level - 1],
      behavior: "straight", // Dagger behavior
      frameName: stats.getWeaponFrame()
    });
    
    console.log(`[Dagger] Level ${level} - Damage: ${stats.damagePerLevel[level - 1].toFixed(1)}, Cooldown: ${stats.cooldownPerLevel[level - 1].toFixed(2)}s`);
  }
});

/**
 * SWORD
 * Behavior: Projectile flies forward then returns (boomerang)
 */
const swordStats = generateWeaponStats(5, 1.0, 1.2);

export const SwordWeapon = new PowerUp({
  id: "sword",
  name: "Mystic Sword",
  description: "Throws a sword that returns like a boomerang.",
  type: "weapon",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Weapon_sword",
  hasLeveledAnimations: false,
  frameCount: 5,
  
  maxLevel: 12,
  rarity: "common",
  
  damagePerLevel: swordStats.damage,
  areaPerLevel: swordStats.area,
  cooldownPerLevel: swordStats.cooldown,
  speedPerLevel: Array(12).fill(6), // Speed stays constant
  
  applyEffect: (player, level) =>
  {
    const stats = SwordWeapon;
    
    // Add or upgrade weapon in player's weapons array
    player.addOrUpgradeWeapon({
      id: "sword",
      name: "Mystic Sword",
      level: level,
      damage: stats.damagePerLevel[level - 1],
      area: stats.areaPerLevel[level - 1],
      cooldown: stats.cooldownPerLevel[level - 1],
      speed: stats.speedPerLevel[level - 1],
      behavior: "boomerang", // Sword behavior
      frameName: stats.getWeaponFrame()
    });
    
    console.log(`[Sword] Level ${level} - Damage: ${stats.damagePerLevel[level - 1].toFixed(1)}, Cooldown: ${stats.cooldownPerLevel[level - 1].toFixed(2)}s`);
  }
});

/**
 * SHURIKEN
 * Behavior: Orbits around player constantly
 */
const shurikenStats = generateWeaponStats(3, 1.0, 0.2);

export const ShurikenWeapon = new PowerUp({
  id: "shuriken",
  name: "Orbiting Shuriken",
  description: "Shurikens constantly orbit around you.",
  type: "weapon",
  
  spritesheet: "powers_spritesheet",
  animationBase: "Weapon_shuriken",
  hasLeveledAnimations: false,
  frameCount: 5,
  
  maxLevel: 12,
  rarity: "common",
  
  damagePerLevel: shurikenStats.damage,
  areaPerLevel: shurikenStats.area,
  cooldownPerLevel: shurikenStats.cooldown,
  speedPerLevel: Array(12).fill(0), // Orbital weapon (no projectile speed)
  
  applyEffect: (player, level) =>
  {
    const stats = ShurikenWeapon;
    
    // Add or upgrade weapon in player's weapons array
    player.addOrUpgradeWeapon({
      id: "shuriken",
      name: "Orbiting Shuriken",
      level: level,
      damage: stats.damagePerLevel[level - 1],
      area: stats.areaPerLevel[level - 1],
      cooldown: stats.cooldownPerLevel[level - 1], // Time between damage ticks
      speed: 0, // Not a projectile
      behavior: "orbital", // Shuriken behavior
      frameName: stats.getWeaponFrame(),
      orbitRadius: 80, // Distance from player
      orbitSpeed: 2.0 // Rotation speed
    });
    
    console.log(`[Shuriken] Level ${level} - Damage: ${stats.damagePerLevel[level - 1].toFixed(1)}, Tick Rate: ${stats.cooldownPerLevel[level - 1].toFixed(2)}s`);
  }
});

/**
 * MAJOR UPGRADE OPTIONS
 * Every 3 levels (3, 6, 9, 12), player chooses 1 of 3 options
 */
export interface MajorUpgradeOption
{
  id: string;
  name: string;
  description: string;
  level: number; // Which level this appears at (3, 6, 9, or 12)
  apply: (player: any) => void;
}

/**
 * Generate major upgrade options for a specific level
 */
export function getMajorUpgradeOptions(weaponId: string, level: number): MajorUpgradeOption[]
{
  // Level 3: +10% damage OR +10% area OR +1 projectile
  if (level === 3)
  {
    return [
      {
        id: `${weaponId}_damage_boost_3`,
        name: "Heavy Strike",
        description: "+10% damage",
        level: 3,
        apply: (player) =>
        {
          // Find weapon in array and update it
          const weapon = player.activeWeapons.find((w: any) => w.id === weaponId);
          if (weapon)
          {
            weapon.damage *= 1.10;
            console.log(`[MajorUpgrade] Heavy Strike applied to ${weapon.name} - Damage: ${weapon.damage.toFixed(1)}`);
          }
        }
      },
      {
        id: `${weaponId}_area_boost_3`,
        name: "Wide Swing",
        description: "+10% area",
        level: 3,
        apply: (player) =>
        {
          // Find weapon in array and update it
          const weapon = player.activeWeapons.find((w: any) => w.id === weaponId);
          if (weapon)
          {
            weapon.area *= 1.10;
            console.log(`[MajorUpgrade] Wide Swing applied to ${weapon.name} - Area: ${weapon.area.toFixed(2)}`);
          }
        }
      },
      {
        id: `${weaponId}_projectile_3`,
        name: "Multi-Strike",
        description: "+1 projectile",
        level: 3,
        apply: (player) =>
        {
          player.weaponStats[weaponId] = player.weaponStats[weaponId] || {};
          player.weaponStats[weaponId].extraProjectiles = (player.weaponStats[weaponId].extraProjectiles || 0) + 1;
          console.log(`[MajorUpgrade] Multi-Strike applied to ${weaponId} - Extra Projectiles: ${player.weaponStats[weaponId].extraProjectiles}`);
        }
      }
    ];
  }
  
  // Level 6: +10% damage OR +10% area OR -15% cooldown
  if (level === 6)
  {
    return [
      {
        id: `${weaponId}_damage_boost_6`,
        name: "Heavy Strike II",
        description: "+10% damage",
        level: 6,
        apply: (player) =>
        {
          // Find weapon in array and update it
          const weapon = player.activeWeapons.find((w: any) => w.id === weaponId);
          if (weapon)
          {
            weapon.damage *= 1.10;
            console.log(`[MajorUpgrade] Heavy Strike II applied to ${weapon.name} - Damage: ${weapon.damage.toFixed(1)}`);
          }
        }
      },
      {
        id: `${weaponId}_area_boost_6`,
        name: "Wide Swing II",
        description: "+10% area",
        level: 6,
        apply: (player) =>
        {
          // Find weapon in array and update it
          const weapon = player.activeWeapons.find((w: any) => w.id === weaponId);
          if (weapon)
          {
            weapon.area *= 1.10;
            console.log(`[MajorUpgrade] Wide Swing II applied to ${weapon.name} - Area: ${weapon.area.toFixed(2)}`);
          }
        }
      },
      {
        id: `${weaponId}_cooldown_6`,
        name: "Swift Attacks",
        description: "-15% cooldown",
        level: 6,
        apply: (player) =>
        {
          // Find weapon in array and update it
          const weapon = player.activeWeapons.find((w: any) => w.id === weaponId);
          if (weapon)
          {
            weapon.cooldown *= 0.85;
            console.log(`[MajorUpgrade] Swift Attacks applied to ${weapon.name} - Cooldown: ${weapon.cooldown.toFixed(2)}s`);
          }
        }
      }
    ];
  }
  
  // Level 9: +10% damage OR +10% area OR +1 projectile
  if (level === 9)
  {
    return [
      {
        id: `${weaponId}_damage_boost_9`,
        name: "Heavy Strike III",
        description: "+10% damage",
        level: 9,
        apply: (player) =>
        {
          // Find weapon in array and update it
          const weapon = player.activeWeapons.find((w: any) => w.id === weaponId);
          if (weapon)
          {
            weapon.damage *= 1.10;
            console.log(`[MajorUpgrade] Heavy Strike III applied to ${weapon.name} - Damage: ${weapon.damage.toFixed(1)}`);
          }
        }
      },
      {
        id: `${weaponId}_area_boost_9`,
        name: "Wide Swing III",
        description: "+10% area",
        level: 9,
        apply: (player) =>
        {
          // Find weapon in array and update it
          const weapon = player.activeWeapons.find((w: any) => w.id === weaponId);
          if (weapon)
          {
            weapon.area *= 1.10;
            console.log(`[MajorUpgrade] Wide Swing III applied to ${weapon.name} - Area: ${weapon.area.toFixed(2)}`);
          }
        }
      },
      {
        id: `${weaponId}_projectile_9`,
        name: "Multi-Strike II",
        description: "+1 projectile",
        level: 9,
        apply: (player) =>
        {
          player.weaponStats[weaponId] = player.weaponStats[weaponId] || {};
          player.weaponStats[weaponId].extraProjectiles = (player.weaponStats[weaponId].extraProjectiles || 0) + 1;
          console.log(`[MajorUpgrade] Multi-Strike II applied to ${weaponId} - Extra Projectiles: ${player.weaponStats[weaponId].extraProjectiles}`);
        }
      }
    ];
  }
  
  // Level 12: +10% damage OR +10% area OR +1 pierce
  if (level === 12)
  {
    return [
      {
        id: `${weaponId}_damage_boost_12`,
        name: "Heavy Strike IV",
        description: "+10% damage",
        level: 12,
        apply: (player) =>
        {
          // Find weapon in array and update it
          const weapon = player.activeWeapons.find((w: any) => w.id === weaponId);
          if (weapon)
          {
            weapon.damage *= 1.10;
            console.log(`[MajorUpgrade] Heavy Strike IV applied to ${weapon.name} - Damage: ${weapon.damage.toFixed(1)}`);
          }
        }
      },
      {
        id: `${weaponId}_area_boost_12`,
        name: "Wide Swing IV",
        description: "+10% area",
        level: 12,
        apply: (player) =>
        {
          // Find weapon in array and update it
          const weapon = player.activeWeapons.find((w: any) => w.id === weaponId);
          if (weapon)
          {
            weapon.area *= 1.10;
            console.log(`[MajorUpgrade] Wide Swing IV applied to ${weapon.name} - Area: ${weapon.area.toFixed(2)}`);
          }
        }
      },
      {
        id: `${weaponId}_pierce_12`,
        name: "Piercing Strike",
        description: "+1 pierce",
        level: 12,
        apply: (player) =>
        {
          player.weaponStats[weaponId] = player.weaponStats[weaponId] || {};
          player.weaponStats[weaponId].pierce = (player.weaponStats[weaponId].pierce || 0) + 1;
          console.log(`[MajorUpgrade] Piercing Strike applied to ${weaponId} - Pierce: ${player.weaponStats[weaponId].pierce}`);
        }
      }
    ];
  }
  
  return [];
}

/**
 * EXPORT ALL WEAPONS
 */
export const ALL_WEAPONS = [
  AxeWeapon,
  DaggerWeapon,
  SwordWeapon,
  ShurikenWeapon
];