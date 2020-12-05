import * as PIXI from "pixi.js";
import { Dungeon } from "./dungeon";
import { Container, TileMap, TreeNode } from "./types";

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = true;

export interface TexturesMap {
  [key: string]: PIXI.Texture;
}

export interface DrawOptions {
  debug: boolean;
  /** Draws the tile Id on each tile (CPU intensive) */
  debugTilesNumber: boolean;
  unitWidthInPixels: number;
  tilesSprites: TexturesMap;
  propsSprites: TexturesMap;
  monstersSprites: TexturesMap;
}

export class Drawer {
  app: PIXI.Application;
  tilemapContainer: PIXI.Container;
  shapesContainer: PIXI.Container;
  unitInPixels: number;

  constructor(width: number, height: number) {
    this.app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x00,
    });
    document.body.appendChild(this.app.view);

    this.tilemapContainer = new PIXI.Container();
    this.shapesContainer = new PIXI.Container();
    this.app.stage.addChild(this.tilemapContainer);
    this.app.stage.addChild(this.shapesContainer);
  }

  draw = (dungeon: Dungeon, options: DrawOptions) => {
    console.log("Drawing with options:", options);

    this.tilemapContainer.removeChildren();
    this.shapesContainer.removeChildren();
    this.unitInPixels = options.unitWidthInPixels;

    this.drawTiles(dungeon.tilemap, options.tilesSprites);
    this.drawProps(dungeon.props, options.propsSprites);
    this.drawMonsters(dungeon, options.monstersSprites);

    if (options.debug) {
      this.drawGrid(dungeon, options);
      this.drawContainers(dungeon.tree);
      this.drawRooms(dungeon.tree);
      this.drawCorridors(dungeon.tree);
    }
  };

  private drawTiles = (tilemap: TileMap, sprites: TexturesMap) => {
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const tileId = tilemap[y][x];
        const tileTexture = sprites[tileId];
        if (tileTexture) {
          const sprite = new PIXI.Sprite(tileTexture);
          sprite.position.set(x * this.unitInPixels, y * this.unitInPixels);
          this.tilemapContainer.addChild(sprite);
        } else {
          const rectangle = new PIXI.Graphics();
          rectangle.beginFill(0xff00ff);
          rectangle.drawRect(0, 0, this.unitInPixels, this.unitInPixels);
          rectangle.endFill();
          rectangle.position.set(x * this.unitInPixels, y * this.unitInPixels);
          this.tilemapContainer.addChild(rectangle);
        }
      }
    }
  };

  private drawProps = (tilemap: TileMap, sprites: TexturesMap) => {
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const tileId = tilemap[y][x];
        if (tileId === 0) {
          continue;
        }

        const tileTexture = sprites[tileId];
        if (tileTexture) {
          const sprite = new PIXI.Sprite(tileTexture);
          sprite.position.set(x * this.unitInPixels, y * this.unitInPixels);
          this.tilemapContainer.addChild(sprite);
        } else {
          const rectangle = new PIXI.Graphics();
          rectangle.beginFill(0xff00ff);
          rectangle.drawRect(0, 0, this.unitInPixels, this.unitInPixels);
          rectangle.endFill();
          rectangle.position.set(x * this.unitInPixels, y * this.unitInPixels);
          this.tilemapContainer.addChild(rectangle);
        }
      }
    }
  };

  private drawMonsters = (dungeon: Dungeon, sprites: TexturesMap) => {
    dungeon.monsters.forEach((monster) => {
      if (monster.type in sprites) {
        const sprite = new PIXI.Sprite(sprites[monster.type]);
        sprite.position.set(
          monster.x * this.unitInPixels,
          monster.y * this.unitInPixels
        );
        this.shapesContainer.addChild(sprite);
      }
    });
  };

  //
  // Debug
  //
  private drawGrid = async (dungeon: Dungeon, options: DrawOptions) => {
    for (let y = 0; y < dungeon.height; y++) {
      for (let x = 0; x < dungeon.width; x++) {
        const rectangle = new PIXI.Graphics();
        rectangle.lineStyle(1, 0xffffff, 0.1);
        rectangle.drawRect(0, 0, this.unitInPixels, this.unitInPixels);
        rectangle.position.set(x * this.unitInPixels, y * this.unitInPixels);

        // Add cell number
        if (options.debugTilesNumber) {
          const tileId = dungeon.tilemap[y][x];
          const text = new PIXI.Text(`${tileId}`, {
            fontSize: 10,
            fill: 0xffffff,
          });
          text.anchor.set(0.5);
          text.position.set(this.unitInPixels / 2, this.unitInPixels / 2);
          rectangle.addChild(text);
        }

        this.shapesContainer.addChild(rectangle);
      }
    }
  };

  private drawContainers = (container: TreeNode<Container>) => {
    container.leaves.forEach((container) => {
      const rectangle = new PIXI.Graphics();
      rectangle.lineStyle(1, 0xff0000, 0.8);
      rectangle.drawRect(
        0,
        0,
        container.width * this.unitInPixels,
        container.height * this.unitInPixels
      );
      rectangle.position.set(
        container.x * this.unitInPixels,
        container.y * this.unitInPixels
      );
      this.shapesContainer.addChild(rectangle);
    });
  };

  private drawRooms = (container: TreeNode<Container>) => {
    container.leaves.forEach((container) => {
      const room = container.room;
      if (!room) {
        return;
      }

      const rectangle = new PIXI.Graphics();
      rectangle.lineStyle(1, 0x00ff00, 0.8);
      rectangle.drawRect(
        0,
        0,
        room.width * this.unitInPixels,
        room.height * this.unitInPixels
      );
      rectangle.position.set(
        room.x * this.unitInPixels,
        room.y * this.unitInPixels
      );
      this.shapesContainer.addChild(rectangle);
    });
  };

  private drawCorridors = (container: TreeNode<Container>) => {
    const corridor = container.leaf.corridor;
    if (!corridor) {
      return;
    }

    const rectangle = new PIXI.Graphics();
    rectangle.lineStyle(1, 0x0000ff, 0.8);
    rectangle.drawRect(
      0,
      0,
      corridor.width * this.unitInPixels,
      corridor.height * this.unitInPixels
    );
    rectangle.position.set(
      corridor.x * this.unitInPixels,
      corridor.y * this.unitInPixels
    );
    this.shapesContainer.addChild(rectangle);

    this.drawCorridors(container.left);
    this.drawCorridors(container.right);
  };
}
