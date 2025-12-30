/**
 * Collision.ts - Collision detection and damage system
 * Handles circle-based collisions for entities
 * Supports custom collision radius per entity
 */

import { MonsterBase } from '../entities/monsters/MonsterBase';
import { Player } from '../entities/Player';

export interface CollisionConfig
{
  playerRadius?: number;
  monsterRadius?: number;
  projectileRadius?: number;
  xpRadius?: number;
  touchDamageCooldown?: number; // Time between touch damage hits
}

export class CollisionSystem
{
  // Collision radii
  private playerRadius: number;
  private monsterRadius: number;
  private projectileRadius: number;
  private xpRadius: number;
  
  // Touch damage system
  private touchDamageCooldown: number; // Seconds between damage hits
  private monsterDamageCooldowns: Map<MonsterBase, number>; // Track cooldown per monster
  
  constructor(config: CollisionConfig = {})
  {
    this.playerRadius = config.playerRadius ?? 20;
    this.monsterRadius = config.monsterRadius ?? 25;
    this.projectileRadius = config.projectileRadius ?? 8;
    this.xpRadius = config.xpRadius ?? 30;
    this.touchDamageCooldown = config.touchDamageCooldown ?? 0.5; // 0.5 seconds between hits
    
    this.monsterDamageCooldowns = new Map();
  }
  
  /**
   * Get collision radius for a monster (automatically scales with entity size)
   * radius = baseMonsterRadius * entity.scale
   */
  private getMonsterCollisionRadius(monster: MonsterBase): number
  {
    // Check if monster has custom collision radius override
    if ('getCollisionRadius' in monster && typeof (monster as any).getCollisionRadius === 'function')
    {
      return (monster as any).getCollisionRadius();
    }
    
    // Default: base radius * entity scale (use larger of x/y scale)
    const scale = Math.max(Math.abs(monster.scale.x), Math.abs(monster.scale.y));
    return this.monsterRadius * scale;
  }
  
  /**
   * Check circle collision between two entities
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
   * Check collision between player and monster
   */
  checkPlayerMonsterCollision(player: Player, monster: MonsterBase): boolean
  {
    const playerPos = player.getCollisionPosition();
    const monsterPos = monster.getCollisionPosition();
    
    return this.checkCircleCollision(
      playerPos.x,
      playerPos.y,
      this.playerRadius,
      monsterPos.x,
      monsterPos.y,
      this.getMonsterCollisionRadius(monster) // Use custom radius if available
    );
  }
  
  /**
   * Apply touch damage from monsters to player with cooldown system
   * Each monster can only damage once every X seconds
   */
  applyTouchDamage(player: Player, monsters: MonsterBase[], delta: number): void
  {
    if (player.isDead())
    {
      return;
    }
    
    // Update all cooldowns
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
    
    // Check each monster for collision
    for (const monster of monsters)
    {
      if (monster.isDead())
      {
        continue;
      }
      
      // Check if monster is touching player
      if (this.checkPlayerMonsterCollision(player, monster))
      {
        // Check if this monster can deal damage (cooldown expired)
        if (!this.monsterDamageCooldowns.has(monster))
        {
          // Deal full damage hit
          const damage = monster.getStats().damage;
          player.takeDamage(damage);
          
          // Set cooldown for this monster
          this.monsterDamageCooldowns.set(monster, this.touchDamageCooldown);
        }
      }
    }
  }
  
  /**
   * Clean up dead monsters from cooldown tracking
   */
  cleanupDeadMonsters(monsters: MonsterBase[]): void
  {
    const aliveMonsters = new Set(monsters);
    
    // Remove cooldowns for monsters that no longer exist
    for (const monster of this.monsterDamageCooldowns.keys())
    {
      if (!aliveMonsters.has(monster))
      {
        this.monsterDamageCooldowns.delete(monster);
      }
    }
  }
  
