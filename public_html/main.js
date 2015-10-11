var width = 1350;
var height = 900;
var game = new Phaser.Game(width, height, Phaser.AUTO, '', {preload: preload,
    create: create, update: update});
var titleSprite;
var titleTime;

var backgroundAudio;
var laserAudio;
var barkAudio;
var monsterDamageAudio;
var playerDamageAudio;
var accessDeniedAudio;

var player;
var playerVelocity = 400;
var lastX = 0;
var lastY = playerVelocity;
var playerStartX;
var playerStartY;
var invincibleTime = 0;

var currentLevel = 0;
var currentLevelMap;
var currentWallLayer;
var currentFloorLayer;
var currentDoorLayer;
var room = 1;
var doors; // group
var hearts; // group
var keyObject;
var codeObject;
var code;

var enemies;
var enemiesActive = true;
var numEnemies = 15;
var MAX_ENEMIES = 100;

var bullets; // group of bullets
var bullet;  // current bullet being fired
var bulletTime = 0; // time after current time that must pass before bullet can fire

function preload() {
    //preload audio
    game.load.audio("laser", "assets/audio/laser.mp3");
    game.load.audio("bark", "assets/audio/bark.mp3");
    game.load.audio("background", "assets/audio/background.wav");
    //preload game sprites
    game.load.spritesheet("player", "assets/sprites/player.png", 90, 90);
    game.load.image("bullet", "assets/sprites/bullet.png");
    game.load.spritesheet("enemy", "assets/sprites/dogSheet.png", 170, 170);
    game.load.image("title", "assets/sprites/title.png");
    game.load.image("gameOver", "assets/sprites/gameOver.png");
    //preload map
//    game.load.tilemap("levelOneMap", "assets/levels/one/levelOne.json",
//            null, Phaser.Tilemap.TILED_JSON);
//    game.load.image("floorTile", "assets/levels/one/floorSheet.png");
//    game.load.image("wallTile", "assets/levels/one/wallSheet.png");
    game.load.tilemap("levelOneMap", "assets/levels/Level 1/levelOne.json",
            null, Phaser.Tilemap.TILED_JSON);
    game.load.image("floorTile", "assets/levels/Level 1/floorTile.png");
    game.load.image("wallTile", "assets/levels/Level 1/wallSheet.png");
    game.load.spritesheet("doorTile", "assets/levels/Level 1/doors.png", 90, 90);
    game.load.image("key", "assets/levels/Level 1/key.png");
    game.load.image("heart", "assets/levels/Level 1/heart.png");
    game.load.image("codeChip", "assets/levels/Level 1/codeChip.png");
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.setBounds(0, 0, width * 3, height * 4);
    titleTime = game.time.now + 2000;
    titleSprite = game.add.sprite(0, 0,"title");
    createKeys();
    createSetupMap();
    goToNextLevel();
    createSetupPlayer();
    createSetupBullets();
    createSetupEnemies();
    createSetupAudio();
    enableEnemies(numEnemies);
}

function update() {
    game.physics.arcade.collide(player, currentDoorLayer, function () {
        console.log('ya');
    });
    game.physics.arcade.overlap(bullet, enemies, bulletEnemyCollision);
    game.physics.arcade.collide(player, enemies, playerEnemyCollision);
    game.physics.arcade.collide(enemies, enemies);
//    game.physics.arcade.collide(enemies, currentWallLayer);
    game.physics.arcade.collide(player, currentWallLayer);
    checkKeys();
    checkPlayerPosition();
    moveEnemies();
}

function moveEnemies() {
    if (!enemiesActive)
        return;
    for (var i = 0; i < numEnemies; i++) {
        var enemy = enemies.children[i];
        enemy.body.velocity.x = 300 * ((player.x - enemy.x)) /
                Math.sqrt(Math.pow(player.x, 2) + Math.pow(enemy.x, 2));
        enemy.body.velocity.y = 300 * ((player.y - enemy.y)) /
                Math.sqrt(Math.pow(player.y, 2) + Math.pow(enemy.y, 2));
        var vX = enemy.body.velocity.x;
        var vY = enemy.body.velocity.y;
        if (vX > 0) {
            enemy.animations.play("right");
        }
        else if (vX < 0) {
            enemy.animations.play("left");
        }
        else if (vY < 0) {
            enemy.animations.play("up");
        }
        else if (vY > 0) {
            enemy.animations.play("down");
        }
    }
}

