import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { Ball, Player, WaitingRoom } from './classes';
import { DEFAULT_PADDLE_SPEED } from './constants';

@Injectable()
export class GameService {
	private waitingRooms = {};
    private activeGames = {};
    private players = {};

	constructor() {
		this.waitingRooms['1'] = WaitingRoom;
		this.waitingRooms['2'] = WaitingRoom;
		this.waitingRooms['3'] = WaitingRoom;
	}

    handleConnection(client: Socket, server: Server) {
        this.players[client.id] = {
            id: client.id,
            socket: client,
            roomId: "",
            level: '0',
            spectator: false,
        }
		//console.log("PLAYERS");
		//console.log(this.players);
    }

    handleJoinQueue(client: Socket, data: any, server: Server) {
		//console.log(this.players);
		const level = String(data.level);
        const player = this.players[client.id];
		const wr = this.waitingRooms[level];
		console.log(level);
		//console.log(wr);

        this.players[client.id].level = level;

        // Waiting room is empty
        if (wr.playerOne.id === "" && wr.playerTwo.id === "") {
            console.log("room empty");
            const roomId = this.codeGenerator(5);
            //let roomId = "abcdef";
            wr.roomId = roomId;
            wr.playerOne.id = player.id;
            wr.playerOne.socket = player.socket;
            wr.playerOne.roomId = roomId;
			wr.playerOne.level = String(level);
            this.players[player.id].roomId = wr.roomId;
        }
        // Waiting room has 1 player
        else if (wr.playerOne.id !== "" && wr.playerTwo.id === "") {
            console.log("room waiting");
            wr.playerTwo.id = player.id;
            wr.playerTwo.socket = player.socket;
            wr.playerTwo.roomId = wr.roomId;
			wr.playerTwo.level = level;
            this.players[player.id].roomId = wr.roomId;
            // Waiting room has 2 players
            if (wr.playerOne.id !== "" && wr.playerTwo.id !== "") {
                console.log("room complete");
                this.activeGames[wr.roomId] = {
                    playerOne: wr.playerOne,
                    playerTwo: wr.playerTwo,
                    level: level,
                }

                this.initGame(wr.roomId, server);

                // Reset waiting Rooms
				wr.roomId = "";
                wr.playerOne.id = "";
                wr.playerOne.socket = "";
                wr.playerOne.roomId = "";
				wr.playerOne.level = "0";
                wr.playerTwo.id = "";
                wr.playerTwo.socket = "";
                wr.playerTwo.roomId = "";
				wr.playerTwo.level = "0";
				wr.level = '0';
            }
        }
    }

