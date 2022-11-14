import { GameState } from "./gameState.class";
import { PlayerWR } from "./waitingRoom.class";

export class ActiveGameRoom {
	level: number;
    //players: PlayerWR[];
	playerOne: PlayerWR;
	playerTwo: PlayerWR
    roomId: string;
	state: GameState;

	//constructor(playerOne: PlayerWR, playerTwo: PlayerWR, level: number, roomId: string) {
		/*this.level= 0,
		this.players = [
			new PlayerWR(),
			new PlayerWR()
		]
		this.roomId= "";*/
	constructor() {
		this.level = 0;
		this.playerOne = new PlayerWR;
		this.playerTwo = new PlayerWR;
		this.roomId = "";
		this.state = new GameState();
	}
	/*	this.level = level;
		this.roomId = roomId;
		this.players = [
			new PlayerWR(),
			new PlayerWR(),
		]
		this.state = null;*/
		
		/*this.level= 0,
		this.players = [
			new PlayerWR(),
			new PlayerWR()
		]
		this.roomId= "";*/
	//}

}