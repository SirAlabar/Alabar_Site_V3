/**
 * Input.ts - Keyboard input manager
 * Handles WASD, Arrow keys, and E key for player controls
 */

export type Direction = 'up' | 'down' | 'left' | 'right' | null;

export class InputManager
{
  private static instance: InputManager;
  
  // Key states
  private keys: Map<string, boolean> = new Map();
  
  // Key mappings
  private readonly KEY_UP = ['KeyW', 'ArrowUp'];
  private readonly KEY_DOWN = ['KeyS', 'ArrowDown'];
  private readonly KEY_LEFT = ['KeyA', 'ArrowLeft'];
  private readonly KEY_RIGHT = ['KeyD', 'ArrowRight'];
  private readonly KEY_ATTACK = ['KeyE'];
  
  private constructor()
  {
    this.setupEventListeners();
  }
  
  static getInstance(): InputManager
  {
    if (!InputManager.instance)
    {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }
  
  /**
   * Set up keyboard event listeners
   */
  private setupEventListeners(): void
  {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Prevent default behavior for arrow keys (scrolling)
    window.addEventListener('keydown', (e) =>
    {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
      {
        e.preventDefault();
      }
    });
  }
  
  /**
   * Handle key down event
   */
  private handleKeyDown(event: KeyboardEvent): void
  {
    this.keys.set(event.code, true);
  }
  
  /**
   * Handle key up event
   */
  private handleKeyUp(event: KeyboardEvent): void
  {
    this.keys.set(event.code, false);
  }
  
  /**
   * Check if a specific key is pressed
   */
  private isKeyPressed(keyCodes: string[]): boolean
  {
    return keyCodes.some(code => this.keys.get(code) === true);
  }
  
  /**
   * Get current movement direction (4-directional, no diagonals)
   * Priority: Up > Down > Left > Right
   */
  getDirection(): Direction
  {
    if (this.isKeyPressed(this.KEY_UP))
    {
      return 'up';
    }
    if (this.isKeyPressed(this.KEY_DOWN))
    {
      return 'down';
    }
    if (this.isKeyPressed(this.KEY_LEFT))
    {
      return 'left';
    }
    if (this.isKeyPressed(this.KEY_RIGHT))
    {
      return 'right';
    }
    
    return null;
  }
  
  /**
   * Check if attack key is pressed
   */
  isAttackPressed(): boolean
  {
    return this.isKeyPressed(this.KEY_ATTACK);
  }
  
  /**
   * Check if any movement key is pressed
   */
  isMoving(): boolean
  {
    return this.getDirection() !== null;
  }
  
  /**
   * Reset all key states
   */
  reset(): void
  {
    this.keys.clear();
  }
  
  /**
   * Cleanup and destroy input manager
   */
  destroy(): void
  {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    this.keys.clear();
  }
}