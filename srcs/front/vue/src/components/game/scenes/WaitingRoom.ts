import Phaser, { Scene } from "phaser";

import eventsCenter from "./EventsCenter";

export default class WaitingRoom extends Phaser.Scene {
  private container!: Phaser.GameObjects.Container;

  constructor() {
    super("WaitingRoom");
    this.doneOK = false;
    this.settingsOK = false;
    this.settings = {
      playerOne: "white",
      playerTwo: "white",
      ball: "white",
    };
  }

  init(data) {
    this.level = data.level;
  }

  preload() {}

  create() {
    const scene = this;
    let { width, height } = this.sys.game.canvas;

    eventsCenter.on("quit", () => {
      this.doneOK = false;
      this.settingsOK = false;
      this.settings = {
        playerOne: "white",
        playerTwo: "white",
        ball: "white",
      };
      //console.log("QUITT");
      scene.scene.stop();
    });

    if (scene.level === "default") {
      //console.log("level default");
      scene.waitingText(width, height, scene);
      eventsCenter.on(
        "ready",
        () => {
          scene.message.setText("GAME IS ABOUT TO START !");
          scene.time.delayedCall(2000, function () {
            scene.scene.stop("WaitingRoom");
          });
        },
        scene
      );
    }

    if (scene.level === "customizable") {
      this.container = scene.add.container(0, height / 2 - 75);
      scene.createPanel(width, height, scene);
      scene.buttonsPlayerOne(width, height, scene);
      scene.buttonsPlayerTwo(width, height, scene);
      scene.buttonsBall(width, height, scene);
      scene.doneButton(width, height, scene);

      if (scene.settingsOK) {
        eventsCenter.on(
          "ready",
          () => {
            scene.message.setText("GAME IS ABOUT TO START !");
            scene.time.delayedCall(2000, function () {
              scene.scene.stop("WaitingRoom");
            });
          },
          scene
        );
      }
    }
  }

  waitingText(width, height, scene) {
    scene.popUp = scene.add.graphics();

    scene.popUp.lineStyle(1, 0xffffff);
    scene.popUp.fillStyle(0xffffff, 0.5);
    scene.popUp.strokeRect(0, 85, width, 105);
    scene.popUp.fillRect(0, 85, width, 105);

    scene.message = scene.add
      .text(200, 115, "WAITING FOR SECOND PLAYER", {
        fill: "0x000000",
        fontSize: "36px",
        fontStyle: "bold",
        boundsAlignH: "center",
        boundsAlignV: "middle",
      })
      .setShadow(3, 3, "rgba(0,0,0,0.5)", 2);

    eventsCenter.on(
      "ready",
      () => {
        scene.message.setText("GAME IS ABOUT TO START !");
        scene.time.delayedCall(2000, function () {
          scene.scene.stop("WaitingRoom");
        });
      },
      scene
    );
  }

  createPanel(width, height, scene) {
    scene.panel = scene.add.graphics();
    scene.panel.lineStyle(1, 0xffffff);
    scene.panel.fillStyle(0xffffff, 0.5);
    scene.panel.strokeRect(0, height / 2 - 75, width, 150);
    scene.panel.fillRect(0, height / 2 - 75, width, 150);
  }

