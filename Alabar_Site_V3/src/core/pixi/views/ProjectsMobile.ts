/**
 * ProjectsMobile View - Renders ProjectsMobile page content
 */

import { Text } from 'pixi.js';
import type { Container, Application } from 'pixi.js';
import type { AssetManager } from '../managers/AssetManager';

export default function initProjectsMobileView(
  container: Container,
  app: Application,
  assetManager?: AssetManager
): void {
  container.removeChildren();

  const title = new Text('ProjectsMobile', {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 0xffcc33
  });
  title.anchor.set(0.5);
  title.position.set(app.screen.width / 2, 200);
  container.addChild(title);

  const description = new Text(
    'Content will be migrated from ProjectsMobile.js',
    {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffffff
    }
  );
  description.anchor.set(0.5);
  description.position.set(app.screen.width / 2, 300);
  container.addChild(description);

  console.log('ProjectsMobile view initialized');
}
