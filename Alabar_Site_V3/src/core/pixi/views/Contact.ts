/**
 * Contact View - Renders contact page content
 */

import { Text } from 'pixi.js';
import type { Container, Application } from 'pixi.js';
import type { AssetManager } from '../managers/AssetManager';

export default function initContactView(
  container: Container,
  app: Application,
  assetManager: AssetManager
): void {
  container.removeChildren();

  const title = new Text('Contact', {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 0xffcc33
  });
  title.anchor.set(0.5);
  title.position.set(app.screen.width / 2, 200);
  container.addChild(title);

  console.log('Contact view initialized');
}
