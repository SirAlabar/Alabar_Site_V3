/**
 * BaseComponent - Abstract base class for page components
 */

export abstract class BaseComponent {
  /**
   * Render the component HTML
   */
  abstract render(): string;

  /**
   * Mount the component (optional lifecycle method)
   */
  mount?(selector: string): void;

  /**
   * Cleanup resources (optional lifecycle method)
   */
  dispose?(): void;

  /**
   * Alternative cleanup method name
   */
  cleanup?(): void;
}
