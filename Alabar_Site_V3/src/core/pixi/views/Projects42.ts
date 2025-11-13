/**
 * Projects42 View - Renders Projects42 page content
 */

import { Text } from 'pixi.js';
import type { Container, Application } from 'pixi.js';
import type { AssetManager } from '../managers/AssetManager';

export default function initProjects42View(
  container: Container,
  app: Application,
  assetManager?: AssetManager
): void {
  container.removeChildren();

  const title = new Text('Projects42', {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 0xffcc33
  });
  title.anchor.set(0.5);
  title.position.set(app.screen.width / 2, 200);
  container.addChild(title);

  const description = new Text(
    'Content will be migrated from Projects42.js',
    {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffffff
    }
  );
  description.anchor.set(0.5);
  description.position.set(app.screen.width / 2, 300);
  container.addChild(description);

  console.log('Projects42 view initialized');
}
