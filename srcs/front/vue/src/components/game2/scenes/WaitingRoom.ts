import Phaser, { Scene } from "phaser";

import eventsCenter from "./EventsCenter";

export default class WaitingRoom extends Phaser.Scene {
  constructor() {
    super("WaitingRoom");
  }

  init() {
  }

  preload() {}

  create() {
    const scene = this;
    let { width, height } = this.sys.game.canvas;

    scene.popUp = scene.add.graphics();

    // for popup window
    scene.popUp.lineStyle(1, 0xffffff);
    scene.popUp.fillStyle(0xffffff, 0.5);
    //scene.popUp.strokeRect(0, height / 2 - 75, width, 150);
    //scene.popUp.fillRect(0, height / 2 - 75, width, 150);
    scene.popUp.strokeRect(0, 85, width, 105);
    scene.popUp.fillRect(0, 85, width, 105);

    //title
 
    scene.message = scene.add
      .text(200, 115, "WAITING FOR SECOND PLAYER", {
        fill: "0x000000",
        fontSize: "36px",
        fontStyle: "bold",
        boundsAlignH: "center",
        boundsAlignV: "middle",
      })
      .setShadow(3, 3, "rgba(0,0,0,0.5)", 2);
  
      eventsCenter.on("ready", () => {
        scene.scene.stop("WaitingRoom");
      }, scene);
  }


}
