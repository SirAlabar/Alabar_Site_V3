/**
 * powers.ts - Active auto-cast powers
 * Explosion, Magic Field, Wind Cut, Aura
 */

import { PowerUp } from './PowerUps';

/**
 * Helper: Generate scaling array
 */
function generateScaling(base: number, scale: number, levels: number): number[]
{
  const result: number[] = [];
  for (let i = 0; i < levels; i++)
  {
    result.push(base * Math.pow(1 + scale, i));
  }
  return result;
}

/**
 * Helper: Generate linear scaling array
 */
function generateLinearScaling(base: number, increment: number, levels: number): number[]
{
  const result: number[] = [];
  for (let i = 0; i < levels; i++)
  {
    result.push(base + increment * i);
  }
  return result;
}

/**
 * EXPLOSION
 * Random explosion near player periodically
 */
export const ExplosionPower = new PowerUp({
  id: "explosion",
  name: "Arcane Explosion",
  description: "A powerful explosion occurs near you periodically.",
  type: "power",
  
  // Visuals
  spritesheet: "powers_spritesheet",
  animationBase: "Power_explosion",
  hasLeveledAnimations: true,
  animationTiers: ["lvl1", "lvl2", "lvl3"],
  frameCount: 10,
  
  maxLevel: 12,
  rarity: "uncommon",
  
  // Stats per level
  damagePerLevel: generateScaling(20, 0.15, 12), // +15% per level
  radiusPerLevel: generateScaling(100, 0.10, 12), // +5% per level
  cooldownPerLevel: generateScaling(5.0, -0.03, 12), // -3% per level (gets faster)
  countPerLevel: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // +1 explosion per level
  
  applyEffect: (player, level) =>
  {
    // Remove old explosion power if exists
    player.powers = player.powers.filter((p: any) => p.id !== "explosion");
    
    const stats = ExplosionPower;
    
    // Add updated power
    player.powers.push({
      id: "explosion",
      interval: stats.cooldownPerLevel[level - 1],
      timer: 0,
      update(dt: number)
      {
        this.timer += dt;
        if (this.timer >= this.interval)
        {
          this.timer = 0;
          
          const count = stats.countPerLevel[level - 1];
          const damage = stats.damagePerLevel[level - 1];
          const radius = stats.radiusPerLevel[level - 1];
          
          // Spawn explosions
          for (let i = 0; i < count; i++)
          {
            player.spawnEffect("explosion", {
              damage: damage,
              radius: radius,
              animationName: stats.getAnimationName(),
              scale: 1 + (level * 0.10)
            });
          }
        }
      }
    });
  }
});

/**
 * MAGIC FIELD
 * Static damage field at player feet
 */
export const MagicFieldPower = new PowerUp({
  id: "magic_field",
  name: "Magic Field",
  description: "Creates a damaging field at your feet that persists for a duration.",
  type: "power",
  
  // Visuals
  spritesheet: "powers_spritesheet",
  animationBase: "Power_magicfield",
  hasLeveledAnimations: true,
  animationTiers: ["lvl1", "lvl2", "lvl3"],
  frameCount: 8,
  
  maxLevel: 12,
  rarity: "common",
  
  // Stats per level
  damagePerLevel: generateScaling(8, 0.10, 12), // +10% per level (damage per tick)
  radiusPerLevel: generateScaling(60, 0.20, 12), // +8% per level
  durationPerLevel: generateLinearScaling(1.5, 0.75, 12), // +0.2s per level (1s → 3.2s)
  cooldownPerLevel: generateScaling(6.0, -0.04, 12), // -4% per level
  tickRatePerLevel: Array(12).fill(0.5), // Ticks every 0.5s at all levels
  
  applyEffect: (player, level) =>
  {
    // Remove old magic field power if exists
    player.powers = player.powers.filter((p: any) => p.id !== "magic_field");
    
    const stats = MagicFieldPower;
    
    // Add updated power
    player.powers.push({
      id: "magic_field",
      interval: stats.cooldownPerLevel[level - 1],
      timer: 0,
      update(dt: number)
      {
        this.timer += dt;
        if (this.timer >= this.interval)
        {
          this.timer = 0;
          
          const damage = stats.damagePerLevel[level - 1];
          const radius = stats.radiusPerLevel[level - 1];
          const duration = stats.durationPerLevel[level - 1];
          const tickRate = stats.tickRatePerLevel[level - 1];
          
          // Spawn magic field at player position
          player.spawnEffect("magic_field", {
            damage: damage,
            radius: radius,
            duration: duration,
            tickRate: tickRate,
            animationName: stats.getAnimationName(),
            scale: 1 + (level * 0.25)
          });
        }
      }
    });
  }
});

