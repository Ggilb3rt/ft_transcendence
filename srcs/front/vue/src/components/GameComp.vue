<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import Phaser from "phaser";
import ballImage from "@/assets/game/ball.png";
import paddleImage from "@/assets/game/paddle.png";

const props = defineProps({
  socket: Object,
  playerNumber: Number,
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

  props.socket.on("move", ({ playerNumber, x, y }) => {
    if (playerNumber === 2) {
      playerTwo.x = x;
      playerTwo.y = y;
    } else if (playerNumber === 1) {
      playerOne.x = x;
      playerOne.y = y;
    }
  });

  props.socket.on('moveBall', ({x, y, vx, vy})=> {
    console.log("new ball pos");
    //ball.body.x = x + vx;
    //ball.body.y = y + vy;
    //ball.setVelocityX(vx);
    //ball.setVelocityY(vy);
  })

}

function randomNumberBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function update() {
    let initialVelocityX;
    let initialVelocityY;
  if (!isGameStarted) {
  /*  let initialVelocityX;
    let initialVelocityY;
    while (
      Math.abs(initialVelocityX) <= 0.4 ||
      Math.abs(initialVelocityX) >= 0.9
    ) {
      const heading = randomNumberBetween(0, 2 * Math.PI);
      initialVelocityX = Math.cos(heading);
      initialVelocityY = Math.sin(heading);
    }*/
     initialVelocityX = Math.random() * 150 + 200;
     initialVelocityY = Math.random() * 150 + 200;
    ball.setVelocityX(-initialVelocityX);
    ball.setVelocityY(-initialVelocityY);
    isGameStarted = true;
  }

  //if (props.playerNumber === 2) {
    props.socket.emit('moveBall', {gameCode: props.gameCode, x: ball.body.x, y: ball.body.y, vx: initialVelocityX, vy: initialVelocityY})
  //}

  
 
/*  if (ball.body.x < playerOne.body.x) {
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

  //props.socket.emit("ballMovement", {x: ball.x, y: ball.y});

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
