/**
 * NotFoundPage - NotFoundPage component
 */

import { BaseComponent } from '@components/BaseComponent';

export default class NotFoundPage extends BaseComponent {
  render(): string {
    return '';
  }

  mount(selector: string): void {
    console.log('NotFoundPage mounted');
  }
}
