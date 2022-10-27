import Phaser from "phaser";
import MainScene from "./scenes/MainScene";

export default function launch(containerId: string) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scale: {
      parent: containerId,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [ MainScene ],
  });
}
