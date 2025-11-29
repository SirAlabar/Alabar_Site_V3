/**
 * AreaEffectSystem.ts - Manages area damage effects (aura, explosion, magic field)
 */

import { Container } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { AreaEffect, AreaEffectConfig } from '../configs/AreaEffect';
import { MonsterBase } from '../entities/monsters/MonsterBase';

export class AreaEffectSystem
{
  private assetManager: AssetManager;
  private effectContainer: Container;
  private effects: AreaEffect[] = [];
  
  constructor(assetManager: AssetManager, effectContainer: Container)
  {
    this.assetManager = assetManager;
    this.effectContainer = effectContainer;
  }
  
  /**
   * Spawn an area effect
   */
  spawnEffect(config: AreaEffectConfig): void
  {
    const effect = new AreaEffect(this.assetManager, config);
    
    this.effects.push(effect);
    this.effectContainer.addChild(effect);
    
    console.log('[AreaEffectSystem] Spawned area effect');
  }
  
  /**
   * Spawn explosion at position
   */
  spawnExplosion(x: number, y: number, damage: number, radius: number, animationName: string, scale: number): void
  {
    console.log(`[AreaEffectSystem] Spawning EXPLOSION at (${x.toFixed(1)}, ${y.toFixed(1)}) - damage: ${damage}, radius: ${radius}`);
    
    this.spawnEffect({
      x: x,
      y: y,
      radius: radius,
      damage: damage,
      duration: 0.5, // Explosion lasts 0.5s
      tickRate: 0.1, // Damage once at 0.1s
      animationName: animationName,
      spritesheetKey: 'powers_spritesheet',
      scale: scale ?? 2.0
    });
  }
  
  /**
   * Spawn magic field at position
   */
  spawnMagicField(x: number, y: number, damage: number, radius: number, duration: number, tickRate: number, animationName: string, scale: number): void
  {
    this.spawnEffect({
      x: x,
      y: y,
      radius: radius,
      damage: damage,
      duration: duration,
      tickRate: tickRate,
      animationName: animationName,
      spritesheetKey: 'powers_spritesheet',
      scale: scale ?? 1.5
    });
  }
  
  /**
   * Spawn aura that follows player
   */
  spawnAura(player: any, damage: number, radius: number, _duration: number, tickRate: number, animationName: string, scale: number): void
  {
    for (let i = this.effects.length - 1; i >= 0; i--)
    {
        const e = this.effects[i];

        if (e && (e as any).followTarget === player)
        {
            this.removeEffect(i);
        }
    }
    const pos = player.getPosition();

    this.spawnEffect({
      x: pos.x,
      y: pos.y,
      radius: radius,
      damage: damage,
      duration: 999999, // Aura is permanent (very long duration)
      tickRate: tickRate,
      animationName: animationName,
      spritesheetKey: 'powers_spritesheet',
      scale: scale ?? 1.0,
      followTarget: player // Aura follows player
    });
  }
  
  /**
   * Update all effects and damage monsters
   */
  update(delta: number, monsters: MonsterBase[]): void
  {
    for (let i = this.effects.length - 1; i >= 0; i--)
    {
      const effect = this.effects[i];
      
      if (!effect || !effect.isEffectAlive())
      {
        this.removeEffect(i);
        continue;
      }
      
      effect.update(delta);
      
      // Check if should damage this tick
      if (effect.shouldDamage())
      {
        this.applyAreaDamage(effect, monsters);
      }
    }
  }
  
  /**
   * Apply area damage to all monsters in radius
   */
  private applyAreaDamage(effect: AreaEffect, monsters: MonsterBase[]): void
  {
    if (!effect || !effect.isEffectAlive())
    {
      return;
    }
    
    const effectPos = effect.getPosition();
    
    // Safety check for destroyed effects
    if (!effectPos || (effectPos.x === 0 && effectPos.y === 0))
    {
      return;
    }
    
    const radius = effect.getRadius();
    const damage = effect.getDamage();
    
    let hitCount = 0;
    
    for (const monster of monsters)
    {
      if (monster.isDead()) continue;
      
      const monsterPos = monster.getPosition();
      const distance = this.getDistance(effectPos.x, effectPos.y, monsterPos.x, monsterPos.y);
      
      if (distance <= radius)
      {
        monster.takeDamage(damage);
        hitCount++;
      }
    }
    
    if (hitCount > 0)
    {
      console.log(`[AreaEffectSystem] Area effect hit ${hitCount} monsters for ${damage} damage each`);
    }
  }
  
  /**
   * Calculate distance
   */
  private getDistance(x1: number, y1: number, x2: number, y2: number): number
  {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Remove effect at index
   */
  private removeEffect(index: number): void
  {
    const effect = this.effects[index];
    
    if (effect)
    {
      this.effectContainer.removeChild(effect);
      effect.destroy();
      this.effects.splice(index, 1);
    }
  }
  
  /**
   * Clear all effects
   */
  clearAll(): void
  {
    for (const effect of this.effects)
    {
      if (effect)
      {
        this.effectContainer.removeChild(effect);
        effect.destroy();
      }
    }
    
    this.effects = [];
    
    console.log('[AreaEffectSystem] Cleared all area effects');
  }
  
  /**
   * Get active effect count
   */
  getEffectCount(): number
  {
    return this.effects.length;
  }
}