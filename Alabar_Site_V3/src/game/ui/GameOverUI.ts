/**
 * GameOverUI.ts - Game Over modal component
 * Displays when player dies with elapsed time and restart option
 */

import { Container, Text, TextStyle, Graphics } from 'pixi.js';

export class GameOverUI extends Container
{
  private background: Graphics;
  private frameContainer: Container;
  private frameGraphics: Graphics;
  private titleText: Text;
  private timeText: Text;
  private restartButton: Container;
  private restartButtonBg: Graphics;
  private restartButtonText: Text;
  
  private onRestartCallback: (() => void) | null = null;
  
  constructor()
  {
    super();
    
    this.visible = false;
    this.zIndex = 20000; // Above everything
    
    // Create semi-transparent background overlay
    this.background = new Graphics();
    this.background.rect(0, 0, 1, 1);
    this.background.fill({ color: 0x000000, alpha: 0.7 });
    this.addChild(this.background);
    
    // Create frame container
    this.frameContainer = new Container();
    this.addChild(this.frameContainer);
    
    // Create pixel art frame using Graphics
    this.frameGraphics = new Graphics();
    this.drawPixelFrame(400, 300);
    this.frameContainer.addChild(this.frameGraphics);
    
    // Create title text
    const titleStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 48,
      fontWeight: 'bold',
      fill: '#8B0000', // Dark red
      stroke: { color: '#000000', width: 4 },
      dropShadow: {
        color: '#000000',
        blur: 4,
        angle: Math.PI / 6,
        distance: 3
      }
    });
    
    this.titleText = new Text({
      text: 'GAME OVER',
      style: titleStyle
    });
    this.titleText.anchor.set(0.5, 0.5);
    this.addChild(this.titleText);
    
    // Create time text
    const timeStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 28,
      fontWeight: 'bold',
      fill: '#FFFFFF',
      stroke: { color: '#000000', width: 3 },
      dropShadow: {
        color: '#000000',
        blur: 3,
        angle: Math.PI / 6,
        distance: 2
      }
    });
    
    this.timeText = new Text({
      text: 'Time: 00:00',
      style: timeStyle
    });
    this.timeText.anchor.set(0.5, 0.5);
    this.addChild(this.timeText);
    
    // Create restart button container
    this.restartButton = new Container();
    this.restartButton.eventMode = 'static';
    this.restartButton.cursor = 'pointer';
    
    // Button background
    this.restartButtonBg = new Graphics();
    this.restartButtonBg.roundRect(-80, -25, 160, 50, 8);
    this.restartButtonBg.fill({ color: 0xFFCC33 });
    this.restartButtonBg.stroke({ color: 0x000000, width: 3 });
    this.restartButton.addChild(this.restartButtonBg);
    
    // Button text
    const buttonStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      fontWeight: 'bold',
      fill: '#1a1a2e',
      stroke: { color: '#FFFFFF', width: 2 }
    });
    
    this.restartButtonText = new Text({
      text: 'RESTART',
      style: buttonStyle
    });
    this.restartButtonText.anchor.set(0.5, 0.5);
    this.restartButton.addChild(this.restartButtonText);
    
    this.addChild(this.restartButton);
    
    // Button hover effect
    this.restartButton.on('pointerover', () => {
      this.restartButtonBg.clear();
      this.restartButtonBg.roundRect(-80, -25, 160, 50, 8);
      this.restartButtonBg.fill({ color: 0xFFDD55 });
      this.restartButtonBg.stroke({ color: 0x000000, width: 3 });
    });
    
    this.restartButton.on('pointerout', () => {
      this.restartButtonBg.clear();
      this.restartButtonBg.roundRect(-80, -25, 160, 50, 8);
      this.restartButtonBg.fill({ color: 0xFFCC33 });
      this.restartButtonBg.stroke({ color: 0x000000, width: 3 });
    });
    
    this.restartButton.on('pointerdown', () => {
      if (this.onRestartCallback)
      {
        this.onRestartCallback();
      }
    });
    
    console.log('[GameOverUI] Initialized');
  }
  
  /**
   * Draw pixel art frame using Graphics
   */
  private drawPixelFrame(width: number, height: number): void
  {
    this.frameGraphics.clear();
    
    const borderWidth = 8;
    const cornerSize = 16;
    
    // Main panel background
    this.frameGraphics.rect(-width/2, -height/2, width, height);
    this.frameGraphics.fill({ color: 0x1a1a2e });
    
    // Outer border (dark)
    this.frameGraphics.rect(-width/2 - borderWidth, -height/2 - borderWidth, width + borderWidth*2, height + borderWidth*2);
    this.frameGraphics.stroke({ color: 0x0a0a0f, width: borderWidth });
    
    // Inner border (accent)
    this.frameGraphics.rect(-width/2 + 4, -height/2 + 4, width - 8, height - 8);
    this.frameGraphics.stroke({ color: 0xffcc33, width: 4 });
    
    // Corner decorations (pixel style)
    const corners = [
      { x: -width/2, y: -height/2 },      // Top-left
      { x: width/2, y: -height/2 },       // Top-right
      { x: -width/2, y: height/2 },       // Bottom-left
      { x: width/2, y: height/2 }         // Bottom-right
    ];
    
    for (const corner of corners)
    {
      // Outer corner accent
      this.frameGraphics.rect(corner.x - 6, corner.y - 6, cornerSize, cornerSize);
      this.frameGraphics.fill({ color: 0xffcc33 });
      
      // Inner corner detail
      this.frameGraphics.rect(corner.x - 2, corner.y - 2, cornerSize - 8, cornerSize - 8);
      this.frameGraphics.fill({ color: 0x0a0a0f });
    }
  }
  
  /**
   * Show game over screen with elapsed time
   */
  show(elapsedTime: string, onRestart: () => void): void
  {
    this.onRestartCallback = onRestart;
    this.timeText.text = `Time Survived: ${elapsedTime}`;
    this.visible = true;
    
    console.log(`[GameOverUI] Showing game over - Time: ${elapsedTime}`);
  }
  
  /**
   * Hide game over screen
   */
  hide(): void
  {
    this.visible = false;
    this.onRestartCallback = null;
  }
  
  /**
   * Update positions based on screen size
   */
  resize(width: number, height: number): void
  {
    // Update background size
    this.background.clear();
    this.background.rect(0, 0, width, height);
    this.background.fill({ color: 0x000000, alpha: 0.7 });
    
    // Center everything
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Position frame container
    this.frameContainer.position.set(centerX, centerY);
    
    this.titleText.position.set(centerX, centerY - 80);
    this.timeText.position.set(centerX, centerY - 20);
    this.restartButton.position.set(centerX, centerY + 60);
  }
  
  /**
   * Cleanup
   */
  destroy(options?: any): void
  {
    if (this.background)
    {
      this.background.destroy();
    }
    
    if (this.frameGraphics)
    {
      this.frameGraphics.destroy();
    }
    
    if (this.frameContainer)
    {
      this.frameContainer.destroy();
    }
    
    if (this.titleText)
    {
      this.titleText.destroy();
    }
    
    if (this.timeText)
    {
      this.timeText.destroy();
    }
    
    if (this.restartButtonBg)
    {
      this.restartButtonBg.destroy();
    }
    
    if (this.restartButtonText)
    {
      this.restartButtonText.destroy();
    }
    
    if (this.restartButton)
    {
      this.restartButton.destroy();
    }
    
    super.destroy(options);
  }
}