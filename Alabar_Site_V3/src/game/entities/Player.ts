/**
 * Player.ts - Player entity extending BaseEntity
 * With XP, Leveling System, and Power System Integration
 * UPDATED: Multiple weapons support with independent cooldowns
 */

import { AssetManager } from '../../managers/AssetManager';
import { InputManager, Direction } from '../core/Input';
import { BaseEntity, EntityConfig, EntityState, FacingDirection } from './BaseEntity';
import { HPBar } from "../ui/HPBar";
import { XPBar } from "../ui/XPBar";
import { XPManager } from '../systems/XP';
import { WeaponSystem } from '../systems/WeaponSystem';
import { AreaEffectSystem } from '../systems/AreaEffectSystem';

// Player-specific states
enum PlayerState
{
  WALKING,
  STANDING,
  IDLE_PLAYING,
  ATTACKING,
  HURT
}

interface PlayerConfig
{
  startX: number;
  startY: number;
  speed: number;
  health?: number;
  damage?: number;
  attackRange?: number;
  bounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  onLevelUp?: (newLevel: number) => void; // Callback for level-up UI
}

export class Player extends BaseEntity
{
  // Input manager
  private inputManager: InputManager;
  
  // XP Manager
  private xpManager: XPManager;
  
  // Weapon System (for spawning projectiles)
  private weaponSystem: WeaponSystem | null = null;
  
  // Area Effect System (for aura, explosion, magic field)
  private areaEffectSystem: AreaEffectSystem | null = null;
  
  // Monster targeting (set by SiteGame for power targeting)
  public getNearestMonsters?: (count: number) => Array<{ x: number; y: number }>;
  
  // Player-specific state machine
  private playerState: PlayerState = PlayerState.STANDING;
  private lastDirection: Direction = null;
  
  // Standing state timer
  private standingTimer: number = 0;
  private readonly STANDING_DURATION = 5; // 5 seconds
  
  // Combat stats (base values)
  private baseDamage: number;
  private baseAttackRange: number;
  
  private hpBar: HPBar;
  private xpBar: XPBar;

  // Attack tracking
  private attackImpactFrames: number[] = [2, 3]; // Frames where attack hitbox is active
  private monstersHitThisAttack: Set<any> = new Set(); // Track hit monsters per attack
  
  // Power system stats (modified by power-ups)
  public stats: {
    damageMultiplier: number;
    moveSpeedMultiplier: number;
    cooldownReduction: number;
    armor: number;
    projectileSpeedMultiplier: number;
    projectileCount: number;
    pierce: number;
  };
  
  // Weapon-specific stats
  public weaponStats: {
    [weaponId: string]: {
      extraProjectiles?: number;
      pierce?: number;
    };
  };
  
  // Active weapons array (multiple weapons can be equipped)
  public activeWeapons: Array<{
    id: string;
    name: string;
    level: number;
    damage: number;
    area: number;
    cooldown: number;
    speed: number;
    behavior: string;
    frameName: string;
    orbitRadius?: number;
    orbitSpeed?: number;
    timer: number;
  }> = [];
  
  // Active powers
  public powers: Array<{
    id: string;
    interval: number;
    timer: number;
    update: (dt: number) => void;
  }>;
  
  // Level-up callback
  private onLevelUpCallback?: (newLevel: number) => void;
  
