import Phaser from "phaser";
import io from "socket.io-client";

export default class WaitingRoom extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  init(data) {
    this.buttons = [];
  }

  preload() { }

  create() {
    const scene = this;
    //const { width, height } = this.scale;

    /* INIT SOCKET */
    scene.socket = io("http://localhost:3000/game");

    // Level One Button
    scene.buttons.push(scene.createButton(140, 215, "DEFAULT", "DefaultGame", scene));
    scene.buttons.push(scene.createButton(140, 315, "CUSTOMIZABLE", "CustomizableGame", scene));
    scene.buttons.push(scene.createButton(140, 415, "CATPONG", "CatPongGame", scene));

    //scene.buttons.push(scene.createButton(140, 515, "WATCHGAME", xxxx, scene));
  }

  createButton(width, height, text, dest, scene) {
    let button = scene.add.text(width, height, text, {
      fill: "#ffffff",
      fontSize: "20px",
      fontStyle: "bold",
    });

    button.setInteractive();
    button.on("pointerdown", () => {
      scene.scene.start(dest, { spectator: false, socket: scene.socket });
    });
    return button;
  }
}

