/**
 * OrbitalWeaponProjectile.ts - Orbital weapon that rotates around player
 * Used for Shuriken weapon - deals damage on contact with cooldown per monster
 */

import { Sprite, Texture } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { MonsterBase } from './monsters/MonsterBase';

export class OrbitalWeaponProjectile extends Sprite
{
  // Orbital movement
  public angle: number;
  private orbitRadius: number;
  private orbitSpeed: number;
  
  // Combat
  private damage: number;
  private owner: any; // Player reference
  
  // Collision tracking
  private monsterDamageCooldowns: Map<MonsterBase, number>;
  private readonly DAMAGE_COOLDOWN = 1.0; // 1 second between hits per monster
  
  // State
  private isAlive: boolean = true;
  
  constructor(
    assetManager: AssetManager,
    frameName: string,
    owner: any,
    baseAngle: number,
    orbitRadius: number,
    orbitSpeed: number,
    damage: number,
    scale: number = 1.0
  )
  {
    // Get texture from spritesheet
    const spritesheet = assetManager.getSpritesheet('powers_spritesheet');
    
    if (!spritesheet || !spritesheet.textures)
    {
      console.error(`[OrbitalWeapon] Spritesheet not found: powers_spritesheet`);
      super(Texture.EMPTY);
    }
    else
    {
      const texture = spritesheet.textures[frameName];
      
      if (!texture)
      {
        console.error(`[OrbitalWeapon] Texture not found: ${frameName}`);
        super(Texture.EMPTY);
      }
      else
      {
        super(texture);
      }
    }
    
    this.anchor.set(0.5);
    this.scale.set(scale);
    
    this.owner = owner;
    this.angle = baseAngle;
    this.orbitRadius = orbitRadius;
    this.orbitSpeed = orbitSpeed;
    this.damage = damage;
    
    this.monsterDamageCooldowns = new Map();
    
    // Set initial position
    this.updatePosition();
  }
  
  /**
   * Update orbital position around player
   */
  private updatePosition(): void
  {
    if (!this.owner)
    {
      return;
    }
    
    const pos = this.owner.getPosition();
    
    // Calculate orbital position
    this.x = pos.x + Math.cos(this.angle) * this.orbitRadius;
    this.y = pos.y + Math.sin(this.angle) * this.orbitRadius;
  }
  
  /**
   * Update orbital movement and cooldowns
   */
  update(delta: number): void
  {
    if (!this.isAlive)
    {
      return;
    }
    
    // Rotate angle
    this.angle += this.orbitSpeed * delta;
    
    // Update position
    this.updatePosition();
    
    // Update damage cooldowns
    for (const [monster, cooldown] of this.monsterDamageCooldowns)
    {
      const newCooldown = cooldown - delta;
      
      if (newCooldown <= 0)
      {
        this.monsterDamageCooldowns.delete(monster);
      }
      else
      {
        this.monsterDamageCooldowns.set(monster, newCooldown);
      }
    }
  }
  
  /**
   * Check collision with monster and apply damage if cooldown expired
   */
  checkCollision(monster: MonsterBase, collisionRadius: number): boolean
  {
    if (!this.isAlive || monster.isDead())
    {
      return false;
    }
    
    // Check if monster is on cooldown
    if (this.monsterDamageCooldowns.has(monster))
    {
      return false;
    }
    
    // Check circle collision
    const monsterPos = monster.getPosition();
    const dx = this.x - monsterPos.x;
    const dy = this.y - monsterPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < collisionRadius)
    {
      // Deal damage
      monster.takeDamage(this.damage);
      
      // Set cooldown
      this.monsterDamageCooldowns.set(monster, this.DAMAGE_COOLDOWN);
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Update damage value (when weapon levels up)
   */
  setDamage(damage: number): void
  {
    this.damage = damage;
  }
  
  /**
   * Update orbit radius (when weapon levels up)
   */
  setOrbitRadius(radius: number): void
  {
    this.orbitRadius = radius;
  }
  
  /**
   * Update orbit speed (when weapon levels up)
   */
  setOrbitSpeed(speed: number): void
  {
    this.orbitSpeed = speed;
  }
  
  /**
   * Update scale (based on weapon area)
   */
  updateScale(scale: number): void
  {
    this.scale.set(scale);
  }
  
  /**
   * Clean up dead monsters from cooldown tracking
   */
  cleanupDeadMonsters(monsters: MonsterBase[]): void
  {
    const aliveMonsters = new Set(monsters);
    
    for (const monster of this.monsterDamageCooldowns.keys())
    {
      if (!aliveMonsters.has(monster))
      {
        this.monsterDamageCooldowns.delete(monster);
      }
    }
  }
  
  /**
   * Check if orbital is alive
   */
  isOrbitalAlive(): boolean
  {
    return this.isAlive;
  }
  
  /**
   * Get damage value
   */
  getDamage(): number
  {
    return this.damage;
  }
  
  /**
   * Destroy orbital
   */
  destroy(options?: any): void
  {
    this.isAlive = false;
    this.monsterDamageCooldowns.clear();
    
    super.destroy(options);
  }
}