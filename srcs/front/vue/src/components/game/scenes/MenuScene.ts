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

        console.log("HAHA");

        /* INIT SOCKET */
        scene.socket = io("http://localhost:3000/game");

        scene.buttons.push(scene.createButton(140, 215, "DEFAULT", "DefaultGame", scene));
        scene.buttons.push(scene.createButton(140, 315, "CUSTOMIZABLE", "CustomizableGame", scene));
        scene.buttons.push(scene.createButton(140, 415, "CATPONG", "CatPongGame", scene));

        scene.buttons.push(scene.createButton(140, 515, "WATCHGAME", "DefaultGame", scene));
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
                scene.scene.start(dest, { userId: scene.userId, spectator: scene.spectator, socket: scene.socket });
            } else {
                scene.scene.start(dest, { userId: scene.userId, spectator: scene.spectator, socket: scene.socket });
            }
        });
        return button;
    }
}
