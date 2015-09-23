window.onload = function() {
    debugger;
    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create });
    function preload () {
        game.load.image('star', 'assets/star.png');
    }
    function create () {
        var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
        logo.anchor.setTo(0.5, 0.5);
    }
};

