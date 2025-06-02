class End extends Phaser.Scene {
    constructor() {
        super("End");
    }

    create() {
        this.add.text(
            this.cameras.main.centerX, this.cameras.main.centerY,
            `Final Score: ${window.coinCount}`,
            { fontFamily: 'monospace', fontSize: '48px', color: '#fff', stroke: '#000', strokeThickness: 6 }
        ).setOrigin(0.5);

        this.add.text(
            this.cameras.main.centerX, this.cameras.main.centerY + 80,
            "Press R to Restart",
            { fontFamily: 'monospace', fontSize: '32px', color: '#fff', stroke: '#000', strokeThickness: 4 }
        ).setOrigin(0.5);

        this.input.keyboard.on('keydown-R', () => {
            window.coinCount = 0;
            this.scene.start("platformerScene");
        });
    }
}