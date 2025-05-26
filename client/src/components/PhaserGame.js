import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import DialogueManager from './DialogueManager';
import Quest from './Quest.js';

const PhaserGame = () => {
  const gameRef = useRef(null);
  const phaserContainerRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;

    class MainScene extends Phaser.Scene {
      constructor() {
        super("MainScene");
        this.player = null;
        this.cursors = null;
        this.wasd = null;
        this.groundLayer = null;
        this.objectLayer = null;
        this.npcs = [];
      }

      preload() {
        console.log("[Phaser] 🚀 Preload started");
        this.load.on("loaderror", (file) => {
          console.error("❌ Load failed for:", file.key, file.src);
        });
        // Tileset and tilemap
        this.load.image("tileset1", "/assets/level1/tilesets/tileset1.png");
        this.load.image("tileset2", "/assets/level1/tilesets/tileset2.png");
        this.load.tilemapTiledJSON("map", "/assets/level1/tilemaps/map1.json");
        // Player
        this.load.spritesheet("player", "/assets/level1/sprites/shane.png", {
          frameWidth: 32,
          frameHeight: 48,
        });
        this.load.spritesheet("monk1", "/assets/level1/sprites/monk.png", {
          frameWidth: 32,
          frameHeight: 48
        });
        this.load.spritesheet("student", "/assets/level1/sprites/student.png", {
          frameWidth: 32,
          frameHeight: 48
        });
        
        console.log("[Phaser] ✅ All load calls registered");
      }

      create() {
  const map = this.make.tilemap({ key: "map" });
  const tileset1 = map.addTilesetImage("tileset1", "tileset1");
  const tileset2 = map.addTilesetImage("tileset2", "tileset2");

  const screenW = this.cameras.main.width;
  const screenH = this.cameras.main.height;
  const mapWidth = map.widthInPixels;
  const mapHeight = map.heightInPixels;
  const scaleX = screenW / mapWidth;
  const scaleY = screenH / mapHeight;
  const scaleFactor = Math.min(scaleX, scaleY);
  const offsetX = (screenW - mapWidth * scaleFactor) / 2;
  const offsetY = (screenH - mapHeight * scaleFactor) / 2;

  this.groundLayer = map.createLayer("Ground", [tileset1, tileset2], offsetX, offsetY).setScale(scaleFactor);
  this.objectLayer = map.createLayer("Objects", [tileset1, tileset2], offsetX, offsetY).setScale(scaleFactor);
  this.objectLayer.setCollisionByProperty({ collides: true });

  // Set player spawn near the door (bottom center), but inside the playable area
  const playerX = offsetX + (map.widthInPixels / 2) * scaleFactor;
  const playerY = offsetY + (map.heightInPixels - 192) * scaleFactor;

  // Center-aligned NPC setup
  this.npcs = [];
  const npcObjects = (map.getObjectLayer('NPCs')?.objects || []).filter(obj => {
    if (!obj.properties) return false;
    return obj.properties.some(p => p.name === 'type' && p.value === 'NPC');
  });

  npcObjects.forEach(npcData => {
    if (typeof npcData.x !== 'number' || typeof npcData.y !== 'number' || !npcData.name) return;

    const x = offsetX + npcData.x * scaleFactor;
    const y = offsetY + (npcData.y - (npcData.height || 0)) * scaleFactor;

    let spriteKey = npcData.properties?.find(p => p.name === 'spriteKey')?.value || npcData.name || 'monk1';
    if (!this.textures.exists(spriteKey)) spriteKey = 'monk1';

   // NPC
const npc = this.physics.add.sprite(x, y, spriteKey).setOrigin(0.5, 0.5);
npc.setScale(3.2 * scaleFactor);
npc.setDepth(10);
npc.setImmovable(true);
npc.body.setSize(npc.width * 0.6, npc.height * 0.8, true);

  

    npc.body.setSize(npc.width, npc.height, true);
    npc.npcName = npcData.name;
    npc.facing = 'down';

    if (Array.isArray(npcData.properties)) {
      npcData.properties.forEach(prop => {
        npc[prop.name] = prop.value;
      });
    }

    this.physics.add.collider(npc, this.objectLayer);
    this.npcs.push(npc);
  });

  // --- End NPCs Setup ---

  this.player = this.physics.add.sprite(playerX, playerY, "player", 0);
  this.player.setCollideWorldBounds(false);
  this.player.setScale(1.2);
  this.player.body.setSize(this.player.width, this.player.height, true);
  this.playerMovementEnabled = true;
  this.physics.add.collider(this.player, this.objectLayer);
  this.npcs.forEach(npc => this.physics.add.collider(this.player, npc));

  // Dialogue Manager
  this.dialogueManager = new DialogueManager(this, map.widthInPixels , () => {
    this.playerMovementEnabled = false;
  }, () => {
    this.playerMovementEnabled = true;
  });

  // ✅ Camera setup (added safely below)
  this.cameras.main.setBounds(0, 0, map.widthInPixels * scaleFactor, map.heightInPixels * scaleFactor);
  this.physics.world.setBounds(0, 0, map.widthInPixels * scaleFactor, map.heightInPixels * scaleFactor);
  this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

  // Animations
  this.anims.create({ key: "walk-down", frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
  this.anims.create({ key: "walk-left", frames: this.anims.generateFrameNumbers("player", { start: 4, end: 7 }), frameRate: 8, repeat: -1 });
  this.anims.create({ key: "walk-right", frames: this.anims.generateFrameNumbers("player", { start: 8, end: 11 }), frameRate: 8, repeat: -1 });
  this.anims.create({ key: "walk-up", frames: this.anims.generateFrameNumbers("player", { start: 12, end: 15 }), frameRate: 8, repeat: -1 });
  this.anims.create({ key: "idle-down", frames: [{ key: "player", frame: 0 }], frameRate: 1 });
  this.anims.create({ key: "idle-left", frames: [{ key: "player", frame: 4 }], frameRate: 1 });
  this.anims.create({ key: "idle-right", frames: [{ key: "player", frame: 8 }], frameRate: 1 });
  this.anims.create({ key: "idle-up", frames: [{ key: "player", frame: 12 }], frameRate: 1 });

  // Controls
  this.cursors = this.input.keyboard.createCursorKeys();
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
  });
  this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
 

   // Example: Learn Binary Search when interacting with a certain NPC
        this.input.keyboard.on('keydown-B', () => {
          console.log("📚 Binary Search learned!");
          setAlgorithmLearned("Binary Search");
        });

        this.input.keyboard.on('keydown-U', () => {
          console.log("📚 Bubble Sort learned!");
          setAlgorithmLearned("Bubble Sort");
        });

        this.input.keyboard.on('keydown-D', () => {
          console.log("📚 DFS learned!");
          setAlgorithmLearned("DFS");
        });


  
}



      update() {
        const speed = 150;
        let moving = false;
        let lastDirection = this.player.anims.currentAnim ? this.player.anims.currentAnim.key : "idle-down";
        let direction = null;
        const cursors = this.cursors;
        const wasd = this.wasd;
        if(this.playerMovementEnabled) {
          this.player.setVelocity(0);
          // Movement logic (arrow keys or WASD)
          if (cursors.left.isDown || wasd.left.isDown) {
            this.player.setVelocityX(-speed);
            direction = "left";
            moving = true;
          } else if (cursors.right.isDown || wasd.right.isDown) {
            this.player.setVelocityX(speed);
            direction = "right";
            moving = true;
          }
          if (cursors.up.isDown || wasd.up.isDown) {
            this.player.setVelocityY(-speed);
            direction = "up";
            moving = true;
          } else if (cursors.down.isDown || wasd.down.isDown) {
            this.player.setVelocityY(speed);
            direction = "down";
            moving = true;
          }
        }else {
          this.player.setVelocity(0);
        }

        // Animation logic
        if (moving) {
          if (direction === "left") {
            this.player.anims.play("walk-left", true);
          } else if (direction === "right") {
            this.player.anims.play("walk-right", true);
          } else if (direction === "up") {
            this.player.anims.play("walk-up", true);
          } else if (direction === "down") {
            this.player.anims.play("walk-down", true);
          }
        } else {
          // Idle animation based on last direction
          if (lastDirection.includes("left")) {
            this.player.anims.play("idle-left", true);
          } else if (lastDirection.includes("right")) {
            this.player.anims.play("idle-right", true);
          } else if (lastDirection.includes("up")) {
            this.player.anims.play("idle-up", true);
          } else {
            this.player.anims.play("idle-down", true);
          }
        }
        if (this.player.body.velocity.length() > 0) {
          this.player.body.velocity.normalize().scale(speed);
        }

        // NPC Distance Check & Interaction
        let closestNPC = null;
        let minDist = Infinity;
        if (Array.isArray(this.npcs)) {
          this.npcs.forEach(npc => {
            if (!npc || !npc.body) return;
            // Use direct distance in world coordinates (no scaling)
            const dist = Phaser.Math.Distance.Between(
              this.player.x, this.player.y,
              npc.x, npc.y
            );
            if (dist < minDist) {
              minDist = dist;
              closestNPC = npc;
            }
          });
        }
        // Use a tight threshold for interaction (e.g., 30px)
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
          if (closestNPC && minDist < 100) {
            // Face NPC toward player and set correct frame
            const dx = this.player.x - closestNPC.x;
            const dy = this.player.y - closestNPC.y;
            let npcFace = 'down';
            let frame = 0;
            if (Math.abs(dx) > Math.abs(dy)) {
              if (dx < 0) {
                npcFace = 'left';
                frame = 4;
                closestNPC.setFlipX(false); // No flip for left, use frame
              } else {
                npcFace = 'right';
                frame = 8;
                closestNPC.setFlipX(false); // No flip for right, use frame
              }
            } else {
              if (dy < 0) {
                npcFace = 'up';
                frame = 12;
              } else {
                npcFace = 'down';
                frame = 0;
              }
            }
            closestNPC.facing = npcFace;
            closestNPC.anims.stop(); // Stop any running animation
            closestNPC.setFrame(frame); // Set correct facing frame

            if (closestNPC) {
              const type = closestNPC.interactionType || 'talk'; // default fallback
            
              switch (type) {
                case 'talk':
                  const dialogue = closestNPC.dialogue || "This NPC has nothing to say.";
                  this.dialogueManager.showDialogue(dialogue);
                  break;
            
                case 'quest':
                  console.log(`QUEST 1 is called (NPC: ${closestNPC.npcName})`);
                  this.scene.pause(); // Pause main game
                  this.scene.launch('QuestScene', { playerName: this.playerName });
                  break;
            
                default:
                  console.warn(`Unknown interaction type: ${type}`);
              }
            }         
            // Log interaction
            console.log(`Interacting with ${closestNPC.npcName}`);
          } else {
            console.log('No NPC nearby to interact with');
          }
        }
      }
    }

    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: phaserContainerRef.current,
      physics: {
        default: "arcade",
        arcade: {
          debug: true,
        },
      },
      dom: {
        createContainer: true
      },
      scene: [MainScene, Quest],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    gameRef.current = new Phaser.Game(config);

    // Handle window resize
    const handleResize = () => {
      if (gameRef.current && gameRef.current.scale) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div ref={phaserContainerRef} id="phaser-container" className="w-screen h-screen" />;
};

export default PhaserGame;