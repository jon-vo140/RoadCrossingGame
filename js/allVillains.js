// create a new scene 
let gameScene = new Phaser.Scene('Game');

// initiate scene parameters
gameScene.init = function () {
    // spidey speed 
    this.spideySpeed = 10;

    // villains speed boundaries
    this.villainMinSpeed = 3;
    this.villainMaxSpeed = 5;

    // villains y boundaries
    this.villainMinY = 0;
    this.villainMaxY = 666;

    // initiate "game over" flag as false
    this.isGameOver = false;

    // initiate "game win" flag as false
    this.isGameWin = false;
}
// load assets
gameScene.preload = function (){
    //load images
    this.load.image('background', 'assets/Rooftop.jpg.avif');
    this.load.image('spidey', 'assets/Spidey.png');
    this.load.image('gobbyGlider', 'assets/gobbyGlider.png');
    this.load.image('bootsie', 'assets/Bootsie.png');
    this.load.image('docOck', 'assets/Doc Ock.png');
    this.load.image('rhino', 'assets/Rhino.png');
    this.load.image('electro', 'assets/Electro.png');
};

// called once after preload ends
gameScene.create = function () {
    // half y position variable 
    let halfYPos = this.sys.game.config.height/2

    //create background sprite 
    let bg = this.add.sprite(0,0, 'background');

    //set position to center
    bg.setPosition(1480/2, 666/2);
    bg.depth = 0;

    //create spidey sprite 
    this.spideySprite = this.add.sprite(55,halfYPos, 'spidey');
    this.spideySprite.setScale(.35);
    this.spideySprite.flipX = true;
    this.spideySprite.depth = 2;

    // create bootsie sprite 
    this.bootsieSprite = this.add.sprite(1435,halfYPos, 'bootsie');
    this.bootsieSprite.setScale(.175);

    // create doc ock sprite 
    this.docOckSprite = this.add.sprite(250,150,'docOck');
    this.docOckSprite.setScale(.375);
    this.docOckSprite.flipX = true;

    // create rhino sprite 
    this.rhinoSprite = this.add.sprite(550,250, 'rhino');
    this.rhinoSprite.setScale(.35);

    // create electro sprite 
    this.electroSprite = this.add.sprite(850,350, 'electro');
    this.electroSprite.setScale(.30);

    // create gobby sprite 
    this.gobbySprite = this.add.sprite(1150,450, 'gobbyGlider');
    this.gobbySprite.setScale(.35);

    // create villain group
    this.villains = this.add.group({
        setXY: {
            x: 250, 
            y: 150,
            stepX: 300,
            stepY: 100
        }
    });

    // add villain sprites to group
    this.villains.add(this.docOckSprite);
    this.villains.add(this.rhinoSprite);
    this.villains.add(this.gobbySprite);
    this.villains.add(this.electroSprite);

    Phaser.Actions.Call(this.villains.getChildren(), function(villain) {
        // set villain movement velocity 
        let direction = Math.random() < 0.5 ? 1 : -1;
        let speed = this.villainMinSpeed + Math.random() * (this.villainMaxSpeed-this.villainMinSpeed);
        villain.velocity = direction * speed;

    }, this);

};

// update - this is called up to 60 times per second
gameScene.update = function (){

    // game over check 
    if (this.isGameOver) return;

    // game win check, if yes, spin spidey and end/restart game
    if (this.isGameWin) {
        this.spideySprite.setPosition(1385,333);
        this.spideySprite.rotation += .05; 
        return;
    };

    // check for active input (left click / touch)
    if (this.input.activePointer.isDown) {
        // spidey moves
        this.spideySprite.x += this.spideySpeed;
    }

    // spidey/bootsie overlap check 
    let spideyRect = this.spideySprite.getBounds();
    let bootsieRect = this.bootsieSprite.getBounds();

    if (Phaser.Geom.Intersects.RectangleToRectangle(spideyRect, bootsieRect)) {
        console.log('bootsie saved');

        // call game win method
        return this.gameWin();
    }

    // get villains 
    let villains = this.villains.getChildren();
    let numVillains = villains.length;

    for (let i = 0; i < numVillains; i++) {

        // villain movement
        villains[i].y += villains[i].velocity;

        // check if villain passes min and max y boundaries 
        let villainMoveUpBoundary = villains[i].velocity < 0 && villains[i].y <= this.villainMinY;
        let villainMoveDownBoundary = villains[i].velocity > 0 && villains[i].y >= this.villainMaxY;

        // reverse direction if min or max y boundaries are reached
        if (villainMoveUpBoundary || villainMoveDownBoundary) {
            villains[i].velocity *= -1;
        }

        // villain overlap check
        let villainRect = villains[i].getBounds();

        if (Phaser.Geom.Intersects.RectangleToRectangle(spideyRect, villainRect)) {
            console.log('villain contact');

            // call game lose method
            return this.gameLose();
        }
    } 
};

gameScene.gameLose = function() {

    // turn on game over flag 
    this.isGameOver = true;

    // shake camera
    this.cameras.main.shake(250);

    // fade after shake completion 
    this.cameras.main.on(Phaser.Cameras.Scene2D.Events.SHAKE_COMPLETE, function(){
        //fade out
        this.cameras.main.fade(250);
    }, this);

    // restart scene after fade completion 
    this.cameras.main.on(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, function(){
        // restart scene
        this.scene.restart();
    }, this);

};

gameScene.gameWin = function() {
    // set game win flag to true
    this.isGameWin = true;

    // fade camera
    this.cameras.main.fade(1800);

    // restart scene after fade completion 
    this.cameras.main.on(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, function(){
        // restart scene
        this.scene.restart();
    }, this);

};

// set configuration of the game
let config = {
    type: Phaser.AUTO, // Phaser will will use WebGl if available, if not it will use Canvas
    width: 1480,
    height: 666,
    scene: gameScene
};

// create new game, pass the configuration 
let game = new Phaser.Game(config);
