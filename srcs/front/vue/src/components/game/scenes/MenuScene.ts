import Phaser from "phaser";
import io from "socket.io-client";

export default class WaitingRoom extends Phaser.Scene {
  constructor() {
    super("MenuScene");
    this.player = {};
    this.state = {};
  }

  init() {}

  preload() {}

  create() {
    const scene = this;

    //const { width, height } = this.scale;

    // Level One Button
    scene.defaultButton = scene.add.text(140, 215, "DEFAULT", {
      fill: "#ffffff",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.defaultButton.setInteractive();
    scene.defaultButton.on("pointerdown", () => {
      console.log("Default button clicked");
      scene.scene.start("DefaultGame", {spectator: false});
    });

    // Level Two Button
    scene.customizableButton = scene.add.text(140, 315, "CUSTOMIZABLE", {
      fill: "#ffffff",
      fontSize: "20px",
      fontStyle: "bold",
    });
    scene.customizableButton.setInteractive();
    scene.customizableButton.on("pointerdown", () => {
      console.log("Customizable button clicked");
	  scene.scene.start("CustomizableGame", {spectator: false});
    });

	// Level Three Button
	scene.catPongButton = scene.add.text(140, 415, "CATPONG", {
		fill: "#ffffff",
		fontSize: "20px",
		fontStyle: "bold",
	  });
	  scene.catPongButton.setInteractive();
	  scene.catPongButton.on("pointerdown", () => {
		console.log("Cat Pong button clicked");
		scene.scene.start("CatPongGame", {spectator: false});
	  });

        // Level Two Button
    /*    scene.watchButton = scene.add.text(140, 415, "WATCH", {
            fill: "#ffffff",
            fontSize: "20px",
            fontStyle: "bold",
          });
          scene.watchButton.setInteractive();
          scene.watchButton.on("pointerdown", () => {
            scene.scene.start("LevelOneScene", {spectator: true});
          });*/
	}
}
