import eventsCenter from "../scenes/EventsCenter";

export default class GamePlay {
  constructor() {}

  joinQueue(scene, level) {
    scene.socket.emit("joinQueue", { level });
  }

  watchGame(scene) {
    scene.socket.emit("watchGame");
    scene.socket.on("upDateInfo", (data) => {
      scene.playerNumber = 3;
      scene.roomName = data.roomName;
      scene.playerOneScoreText.setText(data.players[0].match_score);
      scene.playerTwoScoreText.setText(data.players[1].match_score);
    });
  }

  /* EVENT LISTENERS */

  addEventListeners(level, width, height, scene) {
    this.listenInitPlayer(scene);
    this.listenInitGame(scene);
    this.listenInitBallMovement(scene);
    this.listenBallMoved(width, height, scene);
    if (level === 3) {
      this.listenAnimMoved(width, height, scene);
    }
    this.listenPlayerMoved(width, height, scene);
    this.listenAddPoint(level, width, height, scene);
    this.listenGameResult(width, height, scene);
    this.listenLeftGame(width, height, scene);
    this.listenRematch(scene);
  }

  listenInitPlayer(scene) {
    scene.socket.on("init", (data) => {
      scene.playerNumber = data.playerNumber;
      scene.roomName = data.gameCode;
    });
  }

  listenInitGame(scene) {
    scene.socket.on("roomComplete", (state) => {
      eventsCenter.emit("ready");
      scene.time.delayedCall(3000, () => {
        this.startGame(scene);
      });
    });
  }

  listenInitBallMovement(scene) {
    scene.socket.on("launchBall", (data) => {
      if (scene.playerNumber === 1) {
        this.launchBall(data, scene);
      }
    });
  }

  listenBallMoved(width, height, scene) {
    scene.socket.on("ballMoved", (data) => {
      if (scene.playerNumber !== 1) {
        scene.ball.x = data.x + scene.ball.body.width / 2 + 2;
        scene.ball.y = data.y + scene.ball.body.height / 2 + 2;
      }
    });
  }

  listenAnimMoved(width, height, scene) {
    scene.socket.on("animMoved", (data) => {
      if (scene.playerNumber !== 1) {
        scene.fox.x = data.x + scene.fox.body.width / 2 + 2;
        scene.fox.y = data.y + scene.fox.body.height / 2 + 2;
      }
    });
  }

  listenPlayerMoved(width, height, scene) {
    scene.socket.on("playerMoved", (data) => {
      const { y, roomName, playerNumber } = data;
      if (playerNumber === 1 && playerNumber !== scene.playerNumber) {
        scene.playerOne.y = y;
      } else if (playerNumber === 2 && playerNumber !== scene.playerNumber) {
        scene.playerTwo.y = y;
      }
    });
  }

  listenAddPoint(level, width, height, scene) {
    scene.socket.on("addPoint", (data) => {
      const { playerNumber, score } = data;
      if (playerNumber === 1) {
        scene.playerOneScore = score;
        scene.playerOneScoreText.setText(scene.playerOneScore);
      } else if (playerNumber === 2) {
        scene.playerTwoScore = score;
        scene.playerTwoScoreText.setText(scene.playerTwoScore);
      }
      scene.ball.x = width / 2;
      scene.ball.y = height / 2;
      scene.playerOne.y = height / 2;
      scene.playerTwo.y = height / 2;
      scene.p1oldposy = scene.playerOne.y;
      scene.p1oldposy = scene.playerTwo.y;
      if (level === 3) {
        scene.fox.x = width / 2 - 20;
        scene.fox.y = height / 2 - 50;
		scene.playerOne.setScale(1);
        scene.playerTwo.setScale(1);
      }

      scene.time.delayedCall(1000, function () {
        scene.activeGame = true;
        if (scene.playerNumber === 1) {
          scene.socket.emit("launchBall", { roomName: scene.roomName });
        }
      });
    });
  }

  listenGameResult(width, height, scene) {
    scene.socket.on("gameResult", (data) => {
      scene.resultText = scene.add
        .text(width / 2, height / 2, "PLAYER " + data.winner + " WINS !", {
          fontSize: "36px",
        })
        .setVisible(true);
      scene.gameEnded = true;
    });
  }

  listenLeftGame(width, height, scene) {
    scene.socket.on("leftGame", (type) => {
      console.log(type);
      if (type === 1) {
        console.log("a player disconnected");
       // scene.scene.start("MenuScene", {socket: scene.socket});
      } else if (type === 2) {
        console.log("a player quit");
      }
      this.activeGame = false;
      this.matchEnded = false;
      eventsCenter.emit("quit");
      scene.scene.start("MenuScene", {socket: scene.socket});
    });
  }

