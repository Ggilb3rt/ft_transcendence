import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { Ball, Player, WaitingRoom/*, WR1, WR2, WR3, WR4*/} from './classes';
import { UsersHelper } from '../users/usersHelpers';
import { CreateMatchDto } from 'src/users/createMatchDto';

@Injectable()
export class GameService {
	private waitingRooms = {};
    private activeGames = {};
	private userIds = {};
    private players = {};

	constructor(private readonly usersHelper: UsersHelper) {}

    handleConnection(client: Socket, server: Server) {
		console.log('CLIENT CONNECTED ' + client.id)
        this.players[client.id] = {
            id: client.id,
            socket: client,
            roomId: "",
            level: 0,
            spectator: false,
			userId: 0,
			type: "player",
			challenged: false,
			challengeInfo: {},
		}
	}

	handleAddUserId(client: Socket, data: any, server: Server) {
		const userId = Number(data.userId);
		//console.log("USER ID " + userId);
		this.userIds[userId] = userId;
		//console.log("ADD USER ");
		//console.log(this.userIds);
		client.emit("userAdded");
		server.emit("isUserInGame", { userId, bool: true});
	} 

	handleIsUserInGame(client: Socket, data: any) {
		const userId = data.userId;
		console.log("USER ID2 " + userId);
		console.log("array")
		console.log(this.userIds);
		if (this.userIds.hasOwnProperty(userId)) { client.emit("isUserInGame", { userId, bool: true }); } 
		else { client.emit("isUserInGame", { userId, bool: false });}
	}

	initPlayer(client: Socket, data: any, p: any, roomId: string) {
		const player = this.players[client.id];
		const userId = data.userId;
		const level = Number(data.level);

		p.id = player.socket.id;
		p.socket = player.socket;
		p.userId = userId;
		p.roomId = roomId;
		
		player.roomId = roomId;
		player.level = level;
		player.userId = userId;
	}

    handleJoinQueue(client: Socket, data: any, server: Server) {
        const level = Number(data.level);
		const userId = data.userId;
		const player = this.players[client.id];

		let newRoom: WaitingRoom;
		let wr;

		if (!this.waitingRooms.hasOwnProperty(level)) {
			let newRoom: WaitingRoom = new WaitingRoom();
			wr = this.waitingRooms[level] = newRoom;
		} else {
			wr = this.waitingRooms[level];
		}

		console.log('JOINING QUEUE level ' + level)
		console.log(client.id + " " + userId);

		//console.log(wr);
		//console.log(wr.players[0]);
        // Waiting room is empty
		if (wr.players[0].id === 0  && wr.players[1].id === 0) {
			const roomId = this.codeGenerator(5);
			this.initPlayer(client, data, wr.players[0], roomId);
			wr.level = level;
			wr.roomId = roomId;
            console.log("room empty");
        }
        // Waiting room has 1 player
		else if (wr.players[0].id !== 0 && wr.players[1].id === 0) {
            console.log("room waiting");
			if (wr.players[0].userId === userId) {
			 	console.log("u cannot play against yourself");
			 	client.emit("leftGame", 2);
			 	client.disconnect();
			 	return;
			}
			this.initPlayer(client, data, wr.players[1], wr.roomId);
			if (wr.players[0].id !== 0 && wr.players[1].id !== 0) {
			 	console.log("room complete");
                this.activeGames[wr.roomId] = {
                    playerOne:  wr.players[0],
                    playerTwo:  wr.players[1],
                    level: level,
                }
                this.initGame(wr.roomId, level, server);
			 	//Reflect.deleteProperty(this.waitingRooms, level);
             }
        }
    }

    initGame(roomId: any, level: number, server: Server) {
        const gameRoom = this.activeGames[roomId];
		//const level = gameRoom.level;
        const playerOne = gameRoom.playerOne;
        const playerTwo = gameRoom.playerTwo;

		console.log(gameRoom);
		console.log("ROOMID " + roomId)
       
        playerOne.socket.join(roomId);
        playerOne.socket.emit("init", { playerNumber: 1, gameCode: roomId, level });
        playerTwo.socket.join(roomId);
        playerTwo.socket.emit("init", { playerNumber: 2, gameCode: roomId, level });

		//let usersinroomname = await server.in(roomId).fetchSockets();
		//console.log("LENNNNN " + Object.keys(usersinroomname).length);

        const state = this.createGameState(playerOne, playerTwo);

        state.players[0].id = gameRoom.playerOne.id;
		state.players[0].userId = gameRoom.playerOne.userId;
        state.players[1].id = gameRoom.playerTwo.id;
		state.players[1].userId = gameRoom.playerTwo.userId;
        state.roomName = roomId;
        gameRoom.state = state;
        server.to(roomId).emit("roomComplete", state);

		this.updateActiveRoomNames();
	}

