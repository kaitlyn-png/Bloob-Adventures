class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        this.ACCELERATION = 200;
        this.DRAG = 750;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -400;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
    }

    create() {
        window.coinCount = 0;

        this.map = this.add.tilemap("Level1");

        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");        
        this.skyset = this.map.addTilesetImage("tilemap-backgrounds_packed", "tilemap-backgrounds_tiles");

        this.spikesLayer = this.map.createLayer("Spikes", this.tileset, 0, 0).setDepth(7);
        this.plantsLayer = this.map.createLayer("Plants", this.tileset, 0, 0).setDepth(6);
        this.platformLayer = this.map.createLayer("Platform", this.tileset, 0, 0).setDepth(5);
        this.Trees2Layer = this.map.createLayer("Trees2", this.tileset, 0, 0).setDepth(4);
        this.TreeLayer = this.map.createLayer("Tree", this.tileset, 0, 0).setDepth(3);
        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0).setDepth(2);
        //this.sky2Layer = this.map.createLayer("Sky2", this.skyset, 0, 0).setDepth(1);
        this.skyLayer = this.map.createLayer("Sky", this.skyset, 0, 0).setDepth(0);

        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        this.platformLayer.setCollisionByProperty({
            collides: true
        });

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        this.coinGroup = this.add.group(this.coins);


        //LEVER

        this.eKey = this.input.keyboard.addKey('E');

        this.levers = this.map.createFromObjects("Objects", {
            name: "lever",
            key: "tilemap_sheet",
            frame: 64
        });

        this.lever = this.levers[0]; 
        this.lever.isOn = false;
        this.lever.setFrame(64);

        //KEY

        this.key = this.physics.add.sprite(this.lever.x, this.lever.y + 32, "tilemap_sheet", 27);
        this.key.setVisible(false);
        this.key.body.enable = false;

        this.physics.add.collider(this.key, this.groundLayer);

        //WATER

        this.waterTiles = this.groundLayer.filterTiles(tile => {
            return tile.properties.water == true;
        });
        
        let topWaterTiles = this.waterTiles.filter(tile => {
            let tileAbove = this.groundLayer.getTileAt(tile.x, tile.y - 1);
            return !(tileAbove && tileAbove.properties && tileAbove.properties.water);
        });

        my.vfx.waterBubbles = [];

        topWaterTiles.forEach(tile => {
            let emitter = this.add.particles(tile.getCenterX(), tile.getCenterY(), "kenny-particles", {
                frame: ['smoke_03.png', 'smoke_09.png'],
                random: true,
                scale: { start: 0.04, end: 0.08 },
                lifespan: { min: 1200, max: 1800 },
                speedY: { min: -10, max: -20 },
                speedX: { min: -5, max: 5 },
                frequency: 2500,
                quantity: 1,
                alpha: { start: 0.5, end: 0 },
                gravityY: 0
            });
            my.vfx.waterBubbles.push(emitter);
        });

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // PLAYER 

        my.sprite.player = this.physics.add.sprite(50, 50, "platformer_characters", "tile_0000.png").setDepth(10); // 50, 50
        //my.sprite.player = this.physics.add.sprite(2400, 190, "platformer_characters", "tile_0000.png").setDepth(10); // keyhole spawn
        my.sprite.player.setCollideWorldBounds(true);
        
        // AUDIO

        this.sound.play('start', { loop: false, volume: 0.7 });

        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.platformLayer);

        my.vfx.coin = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_07.png', 'star_08.png', 'star_09.png'],
            random: true,
            scale: {start: 0.05, end: 0.05},
            maxAliveParticles: 4,
            lifespan: 400,
            gravityY: 0,
            alpha: {start: 1, end: 0.01}
        });

        my.vfx.coin.stop();             
        
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy();
            my.vfx.coin.emitParticleAt(obj2.x, obj2.y, 12);
            this.sound.play('coin', { loop: false, volume: 0.7 });
            window.coinCount++;
            this.coinText.setText(`Coins: ${window.coinCount}`);
        });

        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);


        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_04.png', 'smoke_08.png'],
            random: true,
            scale: {start: 0.03, end: 0.07},
            maxAliveParticles: 6,
            lifespan: 200,
            gravityY: -500,
            alpha: {start: 1, end: 0.1}, 
            depth: 10,
        });

        my.vfx.walking.stop();        

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        this.ladderTiles = this.groundLayer.filterTiles(tile => tile.properties.ladder === true);
        
        // KEY

        this.hasKey = false; // debug

        //KEYHOLE + DOOR

        this.keyholes = this.map.createFromObjects("Objects", {
            name: "keyhole",
            key: "tilemap_sheet",
            frame: 28
        });
        this.keyhole = this.keyholes[0];

        this.doors = this.map.createFromObjects("Objects", {
            name: "door",
            key: "tilemap_sheet",
            frame: 150
        });

        this.doortop = this.map.createFromObjects("Objects", {
            name: "doortop",  
            key: "tilemap_sheet", 
            frame: 110
        }); 

        this.door = this.doors[0];
        this.doortop = this.doortop[0];
        this.doortop.setVisible(false);
        this.door.setVisible(false);

        this.coinText = this.add.text(
            this.cameras.main.width - 32, 16,
            `Coins: ${window.coinCount}`,
            { fontFamily: 'monospace', fontSize: '32px', color: '#000000', stroke: '#000', strokeThickness: 4 }
        ).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
    }

    isOnLadder() {
        let playerTileX = this.groundLayer.worldToTileX(my.sprite.player.x);
        let playerTileY = this.groundLayer.worldToTileY(my.sprite.player.y);
        let tile = this.groundLayer.getTileAt(playerTileX, playerTileY);
        return tile && tile.properties.ladder === true;
    }

    update() {
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }

        // Track previous grounded state for landing sound
        if (this.wasOnGround === undefined) this.wasOnGround = my.sprite.player.body.blocked.down;

        // JUMP
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.walking.emitParticleAt(
                my.sprite.player.x,
                my.sprite.player.y + my.sprite.player.displayHeight / 2,
                8
            );
            this.sound.play('jump', { loop: false, volume: 1 }); // <-- Jump sound
        }

        // LANDING
        // if (!this.wasOnGround && my.sprite.player.body.blocked.down) {
        //     this.sound.play('land', { loop: false, volume: 1 }); // <-- Landing sound
        // }
        this.wasOnGround = my.sprite.player.body.blocked.down;

        if (this.isOnLadder()) {
            my.sprite.player.body.allowGravity = false;
            my.sprite.player.setVelocityY(0);

            if (cursors.up.isDown) {
                my.sprite.player.setVelocityY(-200);
            } else if (cursors.down.isDown) {
                my.sprite.player.setVelocityY(200);
            }
        } else {
            my.sprite.player.body.allowGravity = true;
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        // RESPAWN IF HIT WATER

        let playerTileX = this.groundLayer.worldToTileX(my.sprite.player.x);
        let playerTileY = this.groundLayer.worldToTileY(my.sprite.player.y);
        let tile = this.groundLayer.getTileAt(playerTileX, playerTileY);
        if (tile && tile.properties.water === true) {            
            this.sound.play('oof', { loop: false, volume: 0.7 });
            my.sprite.player.x = 50;
            my.sprite.player.y = 50;
            my.sprite.player.body.setVelocity(0, 0);
        }

        // RESPAWN IF HIT SPIKES

        let spikeTile = this.spikesLayer.getTileAtWorldXY(my.sprite.player.x, my.sprite.player.y);
        if (spikeTile && spikeTile.index !== -1) {
            this.sound.play('oof', { loop: false, volume: 0.7 });
            my.sprite.player.x = 50;
            my.sprite.player.y = 50;
            my.sprite.player.body.setVelocity(0, 0);
        }

        // LEVER

        if (this.lever) {
            const dist = Phaser.Math.Distance.Between(
                my.sprite.player.x, my.sprite.player.y,
                this.lever.x, this.lever.y
            );
            if (dist < 20 && Phaser.Input.Keyboard.JustDown(this.eKey)) {
                
                this.lever.isOn = !this.lever.isOn;
                this.lever.setFrame(this.lever.isOn ? 66 : 64);
                
                this.sound.play('interact', { loop: false, volume: 0.7 });

                if (this.lever.isOn && this.key && !this.key.visible) { // KEY
                    this.key.setVisible(true).setDepth(7);
                    this.key.body.enable = true;
                    this.key.setVelocityY(200);
                }
            }
        }
        
        // KEY

        this.physics.add.overlap(my.sprite.player, this.key, () => {
            if (this.key.visible) {
                this.key.setVisible(false);
                this.key.body.enable = false;
                my.vfx.coin.emitParticleAt(this.key.x, this.key.y, 12);
                this.hasKey = true;
                
                this.sound.play('coin', { loop: false, volume: 0.7 });
            }
        });

        // KEYHOLE AND DOOR LOGIC
        if (this.keyhole && this.hasKey) {
            const dist = Phaser.Math.Distance.Between(
                my.sprite.player.x, my.sprite.player.y,
                this.keyhole.x, this.keyhole.y
            );
            if (dist < 20 && Phaser.Input.Keyboard.JustDown(this.eKey)) {      
                
                this.sound.play('interact', { loop: false, volume: 0.7 });
                
                my.vfx.coin.emitParticleAt(this.keyhole.x, this.keyhole.y, 12);
                this.keyhole.setVisible(false);                
                this.door.setVisible(true);                
                this.doortop.setVisible(true);
            }
        }

        if (this.door && this.door.visible) {
            const dist = Phaser.Math.Distance.Between(
                my.sprite.player.x, my.sprite.player.y,
                this.door.x, this.door.y
            );
            if (dist < 20 && Phaser.Input.Keyboard.JustDown(this.eKey)) {
                this.sound.play('door', { loop: false, volume: 0.7 });
                this.scene.start("End");
            }
        }
    }
}

window.coinCount = 0;