  /**
   * Check if player attack hits any monsters
   * Returns array of monsters within attack range while player is attacking
   */
  checkPlayerAttackHits(player: Player, monsters: MonsterBase[]): MonsterBase[]
  {
    if (!player.isPlayerAttacking())
    {
      return [];
    }
    
    const hitMonsters: MonsterBase[] = [];
    const playerPos = player.getCollisionPosition();
    const attackRange = player.getAttackRange();
    
    for (const monster of monsters)
    {
      if (monster.isDead())
      {
        continue;
      }
      
      const monsterPos = monster.getCollisionPosition();
      
      // Check if monster is within attack range (use custom radius)
      if (this.checkCircleCollision(
        playerPos.x,
        playerPos.y,
        attackRange,
        monsterPos.x,
        monsterPos.y,
        this.getMonsterCollisionRadius(monster) // Use custom radius if available
      ))
      {
        hitMonsters.push(monster);
      }
    }
    
    return hitMonsters;
  }
  
  /**
   * Apply player attack damage during impact frames
   * Respects hit list - each monster can only be hit once per attack
   * Should be called every frame during attack animation
   */
  applyAttackDamageOnImpactFrames(player: Player, monsters: MonsterBase[]): MonsterBase[]
  {
    // Only deal damage during impact frames
    if (!player.isAtAttackImpactFrame())
    {
      return [];
    }
    
    const newlyHitMonsters: MonsterBase[] = [];
    const playerPos = player.getCollisionPosition();
    const attackRange = player.getAttackRange();
    const playerDamage = player.getDamage();
    
    for (const monster of monsters)
    {
      if (monster.isDead())
      {
        continue;
      }
      
      // Skip if already hit during this attack
      if (player.hasHitMonster(monster))
      {
        continue;
      }
      
      const monsterPos = monster.getCollisionPosition();
      
      // Check if monster is within attack range (use custom radius)
      if (this.checkCircleCollision(
        playerPos.x,
        playerPos.y,
        attackRange,
        monsterPos.x,
        monsterPos.y,
        this.getMonsterCollisionRadius(monster) // Use custom radius if available
      ))
      {
        // Deal damage
        monster.takeDamage(playerDamage);
        
        // Mark as hit
        player.markMonsterAsHit(monster);
        
        // Track newly hit monsters for feedback
        newlyHitMonsters.push(monster);
      }
    }
    
    return newlyHitMonsters; // Return newly hit monsters for effects/sounds
  }
  
  /**
   * Check collision between player and all monsters
   * Returns array of colliding monsters
   */
  getCollidingMonsters(player: Player, monsters: MonsterBase[]): MonsterBase[]
  {
    const colliding: MonsterBase[] = [];
    
    for (const monster of monsters)
    {
      if (monster.isDead())
      {
        continue;
      }
      
      if (this.checkPlayerMonsterCollision(player, monster))
      {
        colliding.push(monster);
      }
    }
    
    return colliding;
  }
  
  /**
   * Update collision radii
   */
  setPlayerRadius(radius: number): void
  {
    this.playerRadius = radius;
  }
  
  setMonsterRadius(radius: number): void
  {
    this.monsterRadius = radius;
  }
  
  setProjectileRadius(radius: number): void
  {
    this.projectileRadius = radius;
  }
  
  setXPRadius(radius: number): void
  {
    this.xpRadius = radius;
  }
  
  /**
   * Update touch damage cooldown
   */
  setTouchDamageCooldown(cooldown: number): void
  {
    this.touchDamageCooldown = cooldown;
  }
  
  /**
   * Get current collision radii
   */
  getRadii(): CollisionConfig
  {
    return {
      playerRadius: this.playerRadius,
      monsterRadius: this.monsterRadius,
      projectileRadius: this.projectileRadius,
      xpRadius: this.xpRadius,
      touchDamageCooldown: this.touchDamageCooldown
    };
  }
}