	updateActiveRoomNames() {
		const roomNames = this.getActiveRoomNames(null, null);
		let genSock = [];
		for (var player in this.players) {
			if (this.players[player].type === "general") {
				genSock.push(this.players[player]);
			}	
		}
		genSock.forEach((player) => {
			player.socket.emit("getActiveRoomNames", { roomNames });
		})
	}

    createGameState(playerOne, playerTwo) {
        return {
			level: 0,
            ball: new Ball(),
            players: [
                new Player(playerOne),
                new Player(playerTwo),
            ],
            roomName: "",
		}
		
		
		/*{
			ball: {
			speed: 500,
			initialVelocity: {
				x: 0,
				y: 0
			},
		},
			players: [
				playerOne,
				playerTwo,
			],
			roomName: "",
			level: 0,*/
        //}
    }

    codeGenerator(length: number) : string {
        var result = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    handlePlayerMovement(client: Socket, data: any, server: Server) {
		console.log("MOVE PLAYER " + data.roomName);
        client.to(data.roomName).emit('playerMoved', data)
    }

    handleLaunchBall(client: Socket, data: any, server: Server) {
        const state = this.activeGames[data.roomName].state;
        this.initBall(state.ball);
        //server.to(data.roomName).emit("launchBall", state);
        client.emit("launchBall", state);
    }

    initBall(ball: Ball) {
        let dirx = 0, diry = 0;
        while (Math.abs(dirx) <= 0.8 || Math.abs(dirx) >= 0.9) {
			const heading = this.randomNumberBetween(0, 2 * Math.PI);
			dirx = Math.cos(heading);
            diry = Math.sin(heading);
        }
        ball.initialVelocity.x = dirx * ball.speed;
        ball.initialVelocity.y = diry * ball.speed;
    }

    randomNumberBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    handleMoveBall(client: Socket, data: any, server: Server) {
        client.to(data.roomName).emit("ballMoved", data);

    }

    handleAddPoint(client: Socket, data: any, server: Server) {
        let score = ++this.activeGames[data.roomName].state.players[data.player - 1].match_score;
        if (score === 10) {
            server.to(data.roomName).emit('gameResult', { winner: data.player });
			server.emit("isUserInGame", { userId: this.players[client.id].userId, bool: false});
			Reflect.deleteProperty(this.userIds, this.players[client.id].userId);
			this.injectScoresDB(this.activeGames[data.roomName], null);
		} else {
            server.to(data.roomName).emit('addPoint', { playerNumber: data.player, score });
        }
    }

	async injectScoresDB(room: any, client: Socket) {

		// Player disconnected before the end of the game
		if (client !== null) {
			if (room.state.players[0].match_score !== 10 && room.state.players[1].match_score !== 10) {
				if (client.id === room.state.players[0].id) {
					room.state.players[0].match_score = 0;
					room.state.players[1].match_score = 10;
				} else {
					room.state.players[0].match_score = 10;
					room.state.players[1].match_score = 0;
				}
			}
		}
		
		const matchDto: CreateMatchDto = {
			player_left_id: room.state.players[0].userId,
			player_right_id: room.state.players[1].userId,
			score_left: room.state.players[0].match_score,
			score_right: room.state.players[1].match_score,
			date: new Date()
		}
		await this.usersHelper.addMatch(matchDto);
	}

    handleWatchGame(client: Socket, data: any, server: Server) {
        //console.log("WATCH GAME");
        //console.log(data.roomName);
		const roomName = data.roomName;
        this.players[client.id].level = 0;
        this.players[client.id].spectator = true;
        this.players[client.id].roomId = roomName;
        if (this.activeGames[roomName]) {
			client.join(roomName);
            client.emit("upDateInfo", this.activeGames[roomName].state);
        }   
    }

    async handleDisconnect(client: Socket, server: Server) {
		console.log("CLIENT DISCONNECTED " + client.id);
		
		const roomName = this.players[client.id].roomId;
		const userId = this.players[client.id].userId;
		const level = Number(this.players[client.id].level);
		const spectator = this.players[client.id].spectator;

		console.log("roomName " + roomName);
		console.log("level  " +level);

		if (spectator) {
			client.leave(roomName);
			client.emit("leftGame", 1)
			Reflect.deleteProperty(this.players, client.id);
			return;
		}

		if (roomName) {
			if (this.activeGames[roomName] !== undefined) {
				console.log("HERE2")
				await this.injectScoresDB(this.activeGames[roomName], client);
			}
			Reflect.deleteProperty(this.activeGames, roomName);
			server.in(roomName).emit("leftGame", 1)
			this.updateActiveRoomNames();
		}

		if (level !== 0) {
			if (this.players[client.id].challenge) {
				console.log("deleting wr");
				Reflect.deleteProperty(this.waitingRooms, this.players[client.id].roomId);
			} else {
				if (this.waitingRooms.hasOwnProperty(level) && (level === 1 || level === 2 || level === 3)) {
            		//let wr = this.waitingRooms[level];
           			/*if (wr.players[0].id === client.id && wr.players[1] !== 0) {
                		this.switchPlayers(wr.players[0], wr.players[1], wr, 1);
            		} else if (wr.players[1].id === client.id) {
                		this.switchPlayers(null, null, wr, 2)
            		}*/
					Reflect.deleteProperty(this.waitingRooms, level);
				}
			}
			client.emit("leftGame", 1);
		}
		server.emit("isUserInGame", { userId, bool: false});
		Reflect.deleteProperty(this.userIds, userId);
		Reflect.deleteProperty(this.players, client.id);

		console.log("REMAINING CLIENTS ")
		console.log(Object.keys(this.players));
		console.log("USER IDS")
		console.log(this.userIds);
    }

    switchPlayers(p1, p2, wr, n) {
		console.log(p1);
		console.log(p2);
        /*if (n === 1) {
			wr.roomId = wr.p2.roomId;
            wr.p1.id = wr.p2.id;
            wr.p1.socket = wr.p2.socket;
            wr.p1.roomId = wr.p2.roomId;
            wr.p1.level = wr.p2.level;
			wr.p1.userId = wr.p2.userId;
        } else {
            wr.p2.id = "";
            wr.p2.socket = "";
            wr.p2.roomId = "";
            wr.p2.level = 0;
			wr.p2.userId = 0;
        }*/
    }

	handleMoveAnim(client: Socket, data: any, server: Server) {
		client.to(data.roomName).emit("animMoved", data);
	}

    handleAnimCollision(client: Socket, data: any, server: Server) {
        server.to(data.roomName).emit("animCollision");
    }

	getActiveRoomNames(client: Socket, data: any) {
		console.log("GET ACTIVE ROOM NAMES");
		if (client !== null) {
			if (data.type === 1) {
				this.players[client.id].type = "general";
			} else if (data.type === 2) {
				this.players[client.id].type = "game-component";
			}
			console.log(client.id + " " + this.players[client.id].type)
		}
		let roomNames = {};
		let room;
		let level;
		let levelname;

		for (var key in this.activeGames) {
			level = this.activeGames[key].level;
			if (level === 1) {
				levelname = "pong"
			}
				else if (level === 2) {
					levelname = "customizable"
				} 
			else if (level === 3) {
				levelname = "catPong"
			}
			room = {
				id: key,
				level: levelname
			};
			roomNames[key] = room;
		}
		return (roomNames);
	}
	
	handleCreateNewChallengeRoom(client: Socket, data: any, server: Server){
		console.log("CREATING WAITING ROOM CHALLENGE")
		let { level, challenger, challenged, challengeId} = data.challenge;
		console.log(data);
		const userId = data.userId;
		const player = this.players[client.id];

		player.userId = userId;
		player.level = level;
		player.challenge = true;
		player.challengeInfo = data.challenge;

		let wr;
		if (!this.waitingRooms.hasOwnProperty(challengeId)) {
			let newRoom: WaitingRoom = new WaitingRoom();
			wr = this.waitingRooms[challengeId] = newRoom;
			wr.roomId = challengeId;
			wr.level = ++level;
		} else {
			wr = this.waitingRooms[challengeId];
		}

		console.log("WE 1 ");
		console.log(wr);

		if (player.userId === challenger ) {
			console.log('PLAYER ONE IS CHALLENGER')
			wr.players[0].id = player.id;
			wr.players[0].socket = player.socket;
			wr.players[0].userId = userId;
			wr.players[0].roomId = challengeId;
		} else if (player.userId === challenged) {
			console.log('PLAYER TWO IS CHALLENGER')
			wr.players[1].id = player.id;
			wr.players[1].socket = player.socket;
			wr.players[1].userId = userId;
			wr.players[1].roomId = challengeId;
		}
		console.log(this.waitingRooms[challengeId]);

		if (wr.players[0].userId !== 0 && wr.players[1].userId !== 0) {
			console.log("room CREATION COMPLETE")
			this.players[wr.players[0].id].roomId = challengeId;
			this.players[wr.players[1].id].roomId = challengeId;
			this.players[wr.players[0].id].level = level;
			this.players[wr.players[1].id].level = level;
			if (!this.activeGames.hasOwnProperty(challengeId)) {
			this.activeGames[challengeId] = {
				playerOne: wr.players[0],
				playerTwo: wr.players[1],
				level: level,
			}}
			console.log(this.activeGames[challengeId]);
			wr.players[0].socket.emit("newRoomCreated");
			wr.players[1].socket.emit("newRoomCreated");

			//this.initGame(wr.roomId, server);

			//Reflect.deleteProperty(this.waitingRooms, challengeId);
		}
	}

	
	handleJoinChallengeRoom(client: Socket, data: any, server: Server){
		console.log("CREATING WAITING ROOM CHALLENGE")
		let { level, challenger, challenged, challengeId} = data.challenge;
		console.log(data);
		//const level = data.challenge.level;
		//const roomId = data.challenge.challengeId;
		const userId = data.userId;
		const player = this.players[client.id];

		player.userId = userId;
		player.level = level;
		player.challenge = true;
		player.challengeInfo = data.challenge;

		let wr;
		if (!this.waitingRooms.hasOwnProperty(challengeId)) {
			let newRoom: WaitingRoom = new WaitingRoom();
			wr = this.waitingRooms[challengeId] = newRoom;
			wr.roomId = challengeId;
			wr.level = ++level;
		} else {
			wr = this.waitingRooms[challengeId];
		}
		console.log("WE 2 ");
		console.log(wr);

		if (player.userId === challenger ) {
			console.log('PLAYER ONE IS CHALLENGER')
			wr.players[0].id = player.id;
			wr.players[0].socket = player.socket;
			wr.players[0].userId = userId;
			wr.players[0].roomId = challengeId;
		} else if (player.userId === challenged) {
			console.log('PLAYER TWO IS CHALLENGER')
			wr.players[1].id = player.id;
			wr.players[1].socket = player.socket;
			wr.players[1].userId = userId;
			wr.players[1].roomId = challengeId;
		}
		console.log(this.waitingRooms[challengeId]);

		if (wr.players[0].userId !== 0 && wr.players[1].userId !== 0) {
			console.log("room CREATION COMPLETE")
			this.players[wr.players[0].id].roomId = challengeId;
			this.players[wr.players[1].id].roomId = challengeId;
			this.players[wr.players[0].id].level = level;
			this.players[wr.players[1].id].level = level;
			if (!this.activeGames.hasOwnProperty(challengeId)) {
			this.activeGames[challengeId] = {
				playerOne: wr.players[0],
				playerTwo: wr.players[1],
				level: ++level,
			}
		}
			console.log(this.activeGames[challengeId]);
			wr.players[0].socket.emit("newRoomCreated");
			wr.players[1].socket.emit("newRoomCreated");

			//this.initGame(wr.roomId, server);

			//Reflect.deleteProperty(this.waitingRooms, challengeId);
	}
}
handleInitGame(client: Socket, data: any, server: Server){
	console.log("INIT  " + data.roomId + " " + data.userId);
	console.log(this.waitingRooms[String(data.roomId)]);
	if (this.waitingRooms.hasOwnProperty(String(data.roomId))) {
		if (this.waitingRooms[data.roomId].players[0].userId === data.userId) {
			this.waitingRooms[data.roomId].players[0].id = client.id;
			this.waitingRooms[data.roomId].players[0].socket = client;
			this.waitingRooms[data.roomId].players[0].connected = true ;
			} else {
				this.waitingRooms[data.roomId].players[1].id = client.id;
			this.waitingRooms[data.roomId].players[1].socket = client;
				this.waitingRooms[data.roomId].players[1].connected = true ;
			} 
		}
		if (this.waitingRooms[data.roomId].players[0].connected === true  && this.waitingRooms[data.roomId].players[1].connected === true) {
			this.initGame(this.waitingRooms[data.roomId].roomId, this.waitingRooms[data.roomId].level, server);
			Reflect.deleteProperty(this.waitingRooms, data.roomId);
		}
	}
}