/**
 * WIND CUT
 * Flying blade toward nearest enemy
 */
export const WindCutPower = new PowerUp({
  id: "wind_cut",
  name: "Wind Cut",
  description: "Launches a blade toward the nearest enemy.",
  type: "power",
  
  // Visuals
  spritesheet: "powers_spritesheet",
  animationBase: "Power_windcut",
  hasLeveledAnimations: true,
  animationTiers: ["lvl1", "lvl2", "lvl3"],
  frameCount: 3,
  
  maxLevel: 12,
  rarity: "common",
  
  // Stats per level
  damagePerLevel: generateScaling(12, 0.12, 12), // +12% per level
  speedPerLevel: generateScaling(7, 0.05, 12), // +5% per level
  cooldownPerLevel: generateScaling(2.5, -0.03, 12), // -3% per level
  piercePerLevel: [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15],
  countPerLevel: [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3],
  
  applyEffect: (player, level) =>
  {
    // Remove old wind cut power if exists
    player.powers = player.powers.filter((p: any) => p.id !== "wind_cut");
    
    const stats = WindCutPower;
    
    // Add updated power
    player.powers.push({
      id: "wind_cut",
      interval: stats.cooldownPerLevel[level - 1],
      timer: 0,
      update(dt: number)
      {
        this.timer += dt;
        if (this.timer >= this.interval)
        {
          this.timer = 0;
          
          const count = stats.countPerLevel[level - 1];
          const damage = stats.damagePerLevel[level - 1];
          const speed = stats.speedPerLevel[level - 1];
          const pierce = stats.piercePerLevel[level - 1];
          
          // Get nearest monsters (need to be provided by game manager)
          // For now, we'll use a helper function that should be set on the player
          if (!player.getNearestMonsters)
          {
            console.warn('[WindCut] No monster targeting system available');
            return;
          }
          
          const nearestMonsters = player.getNearestMonsters(count);
          
          // Spawn wind cuts toward each target
          for (let i = 0; i < nearestMonsters.length; i++)
          {
            const target = nearestMonsters[i];
            
            player.spawnPowerProjectile({
              targetX: target.x,
              targetY: target.y,
              damage: damage,
              speed: speed,
              pierce: pierce,
              animationName: stats.getAnimationName()
            });
          }
        }
      }
    });
  }
});

/**
 * AURA
 * Always active, damages enemies in radius
 */
export const AuraPower = new PowerUp({
  id: "aura",
  name: "Damage Aura",
  description: "A damaging aura surrounds you, hurting all nearby enemies.",
  type: "power",
  
  // Visuals
  spritesheet: "powers_spritesheet",
  animationBase: "Power_aura",
  hasLeveledAnimations: true,
  animationTiers: ["lvl1", "lvl2", "lvl3", "lvl4"],
  frameCount: 14,
  
  maxLevel: 12,
  rarity: "uncommon",
  
  // Stats per level
  damagePerLevel: generateScaling(3, 0.08, 12), // +8% per level (per tick)
  radiusPerLevel: generateLinearScaling(80, 10, 12), // +6px per level (50 → 116)
  tickRatePerLevel: generateScaling(1.0, -0.03, 12), // -3% per level (faster ticks)
  
  applyEffect: (player, level) =>
  {
    // Remove old aura power if exists
    player.powers = player.powers.filter((p: any) => p.id !== "aura");
    
    const stats = AuraPower;
    
    // Remove old aura visual (for upgrades)
    if (player.areaEffectSystemRef)
    {
      player.areaEffectSystemRef.removeAllAuras();
    }
    
    // Spawn the NEW upgraded aura visual
    player.spawnEffect("aura_damage", {
      damage: stats.damagePerLevel[level - 1],
      radius: stats.radiusPerLevel[level - 1],
      animationName: stats.getAnimationName(),
      scale: 1.5 + (level * 0.13)
    });
    
    console.log(`[AuraPower] Level ${level} applied - damage: ${stats.damagePerLevel[level - 1]}, radius: ${stats.radiusPerLevel[level - 1]}`);
    
    // Add power entry (just for tracking, visual handles damage)
    player.powers.push({
      id: "aura",
      interval: stats.tickRatePerLevel[level - 1],
      timer: 0,
      visualSpawned: true,
      update(_dt: number)
      {
        // Aura visual is permanent and handles its own damage timing
      }
    });
  }
});

/**
 * Export all active powers
 */
export const ALL_POWERS = [
  ExplosionPower,
  MagicFieldPower,
  WindCutPower,
  AuraPower
];