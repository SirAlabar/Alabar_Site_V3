/**
 * GameTimer.ts - Game timer UI component
 * Displays elapsed time at top-center of game container
 * Format: MM:SS (under 1 hour) or HH:MM:SS (1 hour or more)
 */

import { Container, Text, TextStyle } from 'pixi.js';

export class GameTimer extends Container
{
  private timerText: Text;
  private elapsedTime: number = 0; // In seconds
  private isRunning: boolean = false;
  
  constructor()
  {
    super();
    
    // Create text style (Pixi.js v8 compatible)
    const textStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 32,
      fontWeight: 'bold',
      fill: '#FFFFFF',
      stroke: { color: '#000000', width: 4 },
      dropShadow: {
        color: '#000000',
        blur: 4,
        angle: Math.PI / 6,
        distance: 2
      }
    });
    
    // Create timer text
    this.timerText = new Text({
      text: '00:00',
      style: textStyle
    });
    this.timerText.anchor.set(0.5, 0);
    
    this.addChild(this.timerText);
    
    // Position at top-center (will be set by parent)
    this.position.set(0, 20);
    
    // Set z-index to be on top
    this.zIndex = 10000;
  }
  
  /**
   * Start the timer
   */
  start(): void
  {
    if (this.isRunning)
    {
      return;
    }
    
    this.isRunning = true;
    this.elapsedTime = 0;
    this.updateDisplay();
    
    console.log('[GameTimer] Timer started');
  }
  
  /**
   * Stop the timer
   */
  stop(): void
  {
    this.isRunning = false;
    console.log(`[GameTimer] Timer stopped at ${this.formatTime(this.elapsedTime)}`);
  }
  
  /**
   * Pause the timer
   */
  pause(): void
  {
    this.isRunning = false;
  }
  
  /**
   * Resume the timer
   */
  resume(): void
  {
    this.isRunning = true;
  }
  
  /**
   * Reset the timer
   */
  reset(): void
  {
    this.isRunning = false;
    this.elapsedTime = 0;
    this.updateDisplay();
  }
  
  /**
   * Update timer (call every frame)
   */
  update(delta: number): void
  {
    if (!this.isRunning)
    {
      return;
    }
    
    // Increment elapsed time (delta is in fractional seconds at 60fps)
    this.elapsedTime += delta;
    
    // Update display
    this.updateDisplay();
  }
  
  /**
   * Update timer display text
   */
  private updateDisplay(): void
  {
    const formattedTime = this.formatTime(this.elapsedTime);
    this.timerText.text = formattedTime;
  }
  
  /**
   * Format time in MM:SS or HH:MM:SS
   */
  private formatTime(seconds: number): string
  {
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    // Pad with zeros
    const padZero = (num: number): string => num.toString().padStart(2, '0');
    
    if (hours > 0)
    {
      // Format: HH:MM:SS
      return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
    }
    else
    {
      // Format: MM:SS
      return `${padZero(minutes)}:${padZero(secs)}`;
    }
  }
  
  /**
   * Get elapsed time in seconds
   */
  getElapsedTime(): number
  {
    return this.elapsedTime;
  }
  
  /**
   * Get formatted elapsed time string
   */
  getFormattedTime(): string
  {
    return this.formatTime(this.elapsedTime);
  }
  
  /**
   * Check if timer is running
   */
  isTimerRunning(): boolean
  {
    return this.isRunning;
  }
  
  /**
   * Show timer
   */
  show(): void
  {
    this.visible = true;
  }
  
  /**
   * Hide timer
   */
  hide(): void
  {
    this.visible = false;
  }
  
  /**
   * Cleanup
   */
  destroy(options?: any): void
  {
    if (this.timerText)
    {
      this.timerText.destroy();
    }
    
    super.destroy(options);
  }
}