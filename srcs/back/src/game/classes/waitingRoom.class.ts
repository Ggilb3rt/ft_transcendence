
class Player {
	id:number;
    socket: any;
    roomId: string;
	userId: number;
	connected: boolean;

	constructor() {
		this.id = 0;
		this.socket = null;
		this.roomId = "";
		this.userId = 0;
		this.connected = false;
	}
}

export class WaitingRoom {
	level: number;
    players: Player[];
    roomId: string

	constructor() {
		this.level= 0,
		this.players = [
			new Player(),
			new Player()
		]
		this.roomId= "";
	}
}