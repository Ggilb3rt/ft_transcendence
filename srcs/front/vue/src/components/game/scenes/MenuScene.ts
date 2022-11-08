import Phaser from "phaser";
import io from "socket.io-client";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  init(data) {
    this.buttons = [];
    this.level = data.level;
    this.userId = data.userId;
    this.spectator = data.spectator;
  }

  preload() {}

  create() {
    const scene = this;

    console.log("MENUSCENE + level = " + this.level);

    if (scene.level === "pong") {
      //console.log("level pong");
      scene.scene.start("DefaultGame", {
        userId: scene.userId,
        spectator: scene.spectator,
      });
    } else if (scene.level === "catPong") {
      // console.log("level catpong");
      scene.scene.start("CatPongGame", {
        userId: scene.userId,
        spectator: scene.spectator,
      });
    } else if (scene.level === "customizable") {
      scene.scene.start("CustomizableGame", {
        userId: scene.userId,
        spectator: scene.spectator,
      });
    } else {
      scene.buttons.push(
        scene.createButton(140, 215, "DEFAULT", "DefaultGame", scene)
      );
      scene.buttons.push(
        scene.createButton(140, 315, "CUSTOMIZABLE", "CustomizableGame", scene)
      );
      scene.buttons.push(
        scene.createButton(140, 415, "CATPONG", "CatPongGame", scene)
      );

      //scene.buttons.push(
      //  scene.createButton(140, 515, "WATCHGAME", "DefaultGame", scene)
      //);
    }
  }

  createButton(width, height, text, dest, scene) {
    let button = scene.add.text(width, height, text, {
      fill: "#ffffff",
      fontSize: "20px",
      fontStyle: "bold",
    });

    button.setInteractive();
    button.on("pointerdown", () => {
      if (text === "WATCHGAME") {
        scene.scene.start(dest, {
          userId: scene.userId,
          spectator: scene.spectator,
        });
      } else {
        scene.scene.start(dest, {
          userId: scene.userId,
          spectator: scene.spectator,
        });
      }
    });
    return button;
  }
}
