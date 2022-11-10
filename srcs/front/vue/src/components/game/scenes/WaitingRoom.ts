import Phaser from "phaser";

import eventsCenter from "./EventsCenter";

export default class WaitingRoom extends Phaser.Scene {
  private container!: Phaser.GameObjects.Container;

  constructor() {
    super("WaitingRoom");
  }

  init(data) {
    this.level = data.level;
    this.spectator = data.spectator;
    this.rematch = data.rematch;
    this.doneOK = false;
    this.settingsOK = false;
    this.settings = {
      playerOne: "WHITE",
      playerTwo: "WHITE",
      ball: "WHITE",
    };
    this.message = {};
    this.panel = {};
    this.popup = {};
    this.buttons = [];
  }

  preload() {}

  create() {
    const scene = this;
    let { width, height } = this.sys.game.canvas;

    eventsCenter.on("quit", () => {
      scene.scene.stop();
    });

    if (scene.level === "default" && !scene.rematch) {
      if (!scene.spectator) {
        scene.waitingText(width, height, "WAITING FOR SECOND PLAYER", scene);
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

    if (scene.level === "customizable" && !scene.rematch) {
      if (!scene.rematch) {
        this.container = scene.add.container(0, height / 2 - 75);
        scene.createPanel(width, height, scene);
        scene.buttonsPlayerOne(width, height, scene);
        scene.buttonsPlayerTwo(width, height, scene);
        scene.buttonsBall(width, height, scene);
        scene.doneButton(width, height, scene);
      }

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

    if (scene.rematch) {
      scene.waitingText(width, height, "BE READY FOR REMATCH !", scene);
      eventsCenter.on(
        "ready",
        () => {
          scene.message.setText("          GO !          ");
          scene.time.delayedCall(1000, function () {
            scene.scene.stop("WaitingRoom");
          });
        },
        scene
      );
    }
  }

  update() {
    const scene = this;
    const { width, height } = scene.sys.canvas;
    if (scene.doneOK === true && scene.settingsOK === false && !scene.rematch) {
      scene.settingsOK = true;
      if (!scene.spectator) {
        scene.waitingText(width, height, "WAITING FOR SECOND PLAYER", scene);
      }
      eventsCenter.emit("settingsOK", scene.settings);
      scene.panel.destroy();
      scene.buttons.forEach((b) => {
        b.setVisible(false);
      });
      scene.physics.pause();
    }
  }

  waitingText(width, height, text, scene) {
    scene.popUp = scene.add.graphics();
    scene.popUp.lineStyle(1, 0xffffff);
    scene.popUp.fillStyle(0xffffff, 0.5);
    scene.popUp.strokeRect(0, 85, width, 105);
    scene.popUp.fillRect(0, 85, width, 105);

    scene.message = scene.add
      //.text(200, 115, "WAITING FOR SECOND PLAYER", {
      .text(200, 115, text, {
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

  createButton(width, height, text, color, interactive, elem, scene) {
    let button = scene.add.text(width, height, text, {
      fill: color,
      fontSize: "20px",
      fontStyle: "bold",
    });
    if (interactive === 1) {
      button.setInteractive();
      button.on("pointerdown", () => {
        if (elem === 1) {
          scene.settings.playerOne = text;
        } else if (elem === 2) {
          scene.settings.playerTwo = text;
        } else if (elem === 3) {
          scene.settings.ball = text;
        } else {
          scene.doneOK = true;
        }
      });
    }
    return button;
  }

  buttonsPlayerOne(width, height, scene) {
    scene.buttons.push(
      scene.createButton(
        100,
        height / 2 - 50,
        "PLAYER 1 COLOR : ",
        "0x000000",
        0,
        1,
        scene
      )
    );
    scene.buttons.push(
      scene.createButton(350, height / 2 - 50, "BLUE", "#0080ff", 1, 1, scene)
    );
    scene.buttons.push(
      scene.createButton(450, height / 2 - 50, "GREEN", "#008000", 1, 1, scene)
    );
    scene.buttons.push(
      scene.createButton(550, height / 2 - 50, "ORANGE", "#FFA500", 1, 1, scene)
    );
    scene.buttons.push(
      scene.createButton(700, height / 2 - 50, "YELLOW", "#FFFF00", 1, 1, scene)
    );
  }

  buttonsPlayerTwo(width, height, scene) {
    scene.buttons.push(
      scene.createButton(
        100,
        height / 2 - 20,
        "PLAYER 2 COLOR : ",
        "0x000000",
        0,
        2,
        scene
      )
    );
    scene.buttons.push(
      scene.createButton(350, height / 2 - 20, "BLUE", "#0080ff", 1, 2, scene)
    );
    scene.buttons.push(
      scene.createButton(450, height / 2 - 20, "GREEN", "#008000", 1, 2, scene)
    );
    scene.buttons.push(
      scene.createButton(550, height / 2 - 20, "ORANGE", "#FFA500", 1, 2, scene)
    );
    scene.buttons.push(
      scene.createButton(700, height / 2 - 20, "YELLOW", "#FFFF00", 1, 2, scene)
    );
  }

  buttonsBall(width, height, scene) {
    scene.buttons.push(
      scene.createButton(
        100,
        height / 2 + 10,
        "BALL COLOR     : ",
        "0x000000",
        0,
        3,
        scene
      )
    );
    scene.buttons.push(
      scene.createButton(350, height / 2 + 10, "BLUE", "#0080ff", 1, 3, scene)
    );
    scene.buttons.push(
      scene.createButton(450, height / 2 + 10, "GREEN", "#008000", 1, 3, scene)
    );
    scene.buttons.push(
      scene.createButton(550, height / 2 + 10, "ORANGE", "#FFA500", 1, 3, scene)
    );
    scene.buttons.push(
      scene.createButton(700, height / 2 + 10, "YELLOW", "#FFFF00", 1, 3, scene)
    );
  }

  doneButton(width, height, scene) {
    scene.buttons.push(
      scene.createButton(
        width / 2 - 15,
        height / 2 + 50,
        "DONE",
        "0x000000",
        1,
        4,
        scene
      )
    );
  }
}
