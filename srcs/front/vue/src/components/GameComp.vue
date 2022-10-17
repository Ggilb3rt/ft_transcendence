<script setup="ts">
import { onMounted, onUnmounted, onUpdated, ref } from "vue";
import Phaser from "phaser";
import ballImage from "@/assets/game/ball.png";
import paddleImage from "@/assets/game/paddle.png";

const props = defineProps({
  socket: Object,
  playerNumber: Number,
  startGame: Boolean, // true quand deux players, false quand quit
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
  if (props.startGame === false) {
    if (gameInstance) {
      console.log("DESTROY");
      gameInstance.destroy(true, false);
      gameInstance = null;
    }
  }
});

onUnmounted(() => {
  if (gameInstance) {
    gameInstance.destroy(true, true);
    gameInstance = null;
    console.log("DESTROY UNMOUNTED");
  }
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

const gameState = {
  ball: {},
  playerOne: {},
  playerTwo: {},
  score = {
    playerOne: 0,
    playerTwo: 0,
  },
  isGameStarted: false, // Pour premier launch
  cursors: {},
  playerOneVictoryText: {},
  playerTwoVictoryText: {},
  paddleSpeed: 350,
  activeGame: false, // Pour quand un joueur marque un point
};

function preload() {
  this.load.image("ball", ballImage);
  this.load.image("paddle", paddleImage);
  this.load.image("opponentPaddle", paddleImage);
}

function destroyGameObjects(game) {
  gameState.playerOneVictoryText.destroy();
  gameState.playerTwoVictoryText.destroy();
  gameState.ball.destroy();
  gameState.playerOne.destroy();
  gameState.playerTwo.destroy();
}

function handleRematch(game) {
  props.socket.on("reMatch", () => {
    console.log("rematch handler");
    destroyGameObjects(game);
    createGameObjects(game);
    gameState.isGameStarted = false;
  });
}

function handleQuit(game) {
  if (props.quit) {
    gameState.isGameStarted = false;
  }
}

function create() {
  createGameObjects(this);
  /* Event Listeners */
  handleMovePlayer();
  handleMoveBall();
  //handleGameScore()
  handleGameResult();
  //handleRematch(this);
  handleQuit();
}

function update() {
  if (
    props.startGame &&
    !gameState.isGameStarted &&
    !gameState.activeGame &&
    props.playerNumber === 1
  ) {
    console.log("launching ball");

    //const InitialVelocityX = Math.random() * 150 + 200;
    //const InitialVelocityY = Math.random() * 150 + 200;
    const InitialVelocityX = 300;
    const InitialVelocityY = 300;
    gameState.ball.setVelocityX(-InitialVelocityX);
    gameState.ball.setVelocityY(-InitialVelocityY);
    gameState.isGameStarted = true;
    gameState.activeGame = true;
  }

  checkPoints();
  moveBall();
  movePlayers();
}

function createGameObjects(game) {
  gameState.ball = game.physics.add.sprite(
    game.physics.world.bounds.width / 2,
    game.physics.world.bounds.height / 2,
    "ball"
  );
  gameState.ball.setCollideWorldBounds(true);
  gameState.ball.setBounce(1, 1);

  gameState.playerOne = game.physics.add.sprite(
    gameState.ball.body.width / 2 + 1,
    game.physics.world.bounds.height / 2,
    "paddle"
  );
  gameState.playerOne.setCollideWorldBounds(true);
  gameState.playerOne.setImmovable(true);

  gameState.playerTwo = game.physics.add.sprite(
    game.physics.world.bounds.width - (gameState.ball.body.width / 2 + 1),
    game.physics.world.bounds.height / 2,
    "opponentPaddle"
  );
  gameState.playerTwo.setCollideWorldBounds(true);
  gameState.playerTwo.setImmovable(true);

  gameState.cursors = game.input.keyboard.createCursorKeys();

  game.physics.add.collider(gameState.ball, gameState.playerOne);
  game.physics.add.collider(gameState.ball, gameState.playerTwo);

  gameState.playerOneVictoryText = game.add.text(
    game.physics.world.bounds.width / 2,
    game.physics.world.bounds.height / 2,
    "Player 1 wins !"
  );
  gameState.playerOneVictoryText.setVisible(false);
  gameState.playerOneVictoryText.setOrigin(0.5);

  gameState.playerTwoVictoryText = game.add.text(
    game.physics.world.bounds.width / 2,
    game.physics.world.bounds.height / 2,
    "Player 2 wins !"
  );
  gameState.playerTwoVictoryText.setVisible(false);
  gameState.playerTwoVictoryText.setOrigin(0.5);
}

function playerMoved(cursors, player) {
  let playerMoved = false;
  player.body.setVelocityY(0);
  if (cursors.up.isDown) {
    player.body.setVelocityY(-gameState.paddleSpeed);
    playerMoved = true;
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(gameState.paddleSpeed);
    playerMoved = true;
  }
  return playerMoved;
}

function checkPoints() {
  if (gameState.ball.body.x < gameState.playerOne.body.x) {
    gameState.playerOne.body.setVelocityY(0);
    gameState.playerTwo.body.setVelocityY(0);
    gameState.ball.setImmovable(true);
    props.socket.emit("gameResult", { gameCode: props.gameCode, winner: 2 });
    //playerTwoVictoryText.setVisible(true);
    gameState.ball.setVelocityX(0);
    gameState.ball.setVelocityY(0);
    gameState.activeGame = false;
  }
  if (gameState.ball.body.x > gameState.playerTwo.body.x) {
    //console.log("winner 1");
    gameState.playerOne.body.setVelocityY(0);
    gameState.playerTwo.body.setVelocityY(0);
    gameState.ball.setImmovable(true);
    //playerOneVictoryText.setVisible(true);
    props.socket.emit("gameResult", { gameCode: props.gameCode, winner: 1 });
    gameState.ball.setVelocityX(0);
    gameState.ball.setVelocityY(0);
    gameState.activeGame = false;
  }
}

function moveBall() {
  if (props.playerNumber === 1 && gameState.activeGame) {
    props.socket.emit("moveBall", {
      gameCode: props.gameCode,
      x: gameState.ball.body.x,
      y: gameState.ball.body.y,
    });
  }
}

function movePlayers() {
  if (props.playerNumber === 1 && gameState.activeGame) {
    if (playerMoved(gameState.cursors, gameState.playerOne)) {
      props.socket.emit("movePlayer", {
        //gameCode: props.gameCode,
        playerNumber: props.playerNumber,
        x: gameState.playerOne.x,
        y: gameState.playerOne.y,
      });
    }
  }

  if (props.playerNumber === 2) {
    if (playerMoved(gameState.cursors, gameState.playerTwo)) {
      props.socket.emit("movePlayer", {
        //gameCode: props.gameCode,
        playerNumber: props.playerNumber,
        x: gameState.playerTwo.x,
        y: gameState.playerTwo.y,
      });
    }
  }

  if (gameState.ball.body.velocity.y > gameState.paddleSpeed) {
    gameState.ball.body.velocity.y = gameState.paddleSpeed;
  } else if (gameState.ball.body.velocity.y < -gameState.paddleSpeed) {
    gameState.ball.body.velocity.y = -gameState.paddleSpeed;
  }
}

function handleMovePlayer() {
  props.socket.on("movePlayer", ({ playerNumber, x, y }) => {
    if (playerNumber === 2) {
      gameState.playerTwo.x = x;
      gameState.playerTwo.y = y;
    } else if (playerNumber === 1) {
      gameState.playerOne.x = x;
      gameState.playerOne.y = y;
    }
  });
}

function handleMoveBall() {
  props.socket.on("moveBall", ({ x, y }) => {
    gameState.ball.x = x + gameState.ball.body.width / 2 + 2;
    gameState.ball.y = y + gameState.ball.body.height / 2 + 2;
  });
}

function handleGameResult() {
  props.socket.on("gameResult", ({ winner }) => {
    if (winner === 1) {
      gameState.playerOneVictoryText.setVisible(true);
    } else {
      gameState.playerTwoVictoryText.setVisible(true);
    }
  });
}
</script>

<template>
  <p>Player number : {{ props.playerNumber }}</p>
  <p>Start Game : {{ this.startGame }}</p>
  <p>Game Code : {{ this.gameCode }}</p>
  <Suspense>
    <div v-if="props.startGame" :id="containerId" />

    <template #fallback>
      <div class="placeholder">Downloading...</div>
    </template>
  </Suspense>
</template>

<style></style>
