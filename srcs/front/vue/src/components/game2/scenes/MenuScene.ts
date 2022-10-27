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
      //scene.scene.stop("WaitingRoom");
      scene.scene.start("LevelOneScene");
      //scene.socket.emit("joinQueue", { level: 1 });
      //scene.scene.start("WaitingRoom");
      //scene.socket.emit("isKeyValid", 'Q0TW5');
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
      //scene.socket.emit("isKeyValid", 'Q0TW5');
    });
  }

  //update() {}

  /* scene.popUp = scene.add.graphics();
     scene.boxes = scene.add.graphics();
 
     // for popup window
     scene.popUp.lineStyle(1, 0xffffff);
     scene.popUp.fillStyle(0xffffff, 0.5);
 
     // for boxes
     scene.boxes.lineStyle(1, 0xffffff);
     scene.boxes.fillStyle(0xa9a9a9, 1);
 
     // popup window
     scene.popUp.strokeRect(25, 25, 750, 500);
     scene.popUp.fillRect(25, 25, 750, 500);
 
     //title
     scene.title = scene.add.text(100, 75, "RegEx Spaceship", {
       fill: "#add8e6",
       fontSize: "66px",
       fontStyle: "bold",
     });
 
     //left popup
     scene.boxes.strokeRect(100, 200, 275, 100);
     scene.boxes.fillRect(100, 200, 275, 100);
     scene.requestButton = scene.add.text(140, 215, "Request Game", {
       fill: "#000000",
       fontSize: "20px",
       fontStyle: "bold",
     });
     scene.requestButton.setInteractive();
     scene.requestButton.on("pointerdown", () => {
         console.log("request room code");
       scene.socket.emit("getRoomCode");
     });
 
     //right popup
     scene.boxes.strokeRect(425, 200, 275, 100);
     scene.boxes.fillRect(425, 200, 275, 100);*/
  /*scene.inputElement = scene.add.dom(562.5, 250).createFromCache("codeform");
    scene.inputElement.addListener("click");
    scene.inputElement.on("click", function (event) {
      if (event.target.name === "enterRoom") {
        const input = scene.inputElement.getChildByName("code-form");

        scene.socket.emit("isKeyValid", input.value);
      }
    });*/

  /*    scene.enterButton = scene.add.text(562.5, 250, "Enter Game", {
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
      }
    
      update() {}*/
}
