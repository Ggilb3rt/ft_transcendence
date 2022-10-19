<script setup="ts">
import { onMounted, onUnmounted, onUpdated, ref } from "vue";
import Phaser from "phaser";
import ballImage from "@/assets/game/ball.png";
import paddleImage from "@/assets/game/paddle.png";

const props = defineProps({
  socket: Object,
  playerNumber: Number,
  startGame: Boolean, // true quand deux players, false quand quit
  gameActive: Boolean,
  gameCode: String,
  quit: Boolean,
});

let gameInstance = null;
const containerId = "game-container";

onMounted(() => {
  gameInstance = launch(containerId);
});

onUpdated(() => {
  //if (props.gameActive) {
  //gameInstance = launch(containerId);
  //console.log("launching");
  //}
  if (props.quit === true) {
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
  isGameStarted: false, // Pour premier launch
  cursors: {},
  playerOneScoreText: {},
  playerTwoScoreText: {},
  playerOneScore: 0,
  playerTwoScore: 0,
  playerOneVictoryText: {},
  playerTwoVictoryText: {},
  paddleSpeed: 0,
  activeGame: false, // Pour quand un joueur marque un point
  endGame: false,
};

function preload() {
  this.load.image("ball", ballImage);
  this.load.image("paddle", paddleImage);
  this.load.image("opponentPaddle", paddleImage);
}

function create() {
  createGameObjects(this);
  createScoreObjects(this);
  /* Event Listeners */
  handleInitGame();
  handleLaunchBall();
  handleMovePlayer();
  handleMoveBall();
  handleAddPoint(this);
  handleEndGame();
  handleGameResult();
  //handleRematch(this);
  handleQuit();
}

function update() {
  //if (props.startGame) {
  if (gameState.endGame) {
    gameState.playerOne.body.setVelocityY(0);
    gameState.playerTwo.body.setVelocityY(0);
    gameState.ball.setVelocityX(0);
    gameState.ball.setVelocityY(0);
    gameState.ball.setImmovable(true);
  }

  if (
    props.startGame &&
    !gameState.isGameStarted &&
    !gameState.activeGame &&
    !gameState.endGame &&
    props.playerNumber === 1
  ) {
    //initGame(this);
    //console.log("ready to init");
    props.socket.emit("initGame", { gameCode: props.gameCode });
  }

  checkPoints();
  moveBall();
  movePlayers();
  //}
}

function createGameObjects(game) {
  // Create and add BALL
  gameState.ball = game.physics.add.sprite(
    game.physics.world.bounds.width / 2,
    game.physics.world.bounds.height / 2,
    "ball"
  );
  gameState.ball.setCollideWorldBounds(true);
  gameState.ball.setBounce(1, 1);

  // Create and add PLAYER 1
  gameState.playerOne = game.physics.add.sprite(
    gameState.ball.body.width / 2 + 1,
    game.physics.world.bounds.height / 2,
    "paddle"
  );
  gameState.playerOne.setCollideWorldBounds(true);
  gameState.playerOne.setImmovable(true);

  // Create and add PLAYER 2
  gameState.playerTwo = game.physics.add.sprite(
    game.physics.world.bounds.width - (gameState.ball.body.width / 2 + 1),
    game.physics.world.bounds.height / 2,
    "opponentPaddle"
  );
  gameState.playerTwo.setCollideWorldBounds(true);
  gameState.playerTwo.setImmovable(true);

  // Init collision between ball and paddles
  game.physics.add.collider(gameState.ball, gameState.playerOne);
  game.physics.add.collider(gameState.ball, gameState.playerTwo);

  // Init KEY EVENT listeners
  gameState.cursors = game.input.keyboard.createCursorKeys();
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
  if (props.playerNumber === 1) {
    if (gameState.ball.body.x < gameState.playerOne.body.x) {
      gameState.activeGame = false;
      props.socket.emit("addPoint", { gameCode: props.gameCode, player: 2 });
    }
    if (gameState.ball.body.x > gameState.playerTwo.body.x) {
      gameState.activeGame = false;
      props.socket.emit("addPoint", { gameCode: props.gameCode, player: 1 });
    }
  }
}

function moveBall() {
  if (props.playerNumber === 1 && gameState.activeGame && !gameState.endGame) {
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
        gameCode: props.gameCode,
        playerNumber: props.playerNumber,
        x: gameState.playerOne.x,
        y: gameState.playerOne.y,
      });
    }
  }

  if (props.playerNumber === 2) {
    if (playerMoved(gameState.cursors, gameState.playerTwo)) {
      props.socket.emit("movePlayer", {
        gameCode: props.gameCode,
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

function destroyGameObjects(game) {
  gameState.playerOneVictoryText.destroy();
  gameState.playerTwoVictoryText.destroy();
  gameState.ball.destroy();
  gameState.playerOne.destroy();
  gameState.playerTwo.destroy();
}
/*
function handleRematch(game) {
  props.socket.on("reMatch", () => {
    console.log("rematch handler");
    destroyGameObjects(game);
    createGameObjects(game);
    gameState.isGameStarted = false;
  });
}*/

function handleQuit(game) {
  if (props.quit) {
    gameState.isGameStarted = false;
  }
}

function handleInitGame() {
  props.socket.on("initGame", ({ state }) => {
    gameState.paddleSpeed = state.players[0].speed;
    if (props.playerNumber === 1) {
      launchBall();
    }
  });
}

function launchBall(game) {
  const timestamp = Date.now();

  while (Date.now() <= timestamp + 1000);
  props.socket.emit("launchBall", { gameCode: props.gameCode });
}

function handleLaunchBall() {
  props.socket.on("launchBall", ({ state }) => {
    if (props.playerNumber === 1) {
      gameState.ball.setVelocityX(state.ball.initialVelocity.x);
      gameState.ball.setVelocityY(state.ball.initialVelocity.y);
    }
    gameState.isGameStarted = true;
    gameState.activeGame = true;
  });
}

function handleAddPoint(game) {
  props.socket.on("addPoint", ({ playerNumber }) => {
    if (playerNumber === 1) {
      ++gameState.playerOneScore;
      gameState.playerOneScoreText.setText("Player 1: " + gameState.playerOneScore);
    } else if (playerNumber === 2) {
      ++gameState.playerTwoScore;
      gameState.playerTwoScoreText.setText("Player 2: " + gameState.playerTwoScore);
    }
    //if (props.playerNumber === 1) {
    gameState.ball.x = game.physics.world.bounds.width / 2;
    gameState.ball.y = game.physics.world.bounds.height / 2;
    gameState.playerOne.y = game.physics.world.bounds.height / 2;
    gameState.playerTwo.y = game.physics.world.bounds.height / 2;
    //if (props.playerNumber === 1) {
    launchBall(game);
    //}
    //}
  });
}

function createScoreObjects(game) {
  // Init SCORE TEXT player 1
  gameState.playerOneScoreText = game.add.text(
    100,
    10,
    "Player 1: " + gameState.playerOneScore
  );
  gameState.playerOneScoreText.setVisible(true);
  gameState.playerOneScoreText.setOrigin(0.5);

  // Init SCORE TEXT player 2
  gameState.playerTwoScoreText = game.add.text(
    game.physics.world.bounds.width - 100,
    10,
    "Player 2: " + gameState.playerTwoScore
  );
  gameState.playerTwoScoreText.setVisible(true);
  gameState.playerTwoScoreText.setOrigin(0.5);

  // Init VICTORY TEXT player 1
  gameState.playerOneVictoryText = game.add.text(
    game.physics.world.bounds.width / 2,
    game.physics.world.bounds.height / 2,
    "Player 1 wins !"
  );
  gameState.playerOneVictoryText.setVisible(false);
  gameState.playerOneVictoryText.setOrigin(0.5);

  // Init VICTORY TEXT player 2
  gameState.playerTwoVictoryText = game.add.text(
    game.physics.world.bounds.width / 2,
    game.physics.world.bounds.height / 2,
    "Player 2 wins !"
  );
  gameState.playerTwoVictoryText.setVisible(false);
  gameState.playerTwoVictoryText.setOrigin(0.5);
}

function handleEndGame() {
  props.socket.on("endGame", () => {
    gameState.endGame = true;
  });
}

function handleMovePlayer() {
  props.socket.on("movePlayer", ({ playerNumber, x, y }) => {
    console.log("coucou");
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
    const b = gameState.ball;
    if (b) {
      b.x = x + b.body.width / 2 + 2;
      b.y = y + b.body.height / 2 + 2;
    }
  });
}

function handleGameResult() {
  props.socket.on("gameResult", ({ winner }) => {
    console.log("END GAME WINNER: " + winner);
    gameState.endGame = true;
    gameState.activeGame = false;
    if (winner === 1) {
      ++gameState.playerOneScore;
      gameState.playerOneScoreText.setText("Player 1: " + gameState.playerOneScore);
      gameState.playerOneVictoryText.setVisible(true);
      gameState.activeGame = false;
    } else {
      ++gameState.playerTwoScore;
      gameState.playerTwoScoreText.setText("Player 2: " + gameState.playerTwoScore);
      gameState.playerTwoVictoryText.setVisible(true);
      gameState.activeGame = false;
    }
  });
}
</script>

<template>
  <p>Player number : {{ props.playerNumber }}</p>
  <p>Start Game : {{ this.startGame }}</p>
  <p>Game Code : {{ this.gameCode }}</p>
  <p>Spectator : {{ props.spectator }}</p>
  <!-- <Suspense> -->
  <!-- <div v-if="props.startGame" :id="containerId" /> -->
  <div v-show="props.gameActive">
    <div :id="containerId" />
  </div>
  <!-- <template #fallback>  -->
  <!-- <div class="placeholder">Downloading...</div> -->
  <!-- </template> -->
  <!-- </Suspense> -->
</template>

<style></style>
