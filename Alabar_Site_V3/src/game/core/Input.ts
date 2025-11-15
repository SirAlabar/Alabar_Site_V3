/**
 * InputManager.ts - Handles keyboard and mouse input
 */

export class InputManager 
{
  private keys: Map<string, boolean> = new Map();
  private mousePosition = { x: 0, y: 0 };
  private mouseDown = false;
  
  initialize(): void 
  {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Mouse events
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    console.log('✅ Input Manager initialized');
  }
  
  private handleKeyDown(e: KeyboardEvent): void 
  {
    this.keys.set(e.key.toLowerCase(), true);
  }
  
  private handleKeyUp(e: KeyboardEvent): void 
  {
    this.keys.set(e.key.toLowerCase(), false);
  }
  
  private handleMouseMove(e: MouseEvent): void 
  {
    this.mousePosition.x = e.clientX;
    this.mousePosition.y = e.clientY;
  }
  
  private handleMouseDown(): void 
  {
    this.mouseDown = true;
  }
  
  private handleMouseUp(): void 
  {
    this.mouseDown = false;
  }
  
  getMovement(): { x: number; y: number } 
  {
    let x = 0;
    let y = 0;
    
    // WASD and Arrow keys
    if (this.keys.get('w') || this.keys.get('arrowup')) y -= 1;
    if (this.keys.get('s') || this.keys.get('arrowdown')) y += 1;
    if (this.keys.get('a') || this.keys.get('arrowleft')) x -= 1;
    if (this.keys.get('d') || this.keys.get('arrowright')) x += 1;
    
    return { x, y };
  }
  
  getMousePosition(): { x: number; y: number } 
  {
    return { ...this.mousePosition };
  }
  
  isMouseDown(): boolean 
  {
    return this.mouseDown;
  }
  
  isKeyPressed(key: string): boolean 
  {
    return this.keys.get(key.toLowerCase()) || false;
  }
  
  update(): void 
  {
    // Update logic if needed
  }
  
  destroy(): void 
  {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    window.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    window.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    
    this.keys.clear();
  }
}