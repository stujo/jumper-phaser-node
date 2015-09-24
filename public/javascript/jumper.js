window.onload = function() {
    function BootState(game) {

        console.log("%cBootState", "color:white; background:red");

        this.preload = function() {
            game.load.image("loading", "assets/loading.png");
        };

        this.create = function() {

            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.minWidth = 480;
            this.scale.minHeight = 260;
            this.scale.maxWidth = 1024;
            this.scale.maxHeight = 768;
            this.scale.forceLandscape = true;
            this.scale.pageAlignHorizontally = true;
            this.scale.updateLayout();

            game.state.start("PreloadState");
        }
    }

    function PreloadState(game) {

        console.log("%cPreloadState", "color:white; background:red");

        this.preload = function() {
            var loadingBar = this.add.sprite(160, 240, "loading");
            loadingBar.anchor.setTo(0.5, 0.5);
            this.load.setPreloadSprite(loadingBar);

            game.load.image('sky', 'assets/sky.png');
            game.load.image('ground', 'assets/platform.png');
            game.load.image('star', 'assets/star.png');
            game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
        };

        this.create = function() {
            game.state.start("GameState");
        };
    }

    function GameState(game) {
        "use strict";
        var score, start_time, completion_time, platforms, player, cursors, stars, scoreDisplay, timeDisplay;

        console.log("%cGameState", "color:white; background:red");

        function elapsedTime() {
            return game.time.totalElapsedSeconds() - start_time;
        }

        this.create = function() {
            completion_time = null;
            score = 0;
            start_time = game.time.totalElapsedSeconds();

            //  We're going to be using physics, so enable the Arcade Physics system
            game.physics.startSystem(Phaser.Physics.ARCADE);

            //  A simple background for our game
            game.add.sprite(0, 0, 'sky');

            //  The platforms group contains the ground and the 2 ledges we can jump on
            platforms = game.add.group();

            //  We will enable physics for any object that is created in this group
            platforms.enableBody = true;

            // Here we create the ground.
            var ground = platforms.create(0, game.world.height - 64, 'ground');

            //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
            ground.scale.setTo(2, 2);

            //  This stops it from falling away when you jump on it
            ground.body.immovable = true;

            //  Now let's create two ledges
            var ledge = platforms.create(400, 400, 'ground');

            ledge.body.immovable = true;

            ledge = platforms.create(-150, 250, 'ground');

            ledge.body.immovable = true;


            // The player and its settings
            player = game.add.sprite(32, game.world.height - 550, 'dude');

            //  We need to enable physics on the player
            game.physics.arcade.enable(player);

            //  Player physics properties. Give the little guy a slight bounce.
            player.body.bounce.y = 0.2;
            player.body.gravity.y = 300;
            player.body.collideWorldBounds = true;

            //  Our two animations, walking left and right.
            player.animations.add('left', [0, 1, 2, 3], 10, true);
            player.animations.add('right', [5, 6, 7, 8], 10, true);

            cursors = game.input.keyboard.createCursorKeys();

            stars = game.add.group();

            stars.enableBody = true;

            //  Here we'll create 12 of them evenly spaced apart
            for (var i = 0; i < 12; i++) {
                //  Create a star inside of the 'stars' group
                var star = stars.create(i * 70, 0, 'star');

                //  Let gravity do its thing
                star.body.gravity.y = 6;

                //  This just gives each star a slightly random bounce value
                star.body.bounce.y = 0.7 + Math.random() * 0.2;
            }

            scoreDisplay = game.add.text(16, 16, 'score: ' + score, {
                fontSize: '32px',
                fill: '#000'
            });
            timeDisplay = game.add.text(300, 16, '', {
                fontSize: '32px',
                fill: '#000'
            });

        }

        function updateScore() {
            scoreDisplay.text = 'Score: ' + score;
        }

        function updateTime() {
            timeDisplay.text = elapsedTime().toFixed(2);
        }

        function complete() {
            completion_time = elapsedTime().toFixed(3);
        }

        function wrapUp() {
            stopPlayer();
            player.body.gravity.y = -60;
            stars.forEach(function(star) {
                star.body.gravity.y = 600;
            });
            game.state.start('CollectedAllState', false, false, completion_time);
        }

        function collectStar(player, star) {
            // Removes the star from the screen
            star.kill();
            //  Add and update the score
            score += 10;
            updateScore();

            if (score >= 120) {
                complete();
            }
        }

        function gameRunning() {
            return !completion_time;
        }

        function stopPlayer() {
            //  Stand still
            //  Reset the players velocity (movement)
            player.body.velocity.x = 0;
            player.animations.stop();
            player.frame = 4;
        }

        this.update = function() {

            //  Collide the player with the platforms
            game.physics.arcade.collide(player, platforms);

            if (gameRunning()) {
                updateTime();

                game.physics.arcade.collide(stars, platforms);
                game.physics.arcade.overlap(player, stars, collectStar, null, this);

                if (cursors.left.isDown) {
                    //  Move to the left
                    player.body.velocity.x = -150;

                    player.animations.play('left');
                } else if (cursors.right.isDown) {
                    //  Move to the right
                    player.body.velocity.x = 150;

                    player.animations.play('right');
                } else {
                    stopPlayer();
                }

                //  Allow the player to jump if they are touching the ground.
                if (cursors.up.isDown && player.body.touching.down) {
                    player.body.velocity.y = -350;
                }
            } else {
                wrapUp();
            }
        }
    }


    function CollectedAllState(game) {

        var spacebar, label, game_time;

        console.log("%cCollectedAllState", "color:white; background:red");

        this.init = function(timed) {
            game_time = timed;
        }

        this.create = function() {
            spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            label = game.add.text(
                game.world.centerX,
                game.world.centerY,
                'Your Time: ' + game_time + '\nPress SPACE to restart', {
                    font: '22px Lucida Console',
                    fill: '#fff',
                    align: 'center'
                });
            label.anchor.setTo(0.5, 0.5);
        };

        this.update = function() {
            score = 0;
            if (spacebar.isDown) {
                game.state.start('GameState');
            }
        };

    }


    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

    game.state.add("BootState", BootState);
    game.state.add("PreloadState", PreloadState);
    game.state.add("GameState", GameState);
    game.state.add("CollectedAllState", CollectedAllState);

    game.state.start("BootState");
};