  constructor(assetManager: AssetManager, config: PlayerConfig)
  {
    // Call BaseEntity constructor with EntityConfig
    const entityConfig: EntityConfig = {
      startX: config.startX,
      startY: config.startY,
      speed: config.speed,
      spritesheetKey: 'player_spritesheet',
      animationPrefix: 'Leo_Hero',
      health: config.health ?? 120,
      bounds: config.bounds
    };
    
    super(assetManager, entityConfig);

    this.hpBar = new HPBar();
    this.xpBar = new XPBar();
    this.addChild(this.hpBar);
    this.addChild(this.xpBar);
    
    if (this.sprite) 
    {
        this.hpBar.y = this.sprite.height * 0.25;
        this.hpBar.x = -(this.hpBar.width / 2);

        this.xpBar.y = this.hpBar.y + 3;
        this.xpBar.x = -(this.xpBar.width / 2);
    }

    this.inputManager = InputManager.getInstance();
    
    // Initialize base combat stats
    this.baseDamage = config.damage ?? 8;
    this.baseAttackRange = config.attackRange ?? 50;
    
    // Initialize power system stats
    this.stats = {
      damageMultiplier: 1.0,
      moveSpeedMultiplier: 1.0,
      cooldownReduction: 0,
      armor: 0,
      projectileSpeedMultiplier: 1.0,
      projectileCount: 1,
      pierce: 0
    };
    
    // Initialize weapon stats
    this.weaponStats = {};
    
    // Initialize powers array
    this.powers = [];
    
    // Store level-up callback
    this.onLevelUpCallback = config.onLevelUp;
    
    // Initialize XP Manager
    this.xpManager = new XPManager({
      startingLevel: 1,
      startingXP: 0,
      onLevelUp: (newLevel: number) => {
        console.log(`[Player] LEVEL UP! Now level ${newLevel}`);
        
        // Trigger level-up callback (for UI)
        if (this.onLevelUpCallback)
        {
          this.onLevelUpCallback(newLevel);
        }
      }
    });
    
    // Initialize player to standing state
    this.transitionToStanding();
  }
  
  /**
   * Add XP to player
   */
  addXP(amount: number): void
  {
    this.xpManager.addXP(amount);
    
    const progress = this.xpManager.getXPProgress();
    this.xpBar.update(progress, this.xpManager.getLevel());
  }
  
  /**
   * Get current level
   */
  getLevel(): number
  {
    return this.xpManager.getLevel();
  }
  
  /**
   * Get current XP
   */
  getCurrentXP(): number
  {
    return this.xpManager.getCurrentXP();
  }
  
  /**
   * Get XP needed for next level
   */
  getXPNeeded(): number
  {
    return this.xpManager.getXPNeeded();
  }
  
  /**
   * Convert input direction to facing direction
   */
  private directionToFacing(direction: Direction): FacingDirection
  {
    switch (direction)
    {
      case 'up':
        return 'Back';
      case 'down':
        return 'Front';
      case 'left':
        return 'Left';
      case 'right':
        return 'Right';
      default:
        return this.facingDirection;
    }
  }
  
  /**
   * Get player state name for debugging
   */
  private getPlayerStateName(): string
  {
    switch (this.playerState)
    {
      case PlayerState.WALKING: return 'WALKING';
      case PlayerState.STANDING: return 'STANDING';
      case PlayerState.IDLE_PLAYING: return 'IDLE_PLAYING';
      case PlayerState.ATTACKING: return 'ATTACKING';
      case PlayerState.HURT: return 'HURT';
      default: return 'UNKNOWN';
    }
  }
  
  /**
   * Transition to WALKING state
   */
  private transitionToWalking(newDirection: FacingDirection): void
  {
    this.playAnimation('walk', newDirection, {
      loop: true,
      speed: 0.125
    });
    
    this.playerState = PlayerState.WALKING;
    this.setState(EntityState.MOVING);
  }
  
  /**
   * Transition to STANDING state
   */
  private transitionToStanding(): void
  {
    this.playAnimation('idle', this.facingDirection, {
      loop: false,
      speed: 0.04
    });
    
    this.stopAnimation(0);
    
    this.standingTimer = this.STANDING_DURATION;
    this.playerState = PlayerState.STANDING;
    this.setState(EntityState.IDLE);
  }
  
  /**
   * Transition to IDLE_PLAYING state
   */
  private transitionToIdlePlaying(): void
  {
    this.playAnimation('idle', this.facingDirection, {
      loop: false,
      speed: 0.08,
      onComplete: () => {
        this.transitionToStanding();
      }
    });
    
    this.playerState = PlayerState.IDLE_PLAYING;
    this.setState(EntityState.IDLE);
  }
  
  /**
   * Transition to HURT state
   */
  private transitionToHurt(): void
  {
    this.playAnimation('hurt', this.facingDirection, {
      loop: false,
      speed: 0.15,
      onComplete: () => {
        this.transitionToStanding();
      }
    });
    
    this.playerState = PlayerState.HURT;
    this.setState(EntityState.HURT);
  }
  