  listenRematch(scene) {
    scene.socket.on("rematch", (type) => {
      console.log("REMATCH");
      scene.scene.restart();
    });
  }

  /* GAMEPLAY FUNCTIONS */

  startGame(scene) {
    console.log("NOW");
    scene.activeGame = true;
    if (scene.playerNumber === 1) {
      scene.socket.emit("launchBall", { roomName: scene.roomName });
    }
  }

  launchBall(data, scene) {
    scene.ball.setVelocityX(data.ball.initialVelocity.x);
    scene.ball.setVelocityY(data.ball.initialVelocity.y);
  }

  checkPoints(level, width, height, scene) {
    if (scene.activeGame) {
      if (scene.ball.body.x < scene.playerOne.body.x) {
        scene.activeGame = false;
        scene.ball.setVelocity(0);
        scene.playerOne.setVelocity(0);
        scene.playerTwo.setVelocity(0);
        if (level === 3) {
          scene.fox.setVelocity(0);
        }
        if (scene.playerNumber === 1) {
          scene.socket.emit("addPoint", {
            roomName: scene.roomName,
            player: 2,
          });
        }
      }
      if (scene.ball.x > scene.playerTwo.body.x) {
        scene.activeGame = false;
        scene.ball.setVelocity(0);
        scene.playerOne.setVelocity(0);
        scene.playerTwo.setVelocity(0);
        if (level === 3) {
          scene.fox.setVelocity(0);
        }
        if (scene.playerNumber === 1) {
          scene.socket.emit("addPoint", {
            roomName: scene.roomName,
            player: 1,
          });
        }
      }
    }
  }

  /* OBJECTS MOVEMENT */

  moveBall(scene) {
    if (scene.playerNumber === 1) {
      scene.socket.emit("moveBall", {
        roomName: scene.roomName,
        x: scene.ball.body.x,
        y: scene.ball.body.y,
      });
    }
  }

  moveAnim(scene) {
    if (scene.activeGame) {
      scene.fox.setVelocity(0);
      const fx = scene.fox.body.x;
      const fy = scene.fox.body.y;
      const bx = scene.ball.body.x;
      const by = scene.ball.body.y;

      const distance = Phaser.Math.Distance.Between(fx, fy, bx, by);
      if (distance > 300) {
        if (Math.random() > 0.5) {
          scene.fox.anims.play("jump_fox", true);
        }
      } else scene.fox.anims.play("run_fox", true);

      const rotation = Phaser.Math.Angle.Between(fx, fy, bx, by);
      scene.fox.setRotation(rotation);
      if (scene.playerNumber === 1) {
        if (
          rotation >= 0 &&
          rotation <= Math.PI / 2 &&
          fx < scene.foxLimitRight
        ) {
          scene.fox.setVelocity(
            scene.foxVelocityRightDown,
            scene.foxVelocityRightDown
          );
        } else if (
          rotation > Math.PI / 2 &&
          rotation <= Math.PI &&
          fx > scene.foxLimitLeft
        )
          scene.fox.setVelocity(
            scene.foxVelocityLeftUP,
            scene.foxVelocityRightDown
          );
        else if (
          rotation < 0 &&
          rotation >= -Math.PI / 2 &&
          fx < scene.foxLimitRight
        )
          scene.fox.setVelocity(
            scene.foxVelocityRightDown,
            scene.foxVelocityLeftUP
          );
        else if (
          rotation < -Math.PI / 2 &&
          rotation > -Math.PI &&
          fx > scene.foxLimitLeft
        )
          scene.fox.setVelocity(
            scene.foxVelocityLeftUP,
            scene.foxVelocityLeftUP
          );
        else scene.fox.setVelocity(0, 0);
        scene.socket.emit("moveAnim", {
          roomName: scene.roomName,
          x: scene.fox.body.x,
          y: scene.fox.body.y,
        });
      }
    }
  }

  checkPlayerMovement(scene) {
    if (scene.playerNumber === 1) {
      if (
        this.playerMoved(scene.playerOne, scene) ||
        scene.p1oldposy != scene.playerOne.y
      ) {
        console.log("moved " + scene.playerNumber);
        scene.socket.emit("playerMovement", {
          y: scene.playerOne.y,
          roomName: scene.roomName,
          playerNumber: scene.playerNumber,
        });
        scene.p1oldposy = scene.playerOne.y;
      }
    } else if (scene.playerNumber === 2) {
      if (
        this.playerMoved(scene.playerTwo, scene) ||
        scene.p2oldposy != scene.playerTwo.y
      ) {
        console.log("moved " + scene.playerNumber);
        scene.socket.emit("playerMovement", {
          y: scene.playerTwo.y,
          roomName: scene.roomName,
          playerNumber: scene.playerNumber,
        });
        scene.p2oldposy = scene.playerTwo.y;
      }
    }
  }

