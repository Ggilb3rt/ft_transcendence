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
  quit: Boolean,
});

let gameInstance = null;
const containerId = "game-container";

onUpdated(() => {
  if (props.startGame) {
    gameInstance = launch(containerId);
    console.log("launching");
    }
    if (props.gameActive === false || props.startGame === false) {
        console.log("1 " + gameInstance);
        gameInstance = null;
        console.log("2 " + gameInstance);
    }
  //gameInstance.destroy(true, true);
});

onUnmounted(() => {
  gameInstance.destroy(true, false);
  console.log("DESTROY");
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
let activeGame = false;

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

  props.socket.on("move2", ({ playerNumber, x, y }) => {
    console.log("move");
    if (playerNumber === 2) {
      playerTwo.x = x;
      playerTwo.y = y;
    } else if (playerNumber === 1) {
      playerOne.x = x;
      playerOne.y = y;
    }
  });

  props.socket.on("ballMovement2", ({ x, y }) => {
    ball.x = x + ball.body.width / 2 + 2;
    ball.y = y + ball.body.height / 2 + 2;
  });

  props.socket.on("gameResult", ({ winner }) => {
    if (winner === 1) {
      playerOneVictoryText.setVisible(true);
    } else {
      playerTwoVictoryText.setVisible(true);
    }
  });

  props.socket.on("reMatch", () => {
    console.log("REMATCH");
    playerOneVictoryText.setVisible(false);
    playerTwoVictoryText.setVisible(false);
    // DESTROY OR DISABLE ?
    ball.destroy();
    playerOne.destroy();
    playerTwo.destroy();
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

    playerOneVictoryText.setVisible(false);
    playerTwoVictoryText.setVisible(false);
    isGameStarted = false;
  });
}

function update() {
  if (
    props.startGame &&
    !isGameStarted &&
    !activeGame &&
    props.playerNumber === 1
  ) {
    //const InitialVelocityX = Math.random() * 150 + 200;
    //const InitialVelocityY = Math.random() * 150 + 200;
    const InitialVelocityX = 300;
    const InitialVelocityY = 300;
    ball.setVelocityX(-InitialVelocityX);
    ball.setVelocityY(-InitialVelocityY);
    isGameStarted = true;
    activeGame = true;
  }

  if (ball.body.x < playerOne.body.x) {
    ball.setImmovable(true);
    props.socket.emit("gameResult", { gameCode: props.gameCode, winner: 2 });
    //playerTwoVictoryText.setVisible(true);
    ball.setVelocityX(0);
    ball.setVelocityY(0);
    activeGame = false;
  }
  if (ball.body.x > playerTwo.body.x) {
    ball.setImmovable(true);
    //playerOneVictoryText.setVisible(true);
    props.socket.emit("gameResult", { gameCode: props.gameCode, winner: 1 });
    ball.setVelocityX(0);
    ball.setVelocityY(0);
    activeGame = false;
  }

  if (props.playerNumber === 1 && activeGame) {
    props.socket.emit("ballMovement", {
      gameCode: props.gameCode,
      x: ball.body.x,
      y: ball.body.y,
    });
  }

  if (props.playerNumber === 1 && activeGame) {
    if (movePlayer(cursors, playerOne)) {
      props.socket.emit("move", {
        //gameCode: props.gameCode,
        playerNumber: props.playerNumber,
        x: playerOne.x,
        y: playerOne.y,
      });
    }
  }

  if (props.playerNumber === 2) {
    if (movePlayer(cursors, playerTwo)) {
      props.socket.emit("move", {
        //gameCode: props.gameCode,
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
  <p>Player number : {{ props.playerNumber }}</p>
  <p>Start Game : {{ this.startGame }}</p>
  <p>Game Active : {{ this.gameActive }}</p>
  <p>Game Code : {{ this.gameCode }}</p>
  <!-- <Suspense> -->
  <div v-if="props.startGame" :id="containerId" />

  <!-- <template #fallback>
      <div class="placeholder">Downloading...</div>
    </template>
  </Suspense>-->
</template>

<style></style>
