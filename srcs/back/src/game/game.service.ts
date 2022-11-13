import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { Ball, Player, WR1, WR2, WR3, WR4 } from './classes';
import { UsersHelper } from '../users/usersHelpers';
import { CreateMatchDto } from 'src/users/createMatchDto';

@Injectable()
export class GameService {
	private waitingRooms = {};
    private activeGames = {};
	private userIds = {};
    private players = {};

	constructor(private readonly usersHelper: UsersHelper) {
		this.waitingRooms[1] = WR1;
		this.waitingRooms[2] = WR2;
		this.waitingRooms[3] = WR3;
	}



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
		console.log("USER ID1 " + userId);
		this.userIds[userId] = userId;
		console.log("ADD USER ");
		console.log(this.userIds);
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

    handleJoinQueue(client: Socket, data: any, server: Server) {
        const level = data.level;
		const userId = data.userId;
		const player = this.players[client.id];

		console.log("waitingRooms");
		console.log(this.waitingRooms)

        let wr = this.waitingRooms[level];
		if (wr === undefined) {
			console.log("HEREEEE");
			this.waitingRooms[level] = WR;
			wr = this.waitingRooms[level];
		}

		console.log('JOINING QUEUE level ' + level)
		console.log(client.id + " " + userId);

        this.players[client.id].level = level;
		this.players[client.id].userId = userId;

        // Waiting room is empty
        if (wr.playerOne.id === "" && wr.playerTwo.id === "") {
            console.log("room empty");
            const roomId = this.codeGenerator(5);
            wr.roomId = roomId;
            wr.playerOne.id = player.id;
            wr.playerOne.socket = player.socket;
            wr.playerOne.roomId = roomId;
			wr.playerOne.level = level;
			wr.playerOne.userId = userId;
            wr.level = level;
            this.players[player.id].roomId = wr.roomId;
        }
        // Waiting room has 1 player
        else if (wr.playerOne.id !== "" && wr.playerTwo.id === "") {
            console.log("room waiting");
			if (wr.playerOne.userId === userId) {
				console.log("u cannot play against yourself");
				client.emit("leftGame", 2);
				client.disconnect();
				return;
			}
            wr.playerTwo.id = player.id;
            wr.playerTwo.socket = player.socket;
            wr.playerTwo.roomId = wr.roomId;
			wr.playerTwo.level = level;
			wr.playerTwo.userId = userId;
            this.players[player.id].roomId = wr.roomId;
            // Waiting room has 2 players
            if (wr.playerOne.id !== "" && wr.playerTwo.id !== "") {
                 console.log("room complete");
                const p1 = wr.playerOne;
                const p2 = wr.playerTwo;
                this.activeGames[wr.roomId] = {
                    playerOne: p1,
                    playerTwo: p2,
                    level: level,
                }
                this.initGame(wr.roomId, server);
				Reflect.deleteProperty(this.waitingRooms, level);
            }
        }
    }

    initGame(roomId: any, server: Server) {
        const gameRoom = this.activeGames[roomId];
		const level = gameRoom.level;
        const playerOne = gameRoom.playerOne;
        const playerTwo = gameRoom.playerTwo;
       
        playerOne.socket.join(roomId);
        playerOne.socket.emit("init", { playerNumber: 1, gameCode: roomId, level: gameRoom.level });
        playerTwo.socket.join(roomId);
        playerTwo.socket.emit("init", { playerNumber: 2, gameCode: roomId, level: gameRoom.level });

        const state = this.createGameState();
        state.players[0].id = gameRoom.playerOne.socket.id;
		state.players[0].userId = gameRoom.playerOne.userId;
        state.players[1].id = gameRoom.playerTwo.socket.id;
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

    createGameState() {
        return {
            ball: new Ball,
            players: [
                new Player,
                new Player,
            ],
            roomName: String
        }
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
			console.log("HERE1")
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
		const level = this.players[client.id].level;
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
				Reflect.deleteProperty(this.waitingRooms, this.players[client.id].challengeInfo.challenger + 10);
			} else {
            	let wr = this.waitingRooms[level];
				console.log("HAHAH");
				console.log(this.waitingRooms[level]);
				if (wr !== undefined && (level === 1 || level === 2 || level === 3)) {
           			if (wr.playerOne.id === client.id) {
                		this.switchPlayers(wr.playerOne, wr.playerTwo, wr, 1);
            		} else if (wr.playerTwo.id === client.id) {
                		this.switchPlayers(null, null, wr, 2)
            		}
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

    switchPlayers(playerOne, playerTwo, wr, n) {
        if (n === 1) {
			wr.roomId = wr.playerTwo.roomId;
            wr.playerOne.id = wr.playerTwo.id;
            wr.playerOne.socket = wr.playerTwo.socket;
            wr.playerOne.roomId = wr.playerTwo.roomId;
            wr.playerOne.level = wr.playerTwo.level;
			wr.playerOne.userId = wr.playerTwo.userId;
        } else {
            wr.playerTwo.id = "";
            wr.playerTWo.socket = "";
            wr.playerTwo.roomId = "";
            wr.playerTwo.level = 0;
			wr.playerTwo.userId = 0;
        }
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

	handleCreateGame(client:Socket, data: any, server: Server ) {
		//console.log("HANDLE CREATE GAME |||")
		//console.log(data);
		//console.log("||||")
		const level = data.challengeInfo.level;
		const userId = data.userId;
		const player = this.players[client.id];

		player.userId = userId;
		player.level = level;
		player.challenge = true;
		player.challengeInfo = data.challeneInfo;
	
		let wr = this.waitingRooms[data.challengerInfo.challenger + 10];
		if (!wr) {
			this.waitingRooms[data.challengerInfo.challenger + 10] = WR4;
			wr = this.waitingRooms[data.challengerInfo.challenger + 10]
		}

		if (player.userId === data.challengeInfo.challenger ) {
			wr.playerOne.id = player.id;
			wr.playerOne.socket = player.socket;
			wr.playerOne.level = level;
			wr.playerOne.userId = userId;
            wr.level = level;
		} else if (player.userId === data.challengeInfo.challenged) {
			wr.playerTwo.id = player.id;
			wr.playerTwo.socket = player.socket;
			wr.playerTwo.level = level;
			wr.playerTwo.userId = userId;
			wr.level = level;
		}

		if (wr.playerOne.id !== "" && wr.playerTwo.id !== "") {
			//console.log("room CREATION COMPLETE")
			const roomId = this.codeGenerator(5);
			wr.roomId = roomId;
			wr.playerOne.roomId = roomId;
			wr.playerTwo.roomId = roomId;
			wr.level = level;
			this.players[wr.playerOne.id].roomId = roomId;
			this.players[wr.playerTwo.id].roomId = roomId;
			this.players[wr.playerOne.id].level = wr.level;
			this.players[wr.playerTwo.id].level = wr.level;
			this.activeGames[roomId] = {
				playerOne: wr.playerOne,
				playerTwo: wr.playerTwo,
				level: level,
			}
			console.log(this.activeGames[roomId]);

			this.initGame(wr.roomId, server);

			Reflect.deleteProperty(this.waitingRooms, data.challeneInfo.challeneger + 10);
		}
	}

}


