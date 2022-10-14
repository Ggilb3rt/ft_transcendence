<script setup>
import { onMounted, onUnmounted, onUpdated, ref } from "vue";
import Phaser from "phaser";
import ballImage from "@/assets/game/ball.png";
import paddleImage from "@/assets/game/paddle.png";

const props = defineProps({
  socket: Object,
  playerNumber: Number,
  gameActive: Boolean,
  startGame: Boolean,
  gameCode: String,
  score: {
    playerOne: String,
    playerTwo: String,
  },
});

let gameInstance = null;
const containerId = "game-container";

onUpdated(() => {
  if (props.startGame) {
    gameInstance = launch(containerId);
  }
});

onUnmounted(() => {
  gameInstance.destroy(true, false);
});

function launch(containerId) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 640,
    parent: containerId,
    scale: {
      // mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: false,
        debug: false,
      },
    },
    scene: {
      preload,
      create,
      update,
    },
  });
}

let ball;
let playerOne;
let playerTwo;
let isGameStarted = false;
let cursors;
let playerOneVictoryText;
let playerTwoVictoryText;
const paddleSpeed = 350;

function preload() {
  this.load.image("ball", ballImage);
  this.load.image("paddle", paddleImage);
  this.load.image("opponentPaddle", paddleImage);
}

function create() {
  ball = this.physics.add.sprite(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    "ball"
  );
  ball.setCollideWorldBounds(true);
  ball.setBounce(1, 1);

  playerOne = this.physics.add.sprite(
    ball.body.width / 2 + 1,
    this.physics.world.bounds.height / 2,
    "paddle"
  );
  playerOne.setCollideWorldBounds(true);
  playerOne.setImmovable(true);

  playerTwo = this.physics.add.sprite(
    this.physics.world.bounds.width - (ball.body.width / 2 + 1),
    this.physics.world.bounds.height / 2,
    "opponentPaddle"
  );
  playerTwo.setCollideWorldBounds(true);
  playerTwo.setImmovable(true);

  cursors = this.input.keyboard.createCursorKeys();

  this.physics.add.collider(ball, playerOne);
  this.physics.add.collider(ball, playerTwo);

  /*  let n = 0;
  this.physics.add.collider(ball, playerOne, function () {
    if (n === 0) {
      console.log("collision");
      n++;
    }
    props.socket.emit("collision", {
      gameCode: props.gameCode,
      x: ball.x,
      y: ball.y,
      vx: ball.body.velocity.x,
      vy: ball.body.velocity.y,
    });
  });*/

  playerOneVictoryText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    "Player 1 wins !"
  );
  playerOneVictoryText.setVisible(false);
  playerOneVictoryText.setOrigin(0.5);

  playerTwoVictoryText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    "Player 2 wins !"
  );
  playerTwoVictoryText.setVisible(false);
  playerTwoVictoryText.setOrigin(0.5);

  props.socket.on("move2", ({ playerNumber, x, y }) => {
    if (playerNumber === 2) {
      playerTwo.x = x;
      playerTwo.y = y;
    } else if (playerNumber === 1) {
      playerOne.x = x;
      playerOne.y = y;
    }
  });

  props.socket.on("moveBall2", ({ vx, vy }) => {
    ball.setVelocityX(-vx);
    ball.setVelocityY(-vy);
  });

  props.socket.on("ballMovement", ({ x, y }) => {
    ball.body.x = x;
    ball.body.y = y;
  });

  props.socket.on("reMatch", () => {
    console.log("REMATCH");
    ball.destroy();
    playerOne.destroy();
    playerTwo.destroy();
    ball = this.physics.add.sprite(
      this.physics.world.bounds.width / 2,
      this.physics.world.bounds.height / 2,
      "ball"
    );
    ball.setCollideWorldBounds(true);
    ball.setBounce(0.5, 0.5);

    playerOne = this.physics.add.sprite(
      ball.body.width / 2 + 1,
      this.physics.world.bounds.height / 2,
      "paddle"
    );
    playerOne.setCollideWorldBounds(true);
    playerOne.setImmovable(true);

    playerTwo = this.physics.add.sprite(
      this.physics.world.bounds.width - (ball.body.width / 2 + 1),
      this.physics.world.bounds.height / 2,
      "opponentPaddle"
    );
    playerTwo.setCollideWorldBounds(true);
    playerTwo.setImmovable(true);

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(ball, playerOne);
    this.physics.add.collider(ball, playerTwo);
    isGameStarted = false;
  });

  /*  props.socket.on("collisionResult", ({ x, y, vx, vy }) => {
    console.log("collision received");
    ball.x = x;
    ball.y = y;
    ball.body.velocity.x = vx;
    ball.body.velocity.y = vy;
    ball.body.bounce.set(1);
    ball.body.boynce.set(1);
  });*/
}

function update() {
  if (!isGameStarted) {
    props.socket.emit("moveBall", { gameCode: props.gameCode });
    isGameStarted = true;
  }

 /* if (ball.body.x < playerOne.body.x) {
    ball.setImmovable(true);
    playerTwoVictoryText.setVisible(true);
    ball.setVelocityX(0);
    ball.setVelocityY(0);
  }
  if (ball.body.x > playerTwo.body.x) {
    ball.setImmovable(true);
    playerOneVictoryText.setVisible(true);
    ball.setVelocityX(0);
    ball.setVelocityY(0);
  }*/

  props.socket.emit("ballMovement", {
    gameCode: props.gameCode,
    x: ball.body.x,
    y: ball.body.y,
  });

  if (props.playerNumber === 1) {
    if (movePlayer(cursors, playerOne)) {
      props.socket.emit("move", {
        gameCode: this.gameCode,
        playerNumber: props.playerNumber,
        x: playerOne.x,
        y: playerOne.y,
      });
    }
  }

  if (props.playerNumber === 2) {
    if (movePlayer(cursors, playerTwo)) {
      props.socket.emit("move", {
        gameCode: this.gameCode,
        playerNumber: props.playerNumber,
        x: playerTwo.x,
        y: playerTwo.y,
      });
    }
  }

  /*if (ball.body.velocity.y > paddleSpeed) {
    ball.body.velocity.y = paddleSpeed;
  } else if (ball.body.velocity.y < -paddleSpeed) {
    ball.body.velocity.y = -paddleSpeed;
  }*/
}

function movePlayer(cursors, player) {
  let playerMoved = false;
  player.body.setVelocityY(0);
  if (cursors.up.isDown) {
    player.body.setVelocityY(-paddleSpeed);
    playerMoved = true;
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(paddleSpeed);
    playerMoved = true;
  }
  return playerMoved;
}


</script>

<template>
  <h1>Player number : {{ props.playerNumber }}</h1>
  <h1>Start Game : {{ this.startGame }}</h1>
  <h1>Game Active : {{ this.gameActive }}</h1>
  <h1>Game Code : {{ this.gameCode }}</h1>
  <!-- <Suspense> -->
  <div :id="containerId" />

  <!-- <template #fallback>
      <div class="placeholder">Downloading...</div>
    </template>
  </Suspense>-->
</template>

<style></style>
