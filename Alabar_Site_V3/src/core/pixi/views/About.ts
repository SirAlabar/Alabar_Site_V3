/**
 * About View - Renders about page content
 */

import { Text } from 'pixi.js';
import type { Container, Application } from 'pixi.js';
import type { AssetManager } from '../managers/AssetManager';

export default function initAboutView(
  container: Container,
  app: Application,
  assetManager: AssetManager
): void {
  container.removeChildren();

  const title = new Text('About Me', {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 0xffcc33
  });
  title.anchor.set(0.5);
  title.position.set(app.screen.width / 2, 200);
  container.addChild(title);

  const description = new Text(
    'This is the About page.\nContent will be migrated from your existing About.js',
    {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffffff,
      align: 'center'
    }
  );
  description.anchor.set(0.5);
  description.position.set(app.screen.width / 2, 300);
  container.addChild(description);

  console.log('About view initialized');
}