  buttonsPlayerOne(width, height, scene) {
    scene.color1 = scene.add.text(100, height / 2 - 50, "PLAYER 1 COLOR : ", {
      fill: "0x000000",
      fontSize: "20px",
      fontStyle: "bold",
    });

    scene.blue1 = scene.add.text(350, height / 2 - 50, "BLUE", {
      fill: "#0080ff",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.blue1.setInteractive();
    scene.blue1.on("pointerdown", () => {
      this.settings.playerOne = "blue";
    });

    scene.green1 = scene.add.text(450, height / 2 - 50, "GREEN", {
      fill: "#008000",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.green1.setInteractive();
    scene.green1.on("pointerdown", () => {
      this.settings.playerOne = "green";
    });

    scene.orange1 = scene.add.text(550, height / 2 - 50, "ORANGE", {
      fill: "#FFA500",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.orange1.setInteractive();
    scene.orange1.on("pointerdown", () => {
      this.settings.playerOne = "orange";
    });

    scene.yellow1 = scene.add.text(700, height / 2 - 50, "YELLOW", {
      fill: "#FFFF00",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.yellow1.setInteractive();
    scene.yellow1.on("pointerdown", () => {
      this.settings.playerOne = "yellow";
    });
  }

  buttonsPlayerTwo(width, height, scene) {
    scene.color2 = scene.add.text(100, height / 2 - 20, "PLAYER 2 COLOR : ", {
      fill: "0x000000",
      fontSize: "20px",
      fontStyle: "bold",
    });

    scene.blue2 = scene.add.text(350, height / 2 - 20, "BLUE", {
      fill: "#0080ff",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.blue2.setInteractive();
    scene.blue2.on("pointerdown", () => {
      this.settings.playerTwo = "blue";
    });

    scene.green2 = scene.add.text(450, height / 2 - 20, "GREEN", {
      fill: "#008000",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.green2.setInteractive();
    scene.green2.on("pointerdown", () => {
      this.settings.playerTwo = "green";
    });

    scene.orange2 = scene.add.text(550, height / 2 - 20, "ORANGE", {
      fill: "#FFA500",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.orange2.setInteractive();
    scene.orange2.on("pointerdown", () => {
      this.settings.playerTwo = "orange";
    });

    scene.yellow2 = scene.add.text(700, height / 2 - 20, "YELLOW", {
      fill: "#FFFF00",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.yellow2.setInteractive();
    scene.yellow2.on("pointerdown", () => {
      this.settings.playerTwo = "yellow";
    });
  }

  buttonsBall(width, height, scene) {
    scene.color = scene.add.text(100, height / 2 + 10, "BALL COLOR     : ", {
      fill: "0x000000",
      fontSize: "20px",
      fontStyle: "bold",
    });

    scene.blue = scene.add.text(350, height / 2 + 10, "BLUE", {
      fill: "#0080ff",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.blue.setInteractive();
    scene.blue.on("pointerdown", () => {
      this.settings.ball = "blue";
    });

    scene.green = scene.add.text(450, height / 2 + 10, "GREEN", {
      fill: "#008000",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.green.setInteractive();
    scene.green.on("pointerdown", () => {
      this.settings.ball = "green";
    });

    scene.orange = scene.add.text(550, height / 2 + 10, "ORANGE", {
      fill: "#FFA500",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.orange.setInteractive();
    scene.orange.on("pointerdown", () => {
      this.settings.ball = "orange";
    });

    scene.yellow = scene.add.text(700, height / 2 + 10, "YELLOW", {
      fill: "#FFFF00",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.yellow.setInteractive();
    scene.yellow.on("pointerdown", () => {
      this.settings.ball = "yellow";
    });
  }

  doneButton(width, height, scene) {
    scene.done = scene.add.text(width / 2 - 15, height / 2 + 50, "DONE", {
      fill: "0x000000",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.done.setInteractive();
    scene.done.on("pointerdown", () => {
      //console.log("DONE");
      this.doneOK = true;
    });
  }

  update() {
    const scene = this;
    const { width, height } = scene.sys.canvas;
    if (scene.doneOK === true && scene.settingsOK === false) {
      //console.log("SETTINGS OK");
      scene.settingsOK = true;
      scene.waitingText(width, height, scene);
      eventsCenter.emit("settingsOK", scene.settings);
      scene.destroySettingsInterface(scene);
      this.doneOK = false;
      this.settingsOK = false;
      this.settings = {
        playerOne: "white",
        playerTwo: "white",
        ball: "white",
      };
      scene.physics.pause();
    }
  }

  destroySettingsInterface(scene) {
    scene.panel.destroy();
    scene.color.setVisible(false);
    scene.blue.destroy();
    //scene.blue.setVisible(false);
    scene.green.setVisible(false);
    scene.orange.setVisible(false);
    scene.yellow.setVisible(false);
    scene.done.destroy();
    scene.color1.setVisible(false);
    scene.blue1.destroy();
    //scene.blue.setVisible(false);
    scene.green1.setVisible(false);
    scene.orange1.setVisible(false);
    scene.yellow1.setVisible(false);
    scene.color2.setVisible(false);
    scene.blue2.destroy();
    //scene.blue.setVisible(false);
    scene.green2.setVisible(false);
    scene.orange2.setVisible(false);
    scene.yellow2.setVisible(false);
  }
}