  playerMoved(player, scene) {
    const speed = 500;
    let playerMoved = false;
    player.body.setVelocityY(0);
    if (scene.cursors.up.isDown) {
      player.body.setVelocityY(-speed);
      playerMoved = true;
    } else if (scene.cursors.down.isDown) {
      player.body.setVelocityY(speed);
      playerMoved = true;
    }
    return playerMoved;
  }

  /* GAME OBJECT CREATION */

  createGameObjects(level, settings, images, width, height, scene) {
    this.initBackground(level, width, height, scene);
    this.initBallObject(level, settings, images, width, height, scene);
    this.initPlayerObjects(level, settings, images, width, height, scene);
    if (level === 3) {
      this.initAnimation(images, width, height, scene);
    }
    this.initColliders(level, scene);
    this.initScores(width, height, scene);
    this.initObjectEventListeners(scene);
    this.initUIButtons(width, height, scene);
  }

  initBackground(level, width, height, scene) {
    let color;
    if (level === 1 || level === 2) {
      color = 0xffffff;
    } else {
      color = 0xffb6c1;
    }
    scene.middleLine = scene.add.graphics();
    scene.middleLine.lineStyle(1, color);
    scene.middleLine.moveTo(width / 2, 0);
    scene.middleLine.lineTo(width / 2, height);
    scene.middleLine.stroke();
  }

  initBallObject(level, settings, images, width, height, scene) {
    scene.ball = scene.physics.add.sprite(width / 2, height / 2, images.ball);

    if (level === 2) {
      switch (settings.ball) {
        case "WHITE":
          break;
        case "BLUE":
          scene.ball.tint = 0x0080ff;
          break;
        case "GREEN":
          scene.ball.tint = 0x008000;
          break;
        case "ORANGE":
          scene.ball.tint = 0xffa500;
          break;
        case "YELLOW":
          scene.ball.tint = 0xffff00;
      }
    }
    scene.ball.setCollideWorldBounds(true);
    scene.ball.setBounce(1, 1);
    scene.ball.scaleY = scene.ball.scaleX;
  }

  initPlayerObjects(level, settings, images, width, height, scene) {
    scene.playerOne = scene.physics.add.sprite(
      scene.ball.body.width / 2 + 1,
      height / 2,
      images.playerOne
    );
    scene.playerTwo = scene.physics.add.sprite(
      width - (scene.ball.body.width / 2 + 1),
      height / 2,
      images.playerTwo
    );

    scene.playerOne.setCollideWorldBounds(true);
    scene.playerOne.setImmovable(true);
    scene.playerOne.setInteractive();
    if (level === 1 || level === 2) {
      scene.playerOne.displayWidth = 10;
    } else if (level === 3) {
      scene.playerOne.displayWidth = 20;
	  scene.playerOne.setScale(1);
    }
    scene.playerOne.scaleY = scene.playerOne.scaleX;
    scene.p1oldposy = scene.playerOne.y;

    scene.playerTwo.setCollideWorldBounds(true);
    scene.playerTwo.setImmovable(true);
    scene.playerTwo.setInteractive();
    if (level === 1 || level === 2) {
      scene.playerTwo.displayWidth = 10;
    } else if (level === 3) {
      scene.playerTwo.displayWidth = 20;
	  scene.playerTwo.setScale(1);
    }
    scene.playerTwo.scaleY = scene.playerTwo.scaleX;
    scene.p2oldposy = scene.playerTwo.y;

    if (level === 2) {
      switch (settings.playerOne) {
        case "WHITE":
          break;
        case "BLUE":
          scene.playerOne.tint = 0x0080ff;
          break;
        case "GREEN":
          scene.playerOne.tint = 0x008000;
          break;
        case "ORANGE":
          scene.playerOne.tint = 0xffa500;
          break;
        case "YELLOW":
          scene.playerOne.tint = 0xffff00;
      }
      switch (settings.playerTwo) {
        case "WHITE":
          break;
        case "BLUE":
          scene.playerTwo.tint = 0x0080ff;
          break;
        case "GREEN":
          scene.playerTwo.tint = 0x008000;
          break;
        case "ORANGE":
          scene.playerTwo.tint = 0xffa500;
          break;
        case "YELLOW":
          scene.playerTwo.tint = 0xffff00;
      }
    }
  }

