/******* need refactoring *******/

    //load resources and start game
    resources.load([
        'img/sprite.png',
        'img/background.png'
    ]);
    resources.onReady(start);
    // end


    var container = document.getElementById("container");

    /* Create background */
    var background = document.createElement("canvas"),
        backgroundContext = background.getContext("2d");
    background.width = 760;
    background.height = 570;
    background.id = "pandaBackground";
    container.appendChild(background);

    /* Create game field */
    var canvas = document.createElement("canvas"),
        context = canvas.getContext("2d");
    canvas.width = 760;
    canvas.height = 570;
    canvas.id = "panda";
    container.appendChild(canvas);

    // A cross-browser requestAnimationFrame
    // See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
    var requestAnimFrame = (function(){
        return window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

// Game variables

    var started = false,
        isGameOver,
        randomInt,
        player = {
            pos: [0, 0],
            sprite: new Sprite('img/sprite.png', [0, 0], [79, 100])
        };

    var lastTime,
        enemies = [],
        bamboo = [],
        gameTime = 0,
        score = 0,
        scoreEl = document.getElementById('scoreValue');
    // Speed in pixels per second
    var playerSpeed = 200,
        enemySpeed = 180,
        bambooSpeed = 150,
        backgroundSpeed = 50;

    var lastAnimationFrameTime = 0,
        lastFpsUpdateTime = 0,
        backgroundOffset = 0,
        fps = 60;

    // end

    // initialisation of start screen, add events for buttons, call game init function
    function start() {
        panda_musicInit();
        panda_soundsInit();
        document.getElementById("loading").style.display = "none";
        document.getElementById('start').onclick = function() {
            document.getElementById('startBox').style.display = "none";
            document.getElementById('score').style.display = "block";
            started = true;
        };
        init();

    }

    // The main game loop
    function main() {
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;
        if (started == true) {
            update(dt, now);
            render();
        } else {
            handleInput(0);
        }
        drawBackground(now);
        lastTime = now;
        requestAnimFrame(main);
    };

    function init() {
        reset();
        lastTime = Date.now();
        main();
        if(getCookie("musicState") == "on") {
            music.load();
            music.play();
            console.log('Playing');
        }
    }

    // Update game objects
    function update(dt, now) {
        gameTime += dt;
        context.clearRect(0, 0, canvas.width, canvas.height);
        randomInt = Math.floor(Math.random() * 100) + 1;
        handleInput(dt);
        updateEntities(dt);

        // It gets harder over time by adding enemies using this
        if(enemies.length < 5 && !isGameOver && randomInt == 75) {
            randomInt = Math.floor(Math.random() * 100) + 1;
            if(randomInt < 50) {
                enemies.push({
                    pos: [Math.random() * (canvas.width - 42), 0],
                    sprite: new Sprite('img/sprite.png', [0, 147], [56, 45])
                });
            } else {
                enemies.push({
                    pos: [Math.random() * (canvas.width - 42), 0],
                    sprite: new Sprite('img/sprite.png', [56, 150], [48, 43])
                });
            }
        }

        if(bamboo.length < 5 && !isGameOver && randomInt == 84) {
            bamboo.push({
                pos: [Math.random() * (canvas.width - 42),
                    0],
                sprite: new Sprite('img/sprite.png', [0, 101], [48, 46])
            });
        }

        checkCollisions();
        scoreEl.innerHTML = score;
    };

    function calculateFps(now) {
        fps = 1000 / (now - lastAnimationFrameTime);
        lastAnimationFrameTime = now;

        if (now - lastFpsUpdateTime > 1000) {
            lastFpsUpdateTime = now;
        }
        return fps;
    };

    function drawBackground(now) {
        fps = calculateFps(now);
        backgroundImage = resources.get('img/background.png');
        var offset = backgroundOffset + backgroundSpeed/fps;

        if (offset > 0 && offset < backgroundImage.height) {
            backgroundOffset = offset;
        }
        else {
            backgroundOffset = 0;
        }
        backgroundContext.translate(0, backgroundOffset);

        // Initially onscreen:
        backgroundContext.drawImage(backgroundImage, 0, 0);

        // Initially offscreen:
        backgroundContext.drawImage(backgroundImage, 0, -backgroundImage.height);

        backgroundContext.translate(0, -backgroundOffset);
    }

    function handleInput(dt) {
        if(started == true) {
            if(input.isDown('LEFT') || input.isDown('a')) {
                player.pos[0] -= playerSpeed * dt;
            }

            if(input.isDown('RIGHT') || input.isDown('d')) {
                player.pos[0] += playerSpeed * dt;
            }
        }
    }

    function updateEntities(dt) {
        // Update the player sprite animation
        player.sprite.update(dt);

        // Update all the enemies
        for(var i=0; i<enemies.length; i++) {
            enemies[i].pos[1] += enemySpeed * dt;
            enemies[i].sprite.update(dt);

            // Remove if offscreen
            if(enemies[i].pos[1] + enemies[i].sprite.size[1] + 20 > canvas.height) {
                enemies.splice(i, 1);
                i--;
            }
        }

        for(var i=0; i<bamboo.length; i++) {
            bamboo[i].pos[1] += bambooSpeed * dt;
            bamboo[i].sprite.update(dt);

            // Remove if offscreen
            if(bamboo[i].pos[1] + bamboo[i].sprite.size[1] + 20 > canvas.height) {
                bamboo.splice(i, 1);
                i--;
            }
        }
    }

    // Collisions

    function collides(x, y, r, b, x2, y2, r2, b2) {
        return !(r <= x2 || x > r2 ||
            b <= y2 || y > b2);
    }

    function boxCollides(pos, size, pos2, size2) {
        return collides(pos[0], pos[1],
            pos[0] + size[0], pos[1] + size[1],
            pos2[0], pos2[1],
            pos2[0] + size2[0], pos2[1] + size2[1]);
    }

    function checkCollisions() {
        checkPlayerBounds();

        // Run collision detection for all enemies and
        for(var i=0; i<enemies.length; i++) {
            var pos = enemies[i].pos;
            var size = enemies[i].sprite.size;

            if(boxCollides(pos, size, player.pos, player.sprite.size)) {
                gameOver();
            }
        }

        for(var i=0; i<bamboo.length; i++) {
            var pos = bamboo[i].pos;
            var size = bamboo[i].sprite.size;

            if(boxCollides(pos, size, player.pos, player.sprite.size)) {
                s_pickup.load();
                s_pickup.play();
                score += 20;
                bamboo.splice(i, 1);
                enemySpeed += 5;
                player.sprite = new Sprite('img/sprite.png', [0, 0], [79, 100], 6, [1, 0], 'horizontal', true);
            }
        }
    }

    function checkPlayerBounds() {
        // Check bounds
        if(player.pos[0] < 0) {
            player.pos[0] = 0;
        }
        else if(player.pos[0] > canvas.width - player.sprite.size[0]) {
            player.pos[0] = canvas.width - player.sprite.size[0];
        }

        if(player.pos[1] < 0) {
            player.pos[1] = 0;
        }
        else if(player.pos[1] > canvas.height - player.sprite.size[1]) {
            player.pos[1] = canvas.height - player.sprite.size[1];
        }
    }

    // Draw everything
    function render() {
        // Render the player if the game isn't over
        if(!isGameOver) {
            renderEntity(player);
        }

        renderEntities(enemies);
        renderEntities(bamboo);
    };

    function renderEntities(list) {
        for(var i=0; i<list.length; i++) {
            renderEntity(list[i]);
        }
    }

    function renderEntity(entity) {
        context.save();
        context.translate(entity.pos[0], entity.pos[1]);
        entity.sprite.render(context);
        context.restore();
    }

    // Game over
    function gameOver() {
        enemies = [];
        bamboo = [];
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('gameOverScoreValue').innerHTML = score;
        document.getElementById('restart').onclick = function() {
            init();
        };
        document.getElementById('toMainMenu').onclick = function() {
            reset();
            document.getElementById('score').style.display = "none";
            started = false;
            document.getElementById('startBox').style.display = "block";
            if(getCookie("musicState") == "on") {
                music.play();
            }
        };
        if(getCookie("musicState") == "on") {
            music.load();
        }
        isGameOver = true;
    }



    // Reset game to original state
    function reset() {
        document.getElementById('gameOver').style.display = 'none';
        isGameOver = false;
        gameTime = 0;
        score = 0;
        enemySpeed = 150;
        lastAnimationFrameTime = 0;
        lastFpsUpdateTime = 0;
        backgroundOffset = 0;
        fps = 60;

        enemies = [];
        bamboo = [];

        player.pos = [336, 453];
    };