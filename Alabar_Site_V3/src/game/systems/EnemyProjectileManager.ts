/**
 * EnemyProjectileManager.ts - Manages all active enemy projectiles
 * Handles spawning, updating, collision detection, and cleanup
 */

import { Container } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { Projectile, ProjectileConfig } from '../entities/Projectile';
import { Player } from '../entities/Player';

export class EnemyProjectileManager
{
  private assetManager: AssetManager;
  private projectiles: Projectile[] = [];
  private projectileContainer: Container;
  private player: Player;
  
  private readonly PROJECTILE_RADIUS: number = 15;
  private readonly PLAYER_RADIUS: number = 20;
  
  constructor(assetManager: AssetManager, projectileContainer: Container, player: Player)
  {
    this.assetManager = assetManager;
    this.projectileContainer = projectileContainer;
    this.player = player;
  }
  
  /**
   * Spawn a new enemy projectile
   */
  spawnProjectile(config: ProjectileConfig): Projectile
  {
    const projectile = new Projectile(this.assetManager, config);
    
    this.projectiles.push(projectile);
    this.projectileContainer.addChild(projectile);
    
    return projectile;
  }
  
  /**
   * Spawn flower projectile from plant enemy
   */
  spawnFlowerProjectile(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    damage: number,
    speed: number = 4
  ): void
  {
    this.spawnProjectile({
      startX: startX,
      startY: startY,
      targetX: targetX,
      targetY: targetY,
      speed: speed,
      damage: damage,
      spritesheetKey: 'powers_spritesheet',
      animationName: 'Power_flower',
      range: 600,
      pierceCount: 0
    });
  }
  
  /**
   * Check circle collision
   */
  private checkCircleCollision(
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number
  ): boolean
  {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distanceSquared = dx * dx + dy * dy;
    const radiusSum = r1 + r2;
    
    return distanceSquared < radiusSum * radiusSum;
  }
  
  /**
   * Update all projectiles and check collisions
   */
  update(delta: number): void
  {
    if (this.player.isDead())
    {
      return;
    }
    
    const playerPos = this.player.getPosition();
    
    for (let i = this.projectiles.length - 1; i >= 0; i--)
    {
      const projectile = this.projectiles[i];
      
      // Skip if projectile is null or not alive
      if (!projectile || !projectile.isProjectileAlive())
      {
        this.removeProjectile(i);
        continue;
      }
      
      projectile.update(delta);
      
      const projPos = projectile.getPosition();
      
      // Skip if position is invalid (destroyed)
      if (!projPos || (projPos.x === 0 && projPos.y === 0))
      {
        this.removeProjectile(i);
        continue;
      }
      
      if (this.checkCircleCollision(
        projPos.x,
        projPos.y,
        this.PROJECTILE_RADIUS,
        playerPos.x,
        playerPos.y,
        this.PLAYER_RADIUS
      ))
      {
        const damage = projectile.getDamage();
        this.player.takeDamage(damage);
        
        const shouldDestroy = projectile.onHitPlayer();
        
        if (shouldDestroy)
        {
          this.removeProjectile(i);
        }
      }
    }
  }
  
  /**
   * Remove projectile at index
   */
  private removeProjectile(index: number): void
  {
    const projectile = this.projectiles[index];
    
    if (projectile)
    {
      projectile.destroy();
      this.projectiles.splice(index, 1);
    }
  }
  
  /**
   * Clear all projectiles
   */
  clearAll(): void
  {
    for (const projectile of this.projectiles)
    {
      projectile.destroy();
    }
    
    this.projectiles = [];
  }
  
  /**
   * Get active projectile count
   */
  getActiveCount(): number
  {
    return this.projectiles.length;
  }
  
  /**
   * Get all active projectiles
   */
  getProjectiles(): Projectile[]
  {
    return [...this.projectiles];
  }
}