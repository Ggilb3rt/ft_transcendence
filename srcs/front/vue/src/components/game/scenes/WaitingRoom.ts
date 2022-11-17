import Phaser from "phaser";

export default class WaitingRoom extends Phaser.Scene {

  constructor() {
    super("WaitingRoom");
  }

  init(data) {
    this.level = data.level;
    this.userId = data.userId;
    this.challenge = data.challenge;
    this.challengeId = data.challengeId;
    this.spectator = data.spectator;
    this.key = data.key;
    this.images = data.images;
    this.custom = data.custom;
	this.vueSocket = data.vueSocket;
    this.doneOK = false;
    this.message;
    this.panel;
    this.popup;
    this.buttons = [];
  }

  preload() {}

  create() {
    const scene = this;
    let { width, height } = this.sys.game.canvas;
    console.log("custom " + scene.custom);

    scene.createWaitingPanel(width, height, scene);

    if (scene.custom === true) {
      this.container = scene.add.container(0, height / 2 - 75);
      scene.createPanel(width, height, scene);
      scene.buttonsPlayerOne(width, height, scene);
      scene.buttonsPlayerTwo(width, height, scene);
      scene.buttonsBall(width, height, scene);
      scene.doneButton(width, height, scene);
    } else {
      scene.popUp.setVisible(true);
      scene.message.setVisible(true);
    }
  }

  update() {
    const scene = this;

    if (scene.doneOK === true) {
      scene.scene.pause();
      scene.scene.start("GameScene", {
        level: scene.level,
        userId: scene.userId,
        spectator: scene.spectator,
        challenge: scene.challenge,
        challengeId: scene.challengeId,
        key: scene.key,
        images: scene.images,
		vueSocket: scene.vueSocket,
      });
    }
  }

  createWaitingPanel(width, height, scene) {
    scene.popUp = scene.add.graphics().setVisible(false);
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
      .setShadow(3, 3, "rgba(0,0,0,0.5)", 2)
      .setVisible(false);
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
          scene.images.playerOne = "p1" + text;
        } else if (elem === 2) {
          scene.images.playerTwo = "p2" + text;
        } else if (elem === 3) {
          scene.images.ball = "ball" + text;
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
