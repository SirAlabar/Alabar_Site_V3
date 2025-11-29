/**
 * LevelUpUI.ts - Level-up card selection UI container
 * Displays 3 LevelUpCard components with overlay
 */

import { Container, Graphics, Text } from 'pixi.js';
import { LevelUpCard } from '../configs/LevelUpCard';
import { AssetManager } from '../../managers/AssetManager';
import { CardOption } from '../systems/PowerManager';

export interface LevelUpUIConfig
{
  onCardSelected: (powerUpId: string) => void;
}

export class LevelUpUI extends Container
{
  private assetManager: AssetManager;
  private cards: LevelUpCard[] = [];
  private overlay!: Graphics;
  private titleText!: Text;
  
  private onCardSelectedCallback: (powerUpId: string) => void;
  
  private screenWidth: number = 0;
  private screenHeight: number = 0;
  
  constructor(assetManager: AssetManager, config: LevelUpUIConfig)
  {
    super();
    
    this.assetManager = assetManager;
    this.onCardSelectedCallback = config.onCardSelected;
    
    this.visible = false;
  }
  
  /**
   * Show level-up UI with 3 card options
   */
  show(cardOptions: CardOption[], screenWidth: number, screenHeight: number): void
  {
    if (cardOptions.length === 0)
    {
      console.warn('[LevelUpUI] No cards to display');
      return;
    }
    
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    this.clear();
    this.createOverlay();
    this.createTitle();
    this.createCards(cardOptions);
    
    this.visible = true;
    
    console.log('[LevelUpUI] Showing', cardOptions.length, 'cards');
  }
  
  /**
   * Hide level-up UI
   */
  hide(): void
  {
    this.visible = false;
    this.clear();
  }
  
  /**
   * Create dark overlay
   */
  private createOverlay(): void
  {
    this.overlay = new Graphics();
    this.overlay.rect(0, 0, this.screenWidth, this.screenHeight);
    this.overlay.fill({ color: 0x000000, alpha: 0.85 });
    
    this.addChild(this.overlay);
  }
  
  /**
   * Create title
   */
  private createTitle(): void
  {
    this.titleText = new Text({
      text: 'LEVEL UP!',
      style: {
        fontFamily: 'VT323',
        fontSize: 64,
        fill: 0xffcc33,
        align: 'center',
        stroke: { color: 0x000000, width: 4 }
      }
    });
    
    this.titleText.anchor.set(0.5);
    this.titleText.position.set(this.screenWidth / 2, 80);
    
    this.addChild(this.titleText);
  }
  
  /**
   * Create 3 cards
   */
  private createCards(cardOptions: CardOption[]): void
  {
    const cardWidth = 280;
    const cardSpacing = 40;
    const totalWidth = (cardWidth * 3) + (cardSpacing * 2);
    const startX = (this.screenWidth - totalWidth) / 2;
    const cardY = (this.screenHeight - 380) / 2 + 40;
    
    for (let i = 0; i < Math.min(3, cardOptions.length); i++)
    {
      const cardOption = cardOptions[i];
      const cardX = startX + (i * (cardWidth + cardSpacing));
      
      const card = new LevelUpCard(this.assetManager, {
        powerUp: cardOption.powerUp,
        isNew: cardOption.isNew,
        x: cardX,
        y: cardY,
        onSelect: () => {
          this.onCardSelect(cardOption.powerUp.id);
        }
      });
      
      this.cards.push(card);
      this.addChild(card);
    }
  }
  
  /**
   * Handle card selection
   */
  private onCardSelect(powerUpId: string): void
  {
    console.log(`[LevelUpUI] Selected: ${powerUpId}`);
    
    this.hide();
    this.onCardSelectedCallback(powerUpId);
  }
  
  /**
   * Clear all elements
   */
  private clear(): void
  {
    for (const card of this.cards)
    {
      card.destroy();
    }
    this.cards = [];
    
    this.removeChildren();
  }
  
  /**
   * Update cards
   */
  update(delta: number): void
  {
    if (!this.visible) return;
    
    for (const card of this.cards)
    {
      card.update(delta);
    }
  }
  
  /**
   * Cleanup
   */
  destroy(options?: any): void
  {
    this.clear();
    super.destroy(options);
  }
}