  /**
   * Transition to ATTACKING state
   */
  private transitionToAttacking(): void
  {
    const frames = this.getAnimationFrames('atk', this.facingDirection);
    if (frames.length === 0)
    {
      return;
    }
    
    const frameCount = frames.length;
    
    // Reset hit list for new attack
    this.monstersHitThisAttack.clear();
    
    this.playAnimation('atk', this.facingDirection, {
      loop: false,
      speed: frameCount / 48,
      onComplete: () => {
        this.transitionToStanding();
      }
    });
    
    this.playerState = PlayerState.ATTACKING;
    this.setState(EntityState.ATTACKING);
  }
  
  /**
   * Handle attack input
   */
  private handleAttack(): void
  {
    // Can only attack from non-attacking states
    if (this.playerState === PlayerState.ATTACKING)
    {
      return;
    }
    
    if (this.inputManager.isAttackPressed())
    {
      this.transitionToAttacking();
    }
  }
  
  /**
   * Handle movement input
   */
  private handleMovement(delta: number): void
  {
    const direction = this.inputManager.getDirection();
    
    if (direction)
    {
      // Player is moving
      const newFacing = this.directionToFacing(direction);
      this.lastDirection = direction;
      
      // Calculate and apply new position
      const newPos = this.movementSystem.calculateNewPosition(
        this.currentPosition,
        direction,
        delta
      );
      
      this.currentPosition = newPos;
      this.position.set(newPos.x, newPos.y);
      
      // Only change animation if NOT attacking or hurt
      if (this.playerState !== PlayerState.ATTACKING && 
          this.playerState !== PlayerState.HURT)
      {
        if (this.playerState !== PlayerState.WALKING || newFacing !== this.facingDirection)
        {
          this.transitionToWalking(newFacing);
        }
      }
    }
    else
    {
      // Only transition to standing if NOT attacking or hurt
      if (this.playerState === PlayerState.WALKING)
      {
        if (this.lastDirection)
        {
          this.facingDirection = this.directionToFacing(this.lastDirection);
        }
        
        this.transitionToStanding();
      }
    }
  }
  
  /**
   * Update STANDING state
   */
  private updateStandingState(delta: number): void
  {
    if (this.standingTimer > 0)
    {
      this.standingTimer -= delta;
      
      if (this.standingTimer <= 0)
      {
        this.transitionToIdlePlaying();
      }
    }
  }
  
  /**
   * Main update loop (implementation of BaseEntity abstract method)
   */
  update(delta: number): void
  {
    // Don't update if dead
    if (this.isDead())
    {
      return;
    }
    
    // Update state-specific logic
    if (this.playerState === PlayerState.STANDING)
    {
      this.updateStandingState(delta);
    }
    
    // Handle input (respecting state restrictions)
    this.handleAttack();
    this.handleMovement(delta);
    this.updateWeaponAttacks(delta);
  }
  
  /**
   * Check if player is attacking
   */
  isPlayerAttacking(): boolean
  {
    return this.playerState === PlayerState.ATTACKING;
  }

  /**
   * Update all weapon attacks (each weapon has independent cooldown)
   */
  private updateWeaponAttacks(delta: number): void
  {
    if (!this.weaponSystem || this.activeWeapons.length === 0)
    {
      return;
    }

    // Update each weapon independently
    for (const weapon of this.activeWeapons)
    {
      weapon.timer += delta;

      // Apply cooldown reduction from stats
      const effectiveCooldown = weapon.cooldown * (1 - this.stats.cooldownReduction);

      if (weapon.timer >= effectiveCooldown)
      {
        weapon.timer = 0;
        this.fireWeapon(weapon);
      }
    }
  }

