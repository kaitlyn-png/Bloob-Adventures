class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        this.load.image("tilemap_tiles", "tilemap_packed.png");
        this.load.image("tilemap-backgrounds_tiles", "tilemap-backgrounds_packed.png");

        this.load.tilemapTiledJSON("Level1", "Level1.tmj");
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        // AUDIO LOAD 
        
        this.load.audio("interact", "Audio/8-Bit/jingles_NES03.ogg");      
        this.load.audio("door", "Audio/8-Bit/jingles_NES08.ogg");        
        this.load.audio("coin", "Audio/8-Bit/jingles_NES09.ogg");
        this.load.audio("start", "Audio/8-Bit/jingles_NES12.ogg");
        this.load.audio("oof", "Audio/oof.mp3");        
        this.load.audio("jump", "Audio/jump.mp3");        
        this.load.audio("land", "Audio/land.mp3");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

         this.scene.start("platformerScene");
    }

    update() {
    }
}