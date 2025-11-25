/**
 * HomePage - Main landing page with game
 */

import { BaseComponent } from '@components/BaseComponent';

export default class HomePage extends BaseComponent {
  render(): string {
    // Empty because content is handled by PIXI
    return '';
  }

  mount(selector: string): void {
    // PIXI ContentManager handles the home page content
  }
}
