/**
 * Core type definitions for the application
 */

import type { Application, Container } from 'pixi.js';

/**
 * Route configuration
 */
export interface RouteConfig {
  component: () => Promise<any>;
  title: string;
  layout: LayoutType;
  headerType: HeaderType;
}

/**
 * Layout types
 */
export type LayoutType = 'default' | 'pixi' | 'minimal' | 'game';

/**
 * Header types
 */
export type HeaderType = 'default' | 'game' | 'minimal' | 'none';

/**
 * Route configuration object
 */
export type RouteConfigMap = Record<string, RouteConfig>;

/**
 * Page groups for PIXI containers
 */
export interface PageGroups {
  homeContent: Container;
  aboutContent: Container;
  contactContent: Container;
  notFound404Content: Container;
  projectsContent: Container;
  projects42Content: Container;
  projectsWebContent: Container;
  projectsMobileContent: Container;
  projectsGamesContent: Container;
}

/**
 * Render groups for PIXI
 */
export interface RenderGroups {
  backgroundGroup: Container;
  contentGroup: Container;
  pageGroups: PageGroups;
  uiGroup: Container;
}

/**
 * PIXI Application state
 */
export interface PixiAppState {
  app: Application | null;
  isInitialized: boolean;
  renderGroups: RenderGroups | null;
}

/**
 * Asset loading progress callback
 */
export type ProgressCallback = (progress: number) => void;

/**
 * Asset loading complete callback
 */
export type CompleteCallback = () => void;

/**
 * Base component interface
 */
export interface BaseComponent {
  render(): string;
  mount?(selector: string): void;
  dispose?(): void;
  cleanup?(): void;
}
