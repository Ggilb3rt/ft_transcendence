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
let isGameStarted = false;
let cursors;
let keys = {};
let playerOneVictoryText;
let playerTwoVictoryText;
const paddleSpeed = 350;

function preload() {
  this.load.image("ball", ballImage);
  this.load.image("paddle", paddleImage);
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
}

function update() {
  if (!isGameStarted) {
    const initialVelocityX = Math.random() * 150 + 100;
    const initialVelocityY = Math.random() * 150 + 100;
    ball.setVelocityX(initialVelocityX);
    ball.setVelocityY(initialVelocityY);
    isGameStarted = true;
  }

  if (ball.body.x > playerOne.body.x) {
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
    playerOne.body.setVelocityY(-paddleSpeed);
  } else if (cursors.down.isDown) {
    playerOne.body.setVelocityY(paddleSpeed);
  }
  playerTwo.body.setVelocityY(0);
  if (keys.w.isDown) {
    playerTwo.body.setVelocityY(-paddleSpeed);
  } else if (keys.s.isDown) {
    playerTwo.body.setVelocityY(paddleSpeed);
  }
  if (ball.body.velocity.y > paddleSpeed) {
    ball.body.velocity.y = paddleSpeed;
  } else if (ball.body.velocity.y < -paddleSpeed) {
    ball.body.velocity.y = -paddleSpeed;
  }
}
</script>

<template>
  <Suspense>
    <div :id="containerId" />

    <template #fallback>
      <div class="placeholder">Downloading...</div>
    </template>
  </Suspense>
</template>

<style></style>
