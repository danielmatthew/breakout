var main = {

  lives: 3,
  score: 0,

  ballOnPaddle: true,

  scoreText: "",
  livesText: "",
  introText: "",

  preload: function() {
    // Loads in paddle image
    game.load.audio('popcorn', 'assets/popcorn.mp3');

    game.load.image('paddle', 'assets/chomp.png');
    game.load.image('brick', 'assets/choc-big.png');
    game.load.image('ball', 'assets/egg.png');

    game.load.image('gameover', 'assets/game-over.png');
  },

  create: function() {
    game.stage.backgroundColor = '#56008C';
    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.cursor = game.input.keyboard.createCursorKeys();
    this.paddle = game.add.sprite(game.width/2, 410, 'paddle');
    this.paddle.anchor.setTo(0.5, 0.5);
    game.physics.arcade.enable(this.paddle);
    this.paddle.body.immovable = true;

    game.physics.arcade.checkCollision.down = false;
    this.paddle.body.collideWorldBounds = true;

    // Creates group to hold all bricks
    this.bricks = game.add.group();
    this.bricks.enableBody = true;

    // Creates 25 bricks
    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < 4; j++) {
        // game.add.sprite(55 + i * 60, 55 + j * 35, 'brick', 0, this.bricks);
        game.add.sprite(-5 + i * 80 , 0 + j * 65, 'brick', 0, this.bricks);
      }
    }

    // Make sure bricks don't move!
    this.bricks.setAll('body.immovable', true);

    // Create ball
    this.ball = game.add.sprite(game.world.centerX, this.paddle.y - 50, 'ball');
    game.physics.arcade.enable(this.ball);

    // Add velocity to ball
    // this.ball.body.velocity.x = 50;
    // this.ball.body.velocity.y = 200;

    // Make the ball bouncy
    this.ball.checkWorldBounds = true;
    this.ball.body.collideWorldBounds = true
    this.ball.body.bounce.x = 1;
    this.ball.body.bounce.y = 1;

    this.ball.body.allowGravity = true;
    this.ball.body.allowRotation = true;
    this.ball.body.rotation = 360;
    this.ball.anchor.setTo(0.5, 0.5);

    this.ball.events.onOutOfBounds.add(this.ballLost, this)

    // this.gameover = false;

    this.scoreText = game.add.text(20, 400, "Score: 0", {
      "font": "20px Arial",
      "fill": "#ffffff",
      "align": "left"
    });

    this.livesText = game.add.text(700, 400, "Lives: 3", {
      "font": "20px Arial",
      "fill": "#ffffff",
      "align": "left"
    });

    this.introText = game.add.text(game.world.centerX, 200, " - Tap to start -", {
      "font": "40px Arial",
      "fill": "#ffffff",
      "align": "center"
    });

    this.introText.anchor.setTo(0.5, 0.5);

    game.input.onDown.add(this.releaseBall, this);

    // this.releaseButton = this.game.add.button(this.game.width/2, 200, 'gameover', this.releaseBall, this);
    // this.releaseButton.anchor.setTo(0.5,0.5);
  },

  update: function() {
    this.paddle.body.x = game.input.x;

    if (this.paddle.x < 50) {
      this.paddle.x = 50;
    } else if (this.paddle.x > game.width - 50) {
      this.paddle.x = game.width - 50;
    }

    if (this.ballOnPaddle) {
      this.ball.body.x = this.paddle.x;
    } else {
      game.physics.arcade.collide(this.paddle, this.ball, this.ballHitPaddle, null, this);
      game.physics.arcade.collide(this.ball, this.bricks, this.hit, null, this);
    }
    // if (this.cursor.right.isDown) {
    //   this.paddle.body.velocity.x = 500;
    // } else if (this.cursor.left.isDown) {
    //   this.paddle.body.velocity.x = -500;
    // } else {
    //   this.paddle.body.velocity.x = 0;
    // }

    this.ball.angle += 10;
  },

  releaseBall: function() {
    if (this.ballOnPaddle) {
      this.ballOnPaddle = false;
      this.ball.body.velocity.y = -300;
      this.ball.body.velocity.x = -75;
      this.introText.visible = false;
    }
  },

  hit: function(ball, brick) {
    brick.kill();
    this.score += 10;
    this.scoreText.text = "Score: " + this.score;
    // console.log(this.bricks.countLiving());
    if (this.bricks.countLiving() == 0) {
      this.score += 1000;
      this.scoreText.text = "Score: " + this.score;
      this.introText.text = "- Next Level - ";
      this.ballOnPaddle = true;
      this.ball.body.velocity.set(0);
      this.ball.x = this.paddle.x + 25;
      this.ball.y = this.paddle.y - 50;
      this.ball.animations.stop();

      this.bricks.callAll('revive') 
    }
  },

  ballLost: function() {

    // this.score - 50;
    // this.scoreText.text = "Score: " + this.score;
    this.lives--;
    this.livesText.text = "Lives: " + this.lives;

    if (this.lives === 0) {
      this.gameOver();
    } else {
      this.ballOnPaddle = true;
      this.ball.reset(this.paddle.x + 25, this.paddle.y - 50);
      this.ball.animations.stop();
    }
  },

  gameOver: function() {
    this.ball.body.velocity.setTo(0, 0);

    // this.gameoverBtn = this.game.add.button(this.game.width/2, 300, 'gameover', this.restartClick, this);
    // this.gameoverBtn.anchor.setTo(0.5, 0.5); 
    this.introText.text = "Game over!";
    this.introText.visible = true;
  },

  restartClick: function() {
    this.gameoverBtn.visible = false;
    this.ballOnPaddle = true;

    this.ball.body.velocity.set(0);
    this.ball.x = this.paddle.x + 25;
    this.ball.y = this.paddle.y - 50;
    this.ball.animations.stop();

    this.bricks.callAll('revive'); 
  },

  ballHitPaddle: function(ball, paddle) {
    var diff = 0;
    if (ball.x < paddle.x) {
      diff = paddle.x - ball.x;
      ball.body.velocity.x = (-10 * diff);
    } else if (ball.x > paddle.x) {
      diff = ball.x - paddle.x;
      ball.body.velocity.x = (10 * diff);
    } else {
      ball.body.velocity.x = 2 + Math.random() * 8;
    }
  }
};

var game = new Phaser.Game(800, 450, Phaser.AUTO, 'gameDiv');
game.state.add('main', main);
game.state.start('main');