function createSetupAudio() {
    laserAudio = game.add.audio("laser");
    barkAudio = game.add.audio("bark");
    backgroundAudio = game.add.audio("background");
    backgroundAudio.play(true);
}

function createSetupEnemies() {
    enemies = game.add.group();
    enemies.enableBody = true;
    for (var i = 0; i < MAX_ENEMIES; i++) {
        var randX = game.rnd.integerInRange(game.camera.position.x - width / 2,
                game.camera.position.x + width / 2);
        var randY = game.rnd.integerInRange(game.camera.position.y - height / 2,
                game.camera.position.y + height / 2);
        var enemy = enemies.create(randX, randY, "enemy");
        enemy.health = 3;
        enemy.visible = false;
        enemy.exists = false;
        enemy.animations.add("up", [0], 10, true);
        enemy.animations.add("right", [3, 4], 10, true);
        enemy.animations.add("left", [1, 2], 10, true);
        enemy.animations.add("down", [5], 10, true);
    }
}

function createSetupBullets() {
    bullets = game.add.group();
    bullets.enableBody = true;
    for (var i = 0; i < 20; i++) {
        var bullet = bullets.create(0, 0, "bullet");
        bullet.visible = false;
        bullet.exists = false;
        bullet.checkWorldBounds = true;
        bullet.events.onOutOfBounds.add(function (b) {
            b.kill();
        }, this);
    }
}

function createSetupPlayer() {
    player = game.add.sprite(playerStartX, playerStartY, "player");
    player.health = 4;
    game.physics.arcade.enable(player);
    game.camera.x = 0;
    game.camera.y = height;

    //setup animations  
    player.animations.add("right", [2, 7], 10, true);
    player.animations.add("left", [4, 6], 10, true);
    player.animations.add("up", [5, 8], 10, true);
    player.animations.add("down", [1, 3], 10, true);

}

function createSetupMap() {
    code = game.time.now.toString(16).charAt(0);
    // Get map and layers
    currentLevelMap = game.add.tilemap("levelOneMap");
    currentLevelMap.addTilesetImage("doorTile");
    currentLevelMap.addTilesetImage("floorTile");
    currentLevelMap.addTilesetImage("wallTile");
    currentLevelMap.addTilesetImage("heart");
    currentLevelMap.addTilesetImage("key");
    currentLevelMap.addTilesetImage("codeChip");
    currentFloorLayer = currentLevelMap.createLayer("floorLayer");
    currentWallLayer = currentLevelMap.createLayer("wallLayer");
    currentDoorLayer = currentLevelMap.createLayer("doorLayer");
    currentLevelMap.createLayer("pickUp");

    // Get game objects
//    doors = game.add.group();
//    doors.enableBody = true;
//    currentLevelMap.createFromObjects("Door", 34, "doorTile", doors);
//    console.log(doors.length);
//    currentLevelMap.createLayer("door");

//    hearts = game.add.group();
//    hearts.enableBody = true;
//    currentLevelMap.createFromObjects("Hearts", 305, "heart", true, false, hearts);
    currentLevelMap.setCollisionBetween(0, 350, true, "wallLayer");
    currentLevelMap.setCollisionBetween(0, "doorLayer");
}

function createKeys() {
    arrowKeys = game.input.keyboard.createCursorKeys();
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function checkKeys() {
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    if (arrowKeys.up.isDown) {
        player.body.velocity.y = -1 * playerVelocity;
        lastX = player.body.velocity.x;
        lastY = player.body.velocity.y;
        player.animations.play("up");
    }
    if (arrowKeys.down.isDown) {
        player.body.velocity.y = playerVelocity;
        lastX = player.body.velocity.x;
        lastY = player.body.velocity.y;
        player.animations.play("down");
    }
    if (arrowKeys.right.isDown) {
        player.body.velocity.x = playerVelocity;
        lastX = player.body.velocity.x;
        lastY = player.body.velocity.y;
        player.animations.play("right");
    }
    if (arrowKeys.left.isDown) {
        player.body.velocity.x = -1 * playerVelocity;
        lastX = player.body.velocity.x;
        lastY = player.body.velocity.y;
        player.animations.play("left");
    }
    if (player.body.velocity.x === 0 && player.body.velocity.y === 0) {
        player.animations.stop();
    }

    if (spaceKey.isDown) {
        fireBullet();
    }
}