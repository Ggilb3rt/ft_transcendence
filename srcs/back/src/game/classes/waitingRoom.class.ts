
export class PlayerWR {
	id:number;
    socket: any;
    roomId: string;
	userId: number;
	connected: boolean;

	constructor(player?: PlayerWR) {
		if (player !== undefined) 
		{ console.log("PLAYER " + player)
		this.id = player.id;
		this.socket = player.socket;
		this.roomId = player.roomId;
		this.userId = player.userId;
		this.connected = false;
		} else {
			this.id = 0;
		this.socket = null;
		this.roomId = "";
		this.userId = 0;
		this.connected = false;
		}
	}
}

export class WaitingRoom {
	level: number;
    players: PlayerWR[];
    roomId: string

	constructor() {
		this.level= 0,
		this.players = [
			new PlayerWR(),
			new PlayerWR()
		]
		this.roomId= "";
	}
}