  /**
   * Fire a specific weapon
   */
  private fireWeapon(weapon: {
    id: string;
    name: string;
    level: number;
    damage: number;
    area: number;
    cooldown: number;
    speed: number;
    behavior: string;
    frameName: string;
    orbitRadius?: number;
    orbitSpeed?: number;
    timer: number;
  }): void
  {
    const pos = this.getPosition();
    
    // Calculate total projectile count
    const baseCount = 1;
    const extraFromStats = this.stats.projectileCount - 1;
    const extraFromWeapon = this.weaponStats[weapon.id]?.extraProjectiles ?? 0;
    const totalCount = baseCount + extraFromStats + extraFromWeapon;
    
    // Calculate total pierce
    const basePierce = 0;
    const pierceFromStats = this.stats.pierce;
    const pierceFromWeapon = this.weaponStats[weapon.id]?.pierce ?? 0;
    const totalPierce = basePierce + pierceFromStats + pierceFromWeapon;
    
    // Apply weapon area to scale
    const scale = 1.0 * weapon.area;
    
    switch (weapon.behavior)
    {
      case "straight":
      {
        // Dagger: Fan spread pattern (30° between projectiles)
        const spreadAngle = 30 * (Math.PI / 180); // Convert to radians
        const facingAngle = this.getFacingAngle();
        
        for (let i = 0; i < totalCount; i++)
        {
          // Calculate angle offset for this projectile
          const angleOffset = (i - (totalCount - 1) / 2) * spreadAngle;
          const finalAngle = facingAngle + angleOffset;
          
          // Calculate target position
          const distance = 200;
          const targetX = pos.x + Math.cos(finalAngle) * distance;
          const targetY = pos.y + Math.sin(finalAngle) * distance;
          
          this.weaponSystem!.spawnWeaponProjectile({
            startX: pos.x,
            startY: pos.y,
            targetX: targetX,
            targetY: targetY,
            speed: weapon.speed * this.stats.projectileSpeedMultiplier,
            damage: weapon.damage,
            spritesheetKey: "powers_spritesheet",
            animationName: weapon.frameName,
            pierceCount: totalPierce,
            range: 600,
            scale: scale
          });
        }
        break;
      }

      case "arc":
      {
        // Axe: Multiple arcs at different angles (20° spread)
        const spreadAngle = 20 * (Math.PI / 180);
        const baseAngle = Math.PI / 4; // 45° upward
        
        for (let i = 0; i < totalCount; i++)
        {
          const angleOffset = (i - (totalCount - 1) / 2) * spreadAngle;
          const finalAngle = baseAngle + angleOffset;
          
          const distance = 200;
          const targetX = pos.x + Math.cos(finalAngle) * distance;
          const targetY = pos.y - Math.sin(finalAngle) * distance;
          
          this.weaponSystem!.spawnWeaponProjectile({
            startX: pos.x,
            startY: pos.y,
            targetX: targetX,
            targetY: targetY,
            speed: weapon.speed * this.stats.projectileSpeedMultiplier,
            damage: weapon.damage,
            spritesheetKey: "powers_spritesheet",
            animationName: weapon.frameName,
            pierceCount: totalPierce,
            range: 600,
            scale: scale
          });
        }
        break;
      }

      case "boomerang":
      {
        // Sword: Fire in opposite directions (180° spread)
        const facingAngle = this.getFacingAngle();
        
        for (let i = 0; i < totalCount; i++)
        {
          // Alternate between forward and backward
          const angle = facingAngle + (i % 2 === 0 ? 0 : Math.PI);
          
          const distance = 250;
          const targetX = pos.x + Math.cos(angle) * distance;
          const targetY = pos.y + Math.sin(angle) * distance;
          
          this.weaponSystem!.spawnWeaponProjectile({
            startX: pos.x,
            startY: pos.y,
            targetX: targetX,
            targetY: targetY,
            speed: weapon.speed * this.stats.projectileSpeedMultiplier,
            damage: weapon.damage,
            spritesheetKey: "powers_spritesheet",
            animationName: weapon.frameName,
            pierceCount: totalPierce,
            range: 900,
            scale: scale
          });
        }
        break;
      }

      case "orbital":
      {
        // Shuriken: Spawn/update orbital weapons
        if (!this.weaponSystem)
        {
          console.warn('[Player] Weapon system not connected');
          break;
        }
        
        // Tell weapon system to spawn orbitals (only once when weapon is acquired)
        this.weaponSystem.spawnOrbitalWeapon(
          this,
          weapon.frameName,
          totalCount,
          weapon.orbitRadius ?? 80,
          weapon.orbitSpeed ?? 2.0,
          weapon.damage,
          scale
        );
        break;
      }
    }
  }
  
