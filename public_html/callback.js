function playerDoorCollision(player, door) {
    console.log("ooo");
}

function enableEnemies(numEnemies) {
    if (!enemiesActive)
        return;
    for (var i = 0; i < numEnemies; i++) {
        var enemy = enemies.children[i];
        var randX = game.rnd.integerInRange(game.camera.position.x - width / 2,
                game.camera.position.x + width / 2);
        var randY = game.rnd.integerInRange(game.camera.position.y - height / 2,
                game.camera.position.y + height / 2);
        enemy.reset(randX, randY);
//        enemy.exists = true;
    }
}

function playerEnemyCollision(player, enemy) {
    if (invincibleTime < game.time.now) {
        barkAudio.play();
        player.damage(1);
        console.log("you been hit!");
        if (player.health === 0) {
            player.kill();
        }
        invincibleTime = game.time.now + 1600;
    }
}

function bulletEnemyCollision(bullet, enemy) {
    if (!enemiesActive)
        return;
    enemy.damage(1);
    bullet.kill();
    enemy.body.velocity.x = 0;
    enemy.body.velocity.y = 0;
    if (enemy.health === 0)
        enemy.kill();
}

function checkPlayerPosition() {
    if (player.x >= game.camera.position.x + width / 2) {
        if (room === 1)
            game.camera.x += width;
    } else if (player.y >= game.camera.position.y + height / 2) {
        game.camera.y += height;
    } else if (player.x <= game.camera.position.x - width / 2) {
        game.camera.x -= width;
    } else if (player.y <= game.camera.position.y - height / 2) {
        game.camera.y -= height;
    }
}

function fireBullet() {
    var bulletSpeed = 1000;
    var vX;
    var vY;
    if (bulletTime < game.time.now) {
        bullet = bullets.getFirstExists(false);
        if (player.body.velocity.x === 0 && player.body.velocity.y === 0) {
            vX = lastX;
            vY = lastY;
        } else {
            vX = player.body.velocity.x;
            vY = player.body.velocity.y;
        }
        if (bullet) {
            laserAudio.play();
            if (vX > 0) {
                bullet.reset(player.x, player.y);
                bullet.body.velocity.x = bulletSpeed;
            }
            if (vX < 0) {
                bullet.reset(player.x, player.y);
                bullet.body.velocity.x = -1 * bulletSpeed;
            }
            if (vY < 0) {
                bullet.reset(player.x + player.width / 2 - 10, player.y);
                bullet.body.velocity.y = -1 * bulletSpeed;
            }
            if (vY > 0) {
                bullet.reset(player.x + player.width / 2 - 10, player.y + player.height);
                bullet.body.velocity.y = bulletSpeed;
            }
            lastX = vX;
            lastY = vY;
            bulletTime = game.time.now + 150;
        }
    }
}