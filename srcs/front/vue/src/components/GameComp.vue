<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import Phaser from "phaser";
import ballImage from "@/assets/game/ball.png";
import paddleImage from "@/assets/game/paddle.png";

const props = defineProps({
  socket: Object,
  playerNumber: Number,
  startGame: Boolean,
  gameCode: String,
  score: {
    playerOne: String,
    playerTwo: String,
  },
});

let gameInstance = null;
const containerId = "game-container";

onMounted(() => {
  gameInstance = launch(containerId);
});

onUnmounted(() => {
  gameInstance.destroy(false);
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
//let player;
//let opponent;
let isGameStarted = false;
let cursors;
//let keys = {};
//let playerOneVictoryText;
//let playerTwoVictoryText;
let resultText;
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
  /*  playerOne = this.physics.add.sprite(
    this.physics.world.bounds.width - (ball.body.width / 2 + 1),
    this.physics.world.bounds.height / 2,
    "paddle"
  );
  playerOne.setCollideWorldBounds(true);
  playerOne.setImmovable(true);

  cursors = this.input.keyboard.createCursorKeys();
  keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

  playerTwo = this.physics.add.sprite(
    ball.body.width / 2 + 1,
    this.physics.world.bounds.height / 2,
    "paddle"
  );
  playerTwo.setCollideWorldBounds(true);
  playerTwo.setImmovable(true);

  this.physics.add.collider(ball, playerOne);
  this.physics.add.collider(ball, playerTwo);

  playerOneVictoryText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    "Player wins !"
  );
  playerOneVictoryText.setVisible(false);
  playerOneVictoryText.setOrigin(0.5);

  playerTwoVictoryText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    "Player 2 wins !"
  );
  playerTwoVictoryText.setVisible(false);
  playerTwoVictoryText.setOrigin(0.5);*/

  props.socket.on("move", ({ playerNumber, x, y }) => {
    console.log("player number = " + playerNumber);
    if (playerNumber === 2) {
      playerTwo.x = x;
      playerTwo.y = y;
    } else if (playerNumber === 1) {
      playerOne.x = x;
      playerOne.y = y;
    }
  });
}

function update() {
  if (!isGameStarted) {
    const initialVelocityX = Math.random() * 150 + 100;
    const initialVelocityY = Math.random() * 150 + 100;
    ball.setVelocityX(initialVelocityX);
    ball.setVelocityY(initialVelocityY);
    isGameStarted = true;
  }

  /*  if (ball.body.x > playerOne.body.x) {
    playerTwoVictoryText.setVisible(true);
    ball.setVelocityX(0);
    ball.setVelocityY(0);
  }
  if (ball.body.x < playerTwo.body.x) {
    playerOneVictoryText.setVisible(true);
    ball.setVelocityX(0);
    ball.setVelocityY(0);
  }

  playerOne.body.setVelocityY(0);
  if (cursors.up.isDown) {
    props.socket.emit();
    playerOne.body.setVelocityY(-paddleSpeed);
  } else if (cursors.down.isDown) {
    playerOne.body.setVelocityY(paddleSpeed);
  }
  playerTwo.body.setVelocityY(0);
  if (keys.w.isDown) {
    playerTwo.body.setVelocityY(-paddleSpeed);
  } else if (keys.s.isDown) {
    playerTwo.body.setVelocityY(paddleSpeed);
  }*/

  /* player.body.setVelocityY(0);
  if (cursors.up.isDown) {
    player.body.setVelocityY(-paddleSpeed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(paddleSpeed);
  }*/

  if (props.playerNumber === 1) {
    if (movePlayer(cursors, playerOne)) {
      props.socket.emit("move", {
        playerNumber: props.playerNumber,
        x: playerOne.x,
        y: playerOne.y,
      });
    }
  } 
  if (props.playerNumber === 2) {
    if (movePlayer(cursors, playerTwo)) {
      props.socket.emit("move", {
        playerNumber: props.playerNumber,
        x: playerTwo.x,
        y: playerTwo.y,
      });
    }
  }
  /*  if (movePlayer(cursors, playerTwo)) {
    props.socket.emit("move", {
      playerNumber: props.playerNumber,
      x: playerTwo.x,
      y: playerTwo.y,
    });
  }*/

  if (ball.body.velocity.y > paddleSpeed) {
    ball.body.velocity.y = paddleSpeed;
  } else if (ball.body.velocity.y < -paddleSpeed) {
    ball.body.velocity.y = -paddleSpeed;
  }
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

//function movePlayer() {}
</script>

<template>
  <h1>{{ props.playerNumber }}</h1>
  <Suspense>
    <div :id="containerId" />

    <template #fallback>
      <div class="placeholder">Downloading...</div>
    </template>
  </Suspense>
</template>

<style></style>