  /**
   * Get facing angle in radians based on current facing direction
   */
  private getFacingAngle(): number
  {
    switch (this.facingDirection)
    {
      case 'Right':
        return 0; // 0°
      case 'Front':
        return Math.PI / 2; // 90° (down)
      case 'Left':
        return Math.PI; // 180°
      case 'Back':
        return -Math.PI / 2; // -90° (up)
      default:
        return 0;
    }
  }

  /**
   * Add or upgrade a weapon
   * If weapon already exists, update its stats
   * If new weapon, add to array
   */
  public addOrUpgradeWeapon(weaponData: {
    id: string;
    name: string;
    level: number;
    damage: number;
    area: number;
    cooldown: number;
    speed: number;
    behavior: string;
    frameName: string;
    orbitRadius?: number;
    orbitSpeed?: number;
  }): void
  {
    // Check if weapon already exists
    const existingWeapon = this.activeWeapons.find(w => w.id === weaponData.id);
    
    if (existingWeapon)
    {
      // Update existing weapon stats
      existingWeapon.level = weaponData.level;
      existingWeapon.damage = weaponData.damage;
      existingWeapon.area = weaponData.area;
      existingWeapon.cooldown = weaponData.cooldown;
      existingWeapon.speed = weaponData.speed;
      existingWeapon.frameName = weaponData.frameName;
      existingWeapon.orbitRadius = weaponData.orbitRadius;
      existingWeapon.orbitSpeed = weaponData.orbitSpeed;
      
      console.log(`[Player] Upgraded ${weaponData.name} to level ${weaponData.level}`);
    }
    else
    {
      // Add new weapon to array
      this.activeWeapons.push({
        ...weaponData,
        timer: 0 // Initialize timer
      });
      
      console.log(`[Player] Added new weapon: ${weaponData.name}`);
    }
  }
  
  /**
   * Apply global projectile count increase to all weapons and powers
   */
  public applyGlobalProjectileIncrease(): void
  {
    console.log(`[Player] Global projectile count increased to ${this.stats.projectileCount}`);
    // Stats are already updated, weapons will use the new value on next fire
  }
  
  /**
   * Apply global pierce increase to all weapons and powers
   */
  public applyGlobalPierceIncrease(): void
  {
    console.log(`[Player] Global pierce increased to ${this.stats.pierce}`);
    // Stats are already updated, weapons will use the new value on next fire
  }
  
  /**
   * Get current player state (for debugging)
   */
  getCurrentPlayerState(): string
  {
    return this.getPlayerStateName();
  }
  
  /**
   * Get player damage value (with multipliers)
   */
  getDamage(): number
  {
    return this.baseDamage * this.stats.damageMultiplier;
  }
  
  /**
   * Get player attack range
   */
  getAttackRange(): number
  {
    return this.baseAttackRange;
  }
  
  /**
   * Check if currently at impact frame (hitbox is active)
   */
  isAtAttackImpactFrame(): boolean
  {
    if (!this.isPlayerAttacking() || !this.sprite)
    {
      return false;
    }
    
    const currentFrame = Math.floor(this.sprite.currentFrame);
    return this.attackImpactFrames.includes(currentFrame);
  }
  
  /**
   * Check if monster was already hit during this attack
   */
  hasHitMonster(monster: any): boolean
  {
    return this.monstersHitThisAttack.has(monster);
  }
  
  /**
   * Mark monster as hit during this attack
   */
  markMonsterAsHit(monster: any): void
  {
    this.monstersHitThisAttack.add(monster);
  }
  
  /**
   * Get list of monsters hit this attack (for debugging)
   */
  getMonstersHitThisAttack(): Set<any>
  {
    return this.monstersHitThisAttack;
  }
  
