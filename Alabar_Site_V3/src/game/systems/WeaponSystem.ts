/**
 * WeaponSystem.ts - Manages player weapon and power projectiles
 */

import { Container } from 'pixi.js';
import { AssetManager } from '../../managers/AssetManager';
import { Projectile, ProjectileConfig } from '../entities/Projectile';
import { MonsterBase } from '../entities/monsters/MonsterBase';
import { OrbitalWeaponProjectile } from '../entities/OrbitalWeaponProjectile';

export class WeaponSystem
{
  private assetManager: AssetManager;
  private projectileContainer: Container;
  private projectiles: Projectile[] = [];
  
  // Orbital weapons (Shuriken)
  private orbitalWeapons: OrbitalWeaponProjectile[] = [];
  
  private readonly PROJECTILE_RADIUS = 20;
  private readonly MONSTER_RADIUS = 30;
  private readonly ORBITAL_COLLISION_RADIUS = 35; // Slightly larger for orbital weapons
  
  constructor(assetManager: AssetManager, projectileContainer: Container)
  {
    this.assetManager = assetManager;
    this.projectileContainer = projectileContainer;
  }
  
  /**
   * Spawn a projectile (works for both weapons and powers)
   */
  spawnProjectile(config: ProjectileConfig): void
  {
    const projectile = new Projectile(this.assetManager, config);
    
    this.projectiles.push(projectile);
    this.projectileContainer.addChild(projectile);
  }
  
  /**
   * Spawn a weapon projectile
   */
  spawnWeaponProjectile(config: ProjectileConfig): void
  {
    config.isWeapon = true;
    this.spawnProjectile(config);
  }
  
  /**
   * Spawn a power projectile (Wind Cut, etc) - convenience method
   */
  spawnPowerProjectile(config: ProjectileConfig): void
  {
    this.spawnProjectile(config);
  }
  
  /**
   * Update all projectiles and check collisions
   */
  update(delta: number, monsters: MonsterBase[]): void
  {
    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--)
    {
      const projectile = this.projectiles[i];
      
      if (!projectile || !projectile.isProjectileAlive())
      {
        this.removeProjectile(i);
        continue;
      }
      
      projectile.update(delta);
      
      // Check collision with monsters
      this.checkProjectileCollisions(projectile, monsters, i);
    }
    
    // Update orbital weapons
    for (const orbital of this.orbitalWeapons)
    {
      if (!orbital || !orbital.isOrbitalAlive())
      {
        continue;
      }
      
      orbital.update(delta);
      
      // Check collision with all monsters
      for (const monster of monsters)
      {
        if (monster.isDead()) continue;
        
        orbital.checkCollision(monster, this.ORBITAL_COLLISION_RADIUS);
      }
      
      // Cleanup dead monsters from orbital's cooldown tracking
      orbital.cleanupDeadMonsters(monsters);
    }
  }
  
  /**
   * Check if projectile hits any monsters
   */
  private checkProjectileCollisions(projectile: Projectile, monsters: MonsterBase[], projectileIndex: number): void
  {
    const projPos = projectile.getPosition();
    
    for (const monster of monsters)
    {
      if (monster.isDead()) continue;
      
      const monsterPos = monster.getPosition();
      
      if (this.checkCircleCollision(
        projPos.x,
        projPos.y,
        this.PROJECTILE_RADIUS,
        monsterPos.x,
        monsterPos.y,
        this.MONSTER_RADIUS
      ))
      {
        // Deal damage to monster
        const damage = projectile.getDamage();
        monster.takeDamage(damage);
        
        console.log(`[WeaponSystem] Projectile hit monster for ${damage} damage`);
        
        // Check if projectile should be destroyed
        const shouldDestroy = projectile.onHitEnemy();
        
        if (shouldDestroy)
        {
          this.removeProjectile(projectileIndex);
          return; // Exit after destroying projectile
        }
      }
    }
  }
  
  /**
   * Circle collision detection
   */
  private checkCircleCollision(
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number
  ): boolean
  {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (r1 + r2);
  }
  
  /**
   * Remove projectile at index
   */
  private removeProjectile(index: number): void
  {
    const projectile = this.projectiles[index];
    
    if (projectile)
    {
      this.projectileContainer.removeChild(projectile);
      projectile.destroy();
      this.projectiles.splice(index, 1);
    }
  }
  
  /**
   * Spawn orbital weapon (Shuriken)
   * Called when player acquires or levels up Shuriken weapon
   */
  spawnOrbitalWeapon(
    owner: any,
    frameName: string,
    count: number,
    orbitRadius: number,
    orbitSpeed: number,
    damage: number,
    scale: number
  ): void
  {
    // Clear existing orbitals first
    this.clearOrbitalWeapons();
    
    // Spawn new orbitals evenly spaced around circle
    const angleStep = (Math.PI * 2) / count;
    
    for (let i = 0; i < count; i++)
    {
      const baseAngle = i * angleStep;
      
      const orbital = new OrbitalWeaponProjectile(
        this.assetManager,
        frameName,
        owner,
        baseAngle,
        orbitRadius,
        orbitSpeed,
        damage,
        scale
      );
      
      this.orbitalWeapons.push(orbital);
      this.projectileContainer.addChild(orbital);
    }
    
    console.log(`[WeaponSystem] Spawned ${count} orbital weapons`);
  }
  
  /**
   * Update orbital weapon stats (when weapon levels up)
   */
  updateOrbitalWeaponStats(damage: number, orbitRadius: number, orbitSpeed: number, scale: number): void
  {
    for (const orbital of this.orbitalWeapons)
    {
      if (orbital && orbital.isOrbitalAlive())
      {
        orbital.setDamage(damage);
        orbital.setOrbitRadius(orbitRadius);
        orbital.setOrbitSpeed(orbitSpeed);
        orbital.updateScale(scale);
      }
    }
    
    console.log(`[WeaponSystem] Updated orbital weapon stats`);
  }
  
  /**
   * Clear all orbital weapons
   */
  clearOrbitalWeapons(): void
  {
    for (const orbital of this.orbitalWeapons)
    {
      if (orbital)
      {
        this.projectileContainer.removeChild(orbital);
        orbital.destroy();
      }
    }
    
    this.orbitalWeapons = [];
    
    console.log('[WeaponSystem] Cleared all orbital weapons');
  }
  
  /**
   * Clear all projectiles
   */
  clearAll(): void
  {
    // Clear projectiles
    for (const projectile of this.projectiles)
    {
      if (projectile)
      {
        this.projectileContainer.removeChild(projectile);
        projectile.destroy();
      }
    }
    
    this.projectiles = [];
    
    // Clear orbital weapons
    this.clearOrbitalWeapons();
    
    console.log('[WeaponSystem] Cleared all projectiles and orbitals');
  }
  
  /**
   * Get active projectile count
   */
  getProjectileCount(): number
  {
    return this.projectiles.length;
  }
  
  /**
   * Get active orbital weapon count
   */
  getOrbitalCount(): number
  {
    return this.orbitalWeapons.length;
  }
}