  initAnimation(images, width, height, scene) {
    scene.fox = scene.physics.add
      .sprite(
        scene.physics.world.bounds.width / 2 - 20,
        scene.physics.world.bounds.height / 2 - 50,
        images.fox.wait
      )
      .setScale(3)
      .refreshBody();

    scene.anims.create({
      key: "idle_fox",
      frames: scene.anims.generateFrameNumbers(images.fox.wait, {
        start: 0,
        end: 4,
      }),
      frameRate: 5,
      repeat: -1,
    });
    scene.anims.create({
      key: "run_fox",
      frames: scene.anims.generateFrameNumbers(images.fox.run, {
        start: 0,
        end: 4,
      }),
      frameRate: 8,
      repeat: -1,
    });
    scene.anims.create({
      key: "jump_fox",
      frames: scene.anims.generateFrameNumbers(images.fox.jump, {
        start: 0,
        end: 4,
      }),
      frameRate: 11,
      repeat: -1,
    });

    scene.fox.anims.play("run_fox");
    scene.fox.setCollideWorldBounds(true);
    scene.fox.setImmovable(true);
  }

  initColliders(level, scene) {
    scene.physics.add.collider(scene.ball, scene.playerOne);
    scene.physics.add.collider(scene.ball, scene.playerTwo);
    if (level === 3) {
      scene.physics.add.collider(scene.ball, scene.fox, () => {
        if (scene.ball.body.velocity.x < 0) {
          if (scene.ball.body.velocity.x > -350) {
            scene.ball.body.velocity.x = -350;
          }
        } else {
          if (scene.ball.body.velocity.x < 350) {
            scene.ball.body.velocity.x = 350;
          }
        }
        if (scene.ball.body.velocity.y < 0) {
          if (scene.ball.body.velocity.y > -100) {
            scene.ball.body.velocity.y = -100;
          }
        } else {
          if (scene.ball.body.velocity.y < 100) {
            scene.ball.body.velocity.y = 100;
          }
        }

        if (scene.activeGame) {
          scene.playerOne.setScale(0.5);
          scene.playerTwo.setScale(0.5);
          scene.time.delayedCall(3000, function () {
            scene.playerOne.setScale(1);
            scene.playerTwo.setScale(1);
          });
        }
      });
    }
  }

  initScores(width, heigth, scene) {
    // Init score player 1
    scene.playerOneScore = 0;
    scene.playerOneScoreText = scene.add
      .text(200, 50, scene.playerOneScore, { fontSize: "48px" })
      .setVisible(true)
      .setOrigin(0.5);
    scene.playerOneScoreText.scaleY = scene.playerOneScoreText.scaleX;

    // Init score player 2
    scene.playerTwoScore = 0;
    scene.playerTwoScoreText = scene.add
      .text(width - 200, 50, scene.playerTwoScore, { fontSize: "48px" })
      .setVisible(true)
      .setOrigin(0.5);
    scene.playerTwoScoreText.scaleY = scene.playerTwoScoreText.scaleX;
  }

  initObjectEventListeners(scene) {
    // Init KEY EVENT listeners
    scene.cursors = scene.input.keyboard.createCursorKeys();

    // Init CLICK EVENT listeners
    scene.playerOne.on("pointerdown", scene.startDragPlayerOne, scene);
    scene.playerTwo.on("pointerdown", scene.startDragPlayerTwo, scene);
  }

  initUIButtons(width, height, scene) {
    scene.quitButton = scene.add.text(width / 2 - 60, height - 40, "QUIT", {
      fill: "#ffffff",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.quitButton.setInteractive();
    scene.quitButton.on("pointerdown", () => {
      console.log("quit button clicked");
      scene.socket.emit("quitGame");
    });

    scene.rematchButton = scene.add.text(
      width / 2 + 15,
      height - 40,
      "REMATCH",
      {
        fill: "#ffffff",
        fontSize: "20px",
        fontStyle: "bold",
      }
    );
    scene.rematchButton.setInteractive();
    scene.rematchButton.on("pointerdown", () => {
      if (scene.playerNumber === 3) return;
      if (scene.gameEnded) {
        scene.socket.emit("rematch", { roomName: scene.roomName });
      } else {
        console.log("YOU NEED TO FINISH THE GAME BEFORE A REMATCH");
      }
    });
  }
}
