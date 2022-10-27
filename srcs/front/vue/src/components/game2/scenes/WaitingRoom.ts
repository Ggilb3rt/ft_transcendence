import Phaser from "phaser";
//import codeform from "../assets/text/codeform.html";

export default class WaitingRoom extends Phaser.Scene {
  constructor() {
    super("WaitingRoom");
    this.state = {};
    this.hasBeenSet = false;
  }

  init(data) {
    this.socket = data.socket;
  }

  preload() {
    //this.load.html("codeform", codeform);
  }

  create() {
    const scene = this;

    scene.waitingText = scene.add.text(140, 215, "Waiting for another player...", {
      fill: "#ffffff",
      fontSize: "20px",
      fontStyle: "bold",
    });

}
    //scene.scene.stop("WaitinRoom");
    
    
/*
    scene.enterButton = scene.add.text(562.5, 250, "Enter Game", {
        fill: "#000000",
        fontSize: "20px",
        fontStyle: "bold",
      });
      scene.enterButton.setInteractive();
      scene.enterButton.on("pointerdown", () => {
        scene.socket.emit("isKeyValid", 'Q0TW5');
    });

    scene.notValidText = scene.add.text(670, 295, "", {
      fill: "#ff0000",
      fontSize: "15px",
    });
    scene.roomKeyText = scene.add.text(210, 250, "", {
      fill: "#00ff00",
      fontSize: "20px",
      fontStyle: "bold",
    });

    scene.socket.on("roomCreated", function (roomKey) {
      scene.roomKey = roomKey;
      scene.roomKeyText.setText(scene.roomKey);
    });

    scene.socket.on("keyNotValid", function () {
      scene.notValidText.setText("Invalid Room Key");
    });
    scene.socket.on("keyIsValid", function (input) {
        console.log(input);
      scene.socket.emit("joinRoom", input);
      scene.scene.stop("WaitingRoom");
    });
  }*/


}
