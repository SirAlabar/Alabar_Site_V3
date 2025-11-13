/**
 * NotFound View - 404 page
 */

import { Text } from 'pixi.js';
import type { Container, Application } from 'pixi.js';
import type { AssetManager } from '../managers/AssetManager';

export default function initNotFoundView(
  container: Container,
  app: Application,
  assetManager: AssetManager
): void {
  container.removeChildren();

  const title = new Text('404', {
    fontFamily: 'Arial',
    fontSize: 72,
    fill: 0xffcc33
  });
  title.anchor.set(0.5);
  title.position.set(app.screen.width / 2, app.screen.height / 2 - 50);
  container.addChild(title);

  const message = new Text('Page Not Found', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xffffff
  });
  message.anchor.set(0.5);
  message.position.set(app.screen.width / 2, app.screen.height / 2 + 50);
  container.addChild(message);

  console.log('404 view initialized');
}
