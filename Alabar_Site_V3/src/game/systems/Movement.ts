/**
 * Movement.ts - Movement logic for entities
 * Handles 4-directional movement with boundary detection
 */

import { Direction } from '../core/Input';

export interface MovementConfig
{
  speed: number;
  bounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export interface Position
{
  x: number;
  y: number;
}

export class MovementSystem
{
  private speed: number;
  private bounds: { minX: number; maxX: number; minY: number; maxY: number } | null;
  
  constructor(config: MovementConfig)
  {
    this.speed = config.speed;
    this.bounds = config.bounds || null;
  }
  
  /**
   * Calculate new position based on direction
   */
    calculateNewPosition(currentPos: Position, direction: Direction, delta: number): Position
    {
        if (!direction)
        {
            return currentPos;
        }

        const newPos: Position = { ...currentPos };

        const deltaSpeed = this.speed * delta * 60;

        switch (direction)
        {
            case 'up':
            newPos.y -= deltaSpeed;
            break;
            case 'down':
            newPos.y += deltaSpeed;
            break;
            case 'left':
            newPos.x -= deltaSpeed;
            break;
            case 'right':
            newPos.x += deltaSpeed;
            break;
        }

        // Boundary
        if (this.bounds)
        {
            newPos.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, newPos.x));
            newPos.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, newPos.y));
        }

        return newPos;
    }

  
  /**
   * Check if position is within bounds
   */
  isInBounds(pos: Position): boolean
  {
    if (!this.bounds)
    {
      return true;
    }
    
    return (
      pos.x >= this.bounds.minX &&
      pos.x <= this.bounds.maxX &&
      pos.y >= this.bounds.minY &&
      pos.y <= this.bounds.maxY
    );
  }
  
  /**
   * Update movement speed
   */
  setSpeed(speed: number): void
  {
    this.speed = speed;
  }
  
  /**
   * Get current speed
   */
  getSpeed(): number
  {
    return this.speed;
  }
  
  /**
   * Update movement bounds
   */
  setBounds(bounds: { minX: number; maxX: number; minY: number; maxY: number }): void
  {
    this.bounds = bounds;
  }
  
  /**
   * Remove movement bounds
   */
  clearBounds(): void
  {
    this.bounds = null;
  }
  
  /**
   * Get current bounds
   */
  getBounds(): { minX: number; maxX: number; minY: number; maxY: number } | null
  {
    return this.bounds;
  }
}