  /**
   * Override takeDamage to apply armor and hurt animation
   */
  takeDamage(amount: number): void
  {
    if (this.isDead())
    {
      return;
    }
    
    // Apply armor (flat damage reduction)
    const damageAfterArmor = Math.max(1, amount - this.stats.armor);

    super.takeDamage(damageAfterArmor);

    const hpPercent = this.getHealth() / this.getMaxHealth();
    this.hpBar.update(hpPercent);

    if (this.isDead())
    {
      this.onPlayerDeath();
    }
    else
    {
      // Play hurt animation only if not attacking or already hurt
      if (this.playerState !== PlayerState.HURT && 
          this.playerState !== PlayerState.ATTACKING)
      {
        this.transitionToHurt();
      }
    }
  }
  
  /**
   * Set weapon system reference (called by SiteGame)
   */
  setWeaponSystem(weaponSystem: WeaponSystem): void
  {
    this.weaponSystem = weaponSystem;
    console.log('[Player] Weapon system connected');
  }
  
  /**
   * Set area effect system reference (called by SiteGame)
   */
  setAreaEffectSystem(areaEffectSystem: AreaEffectSystem): void
  {
    this.areaEffectSystem = areaEffectSystem;
    console.log('[Player] Area effect system connected');
  }
  
  /**
   * Spawn a power projectile (called by active powers)
   */
  spawnPowerProjectile(config: {
    targetX: number;
    targetY: number;
    damage: number;
    speed: number;
    pierce: number;
    animationName: string;
  }): void
  {
    if (!this.weaponSystem)
    {
      console.warn('[Player] Weapon system not connected, cannot spawn projectile');
      return;
    }
    
    const pos = this.getPosition();
    
    this.weaponSystem.spawnPowerProjectile({
      startX: pos.x,
      startY: pos.y,
      targetX: config.targetX,
      targetY: config.targetY,
      speed: config.speed,
      damage: config.damage,
      spritesheetKey: 'powers_spritesheet',
      animationName: config.animationName,
      range: 800,
      pierceCount: config.pierce,
      scale: 1.5
    });
    
    console.log('[Player] Spawned power projectile:', config.animationName);
  }
  
  /**
   * Spawn area effect (aura, explosion, magic field)
   */
  spawnAreaEffect(type: string, params: any): void
  {
    console.log(`[Player] spawnAreaEffect called - type: ${type}, params:`, params);
    
    if (!this.areaEffectSystem)
    {
      console.warn('[Player] Area effect system not connected');
      return;
    }
    
    const pos = this.getPosition();
    console.log(`[Player] Player position: (${pos.x}, ${pos.y})`);
    
    switch (type)
    {
      case 'explosion':
        // Random position near player
        const offsetX = (Math.random() - 0.5) * 200;
        const offsetY = (Math.random() - 0.5) * 200;
        this.areaEffectSystem.spawnExplosion(
          pos.x + offsetX,
          pos.y + offsetY,
          params.damage,
          params.radius,
          params.animationName,
          params.scale
        );
        break;
        
      case 'magic_field':
        this.areaEffectSystem.spawnMagicField(
          pos.x,
          pos.y,
          params.damage,
          params.radius,
          params.duration,
          params.tickRate,
          params.animationName,
          params.scale
        );
        break;
        
      case 'aura_damage':
        // Aura follows player - permanent visual, damages every 1 second
        
        this.areaEffectSystem.spawnAura(
          this,
          params.damage,
          params.radius,
          999999, // Permanent duration
          1.0, // Damage every 1 second
          params.animationName,
          params.scale ?? 1.0
        );
        break;
        
      default:
        console.warn(`[Player] Unknown area effect type: ${type}`);
    }
  }
  
  /**
   * Spawn effect (called by active powers)
   * Routes to appropriate system
   */
  spawnEffect(effectType: string, params: any): void
  {
    // Route to area effects
    if (effectType === 'explosion' || effectType === 'magic_field' || effectType === 'aura_damage')
    {
      this.spawnAreaEffect(effectType, params);
    }
    else
    {
      console.warn(`[Player] Unknown effect type: ${effectType}`);
    }
  }
  
  /**
   * Handle player death
   */
  private onPlayerDeath(): void
  {
    this.playerState = PlayerState.STANDING;
    this.stopAnimation(0);
    
    console.log('[Player] Player died!');
  }
}