    initGame(roomId: any, server: Server) {
        const gameRoom = this.activeGames[roomId];
		const level: number = gameRoom.level;
        const playerOne = gameRoom.playerOne.socket;
        const playerTwo = gameRoom.playerTwo.socket;

        playerOne.join(roomId);
        playerOne.emit("init", { playerNumber: 1, gameCode: roomId, level: gameRoom.level });
        playerTwo.join(roomId);
        playerTwo.emit("init", { playerNumber: 2, gameCode: roomId, level: gameRoom.level });

        const state = this.createGameState();
        state.players[0].id = gameRoom.playerOne.id;
        state.players[1].id = gameRoom.playerTwo.id;
        state.roomName = roomId;
        this.setPlayerState(state.players);
        gameRoom.state = state;
        server.to(roomId).emit("roomComplete", state);

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

    setPlayerState(players) {
        // if DEFAULT GAME
        players[0].speed = DEFAULT_PADDLE_SPEED;
        players[1].speed = DEFAULT_PADDLE_SPEED;

    }

    codeGenerator(length: number) {
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
        server.to(data.roomName).emit("launchBall", state);
    }

    initBall(ball: Ball) {
        let dirx = 0;
        let diry = 0;
        while (Math.abs(dirx) <= 0.4 || Math.abs(dirx) >= 0.9) {
            const heading = this.randomNumberBetween(0, 2 * Math.PI);
            dirx = Math.cos(heading);
            diry = Math.sin(heading);
        }
        //ball.initialVelocity.x = dirx * DEFAULT_BALL_SPEED;
        //ball.initialVelocity.y = diry + DEFAULT_BALL_SPEED;
        ball.initialVelocity.x = dirx * 250;
        ball.initialVelocity.y = diry + 250;
    }

    randomNumberBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    handleMoveBall(client: Socket, data: any, server: Server) {
        client.to(data.roomName).emit("ballMoved", data);

    }

    handleAddPoint(client: Socket, data: any, server: Server) {
        let score = ++this.activeGames[data.roomName].state.players[data.player - 1].match_score;
        if (score === 3) {
            server.to(data.roomName).emit('gameResult', { winner: data.player });
        } else {
            server.to(data.roomName).emit('addPoint', { playerNumber: data.player, score });
        }
    }

    handleWatchGame(client: Socket, data: any, server: Server) {
        console.log("WATCH GANE");
		const roomName = data.roomName;
        //this.players[client.id].roomId = "abcdef"; // attention
        this.players[client.id].level = '0';
        this.players[client.id].spectator = true;
        if (this.activeGames["abcdef"]) {
            //client.join("abcdef");
			client.join(roomName);
            client.emit("upDateInfo", this.activeGames["abcdef"].state);
        }   
    }

    async handleDisconnect(client: Socket, server: Server) {
        const roomName = this.players[client.id].roomId;
        const level: string = this.players[client.id].level;

        if (this.players[client.id].spectator) {
            console.log("spectator disconnected");
            client.emit("leftGame", 1);
			this.players[client.id].roomId = "";
            this.players[client.id].spectator = false;
            //Reflect.deleteProperty(this.players, client.id);
            return;
        }

        if (this.activeGames[roomName]) {
            let connSockets = await server.in(roomName).fetchSockets();
            connSockets.forEach((s) => {
                s.emit("leftGame", 1);
                s.leave(roomName);
                //s.disconnect();
                this.players[s.id].level = '0';
                this.players[s.id].roomId = "";
            })
            Reflect.deleteProperty(this.activeGames, roomName);
            //Reflect.deleteProperty(this.players, client.id);
        } else if (this.players[client.id].level !== '0') {
            const wr = this.waitingRooms[level];

            if (wr.playerOne.id === client.id) {
                this.switchPlayers(wr.playerOne, wr.playerTwo, wr, 1);
            } else if (wr.playerTwo.id === client.id) {
                this.switchPlayers(null, null, wr, 2)
            }
        }
        Reflect.deleteProperty(this.players, client.id);
    }

    async handleQuitGame(client: Socket, server: Server) {
        const roomName = this.players[client.id].roomId;
        const level: string = this.players[client.id].level;
        
        if (this.players[client.id].spectator) {
            console.log("spectator left");
            //let connSockets = await server.in("abcdef").fetchSockets();
            console.log("1USERS " + connSockets);
            this.players[client.id].roomId = "";
            this.players[client.id].spectator = false;
            //client.leave("abcdef");
			client.leave(roomName);
			//client.disconnect();
            client.emit("leftGame", 2);
            console.log("2USERS " + connSockets);
			//Reflect.deleteProperty(this.players, client.id);
            return;
        }

		//console.log("players1");
		//	console.log(this.players);
        
        if (this.activeGames[roomName]) {
            //console.log("HOLA1");
			//console.log("activeroom1");
			//console.log(this.activeGames[roomName]);
            let connSockets = await server.in(roomName).fetchSockets();
            connSockets.forEach((s) => {
                s.emit("leftGame", 2);
                s.leave(roomName);
                //s.disconnect();
				//Reflect.deleteProperty(this.players, s.id);
                this.players[s.id].level = '0';
                this.players[s.id].roomId = "";
            })
            Reflect.deleteProperty(this.activeGames, roomName);
			//console.log("activeroom2");
			//console.log(this.activeGames[roomName]);
        } else if (this.players[client.id].level !== '0') {
            //console.log("HOLA2");
            const wr = this.waitingRooms[level];
			//console.log('waitingRoom1');
			//console.log(wr);

            if (wr.playerOne.id === client.id) {
                this.switchPlayers(wr.playerOne, wr.playerTwo, wr, 1);
            } else if (wr.playerTwo.id === client.id) {
                this.switchPlayers(null, null, wr, 2);
            }

			//console.log('waitingRoom2');
			//console.log(wr);
			this.players[client.id].level = '0';
			this.players[client.id].roomId = "";
			this.players[client.id].spectator = false;
			client.emit("leftGame", 2);
			//Reflect.deleteProperty(this.players, client.id);
			//client.disconnect();
        }
		//console.log("players2");
		//	console.log(this.players);
    }

    switchPlayers(playerOne, playerTwo, wr, n) {
        if (n === 1) {
			wr.roomId = wr.playerTwo.roomId;
            wr.playerOne.id = wr.playerTwo.id;
            wr.playerOne.socket = wr.playerTwo.socket;
            wr.playerOne.roomId = wr.playerTwo.roomId;
            wr.playerOne.level = wr.playerTwo.level;
        } else {
            wr.playerTwo.id = "";
            wr.playerTWo.socket = "";
            wr.playerTwo.roomId = "";
            wr.playerTwo.level = '0';
        }

    }

    handleRematch(client: Socket, data: any, server: Server) {
        server.to(data.roomName).emit("rematch");
    }

	handleMoveAnim(client: Socket, data: any, server: Server) {
		client.to(data.roomName).emit("animMoved", data);
	}

}



