import Phaser from "phaser";
import io from "socket.io-client";
import bomb from "../assets/bomb.png";

export default class WaitingRoom extends Phaser.Scene {
  constructor() {
    super("MenuScene");
    this.player = {};
    this.state = {};
  }

  /*init(data) {
      this.socket = data.socket;
    }*/

  preload() {
    this.load.image("bomb", bomb);
  }

  create() {
    const scene = this;

    //const { width, height } = this.scale;

    // Level One Button
    scene.levelOneButton = scene.add.text(140, 215, "LEVEL 1", {
      fill: "#ffffff",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.levelOneButton.setInteractive();
    scene.levelOneButton.on("pointerdown", () => {
      console.log("levelOne button clicked");
      scene.scene.start("LevelOneScene", {spectator: false});
    });

    // Level Two Button
    scene.levelTwoButton = scene.add.text(140, 315, "LEVEL 2", {
      fill: "#ffffff",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.levelTwoButton.setInteractive();
    scene.levelTwoButton.on("pointerdown", () => {
      console.log("levelTwo button clicked");
    });

        // Level Two Button
        scene.watchButton = scene.add.text(140, 415, "WATCH", {
            fill: "#ffffff",
            fontSize: "20px",
            fontStyle: "bold",
          });
          scene.watchButton.setInteractive();
          scene.watchButton.on("pointerdown", () => {
            scene.scene.start("LevelOneScene", {spectator: true});
          });
  }
}
