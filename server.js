
//importing the express module
var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 3000);
app.use(express.static('public'));

console.log("server is running");

var socket = require('socket.io');
var io = socket(server); //keep track of inputs and outputs to the server
io.sockets.on('connection', newConnection);

//dictionary containing players for each connection
var players = {}; // This is a dictionary where the keys are the socket ids and the value is a player object
var bullets = [];
var platforms = [];
var walls = [];
var deadPlayers = [];
//let startTime = second();
var map = 2;
var updateTimer = null;
var gameTime = 0;
var mapWidth = 3600
var teamMode = true;
var teamNumber = 0;
var team1Kills = 0;
var team2Kills = 0;

setInterval(function(){
	gameTime++;
}, 100)

if (map == 1){
	platforms.push(new Platform(0, 500, 300, 20, 0));
	platforms.push(new Platform(900, 500, 300, 20, 0));
	platforms.push(new Platform(300, 370, 200, 20, 0));
	platforms.push(new Platform(550, 350, 100, 20, 3));
	platforms.push(new Platform(700, 370, 200, 20, 0));
	platforms.push(new Platform(200, 200, 350, 20, 0));
	platforms.push(new Platform(650, 200, 350, 20, 0));
	platforms.push(new Platform(0, 310, 100, 20, 0));
	platforms.push(new Platform(1100, 310, 100, 20, 0));
	platforms.push(new Platform(1200, 500, 300, 20, 0));
	platforms.push(new Platform(2100, 500, 300, 20, 0));
	platforms.push(new Platform(1500, 370, 200, 20, 0));
	platforms.push(new Platform(1750, 350, 100, 20, 3));
	platforms.push(new Platform(1900, 370, 200, 20, 0));
	platforms.push(new Platform(1400, 200, 350, 20, 0));
	platforms.push(new Platform(1850, 200, 350, 20, 0));
	platforms.push(new Platform(1200, 310, 100, 20, 0));
	platforms.push(new Platform(2300, 310, 100, 20, 0));
	bullets.push(new Bullet(2 + 5, 600 + 15, 18, 12, "left", 12, 15, "BLUE", "blast", 0))
} else if (map == 2){
	platforms.push(new Platform(0, 500, 300, 20, 0));
	platforms.push(new Platform(900, 500, 300, 20, 0));
	platforms.push(new Platform(300, 370, 200, 20, 0));
	platforms.push(new Platform(550, 350, 100, 20, 3));
	platforms.push(new Platform(700, 370, 200, 20, 0));
	platforms.push(new Platform(200, 200, 350, 20, 0));
	platforms.push(new Platform(650, 200, 350, 20, 0));
	platforms.push(new Platform(0, 310, 100, 20, 0));
	platforms.push(new Platform(1100, 310, 100, 20, 0));
	// mirror
	platforms.push(new Platform(1500, 500, 600, 20, 0));
	platforms.push(new Platform(1400, 500, 100, 20, 2));
	platforms.push(new Platform(2100, 500, 100, 20, -2));
	platforms.push(new Platform(1500, 100, 200, 20, 0.5));
	platforms.push(new Platform(1900, 300, 200, 20, -0.5));
	platforms.push(new Platform(2200, 200, 200, 20, 0.5));
	platforms.push(new Platform(1200, 350, 200, 20, -0.5));
	platforms.push(new Platform(1700, 50, 200, 20, 0.2));
	bullets.push(new Bullet(2 + 5, 600 + 15, 18, 12, "left", 12, 15, "BLUE", "blast", 0))
	// third part
	platforms.push(new Platform(2400, 500, 300, 20, 0));
	platforms.push(new Platform(3300, 500, 300, 20, 0));
	platforms.push(new Platform(2700, 370, 200, 20, 0));
	platforms.push(new Platform(2950, 350, 100, 20, 3));
	platforms.push(new Platform(3100, 370, 200, 20, 0));
	platforms.push(new Platform(2600, 200, 350, 20, 0));
	platforms.push(new Platform(3050, 200, 350, 20, 0));
	platforms.push(new Platform(2400, 310, 100, 20, 0));
	platforms.push(new Platform(3500, 310, 100, 20, 0));
}

function newConnection(socket) {
	console.log('new connection: ' + socket.id);
	socket.on('disconnect', () => {	
		console.log('lost connection: ' + socket.id);
		delete(players[socket.id]);
  	});
	
	socket.on('key', keyMsg);
	socket.on('shoot', bulletTravel);
	socket.on('username', processUsername);
	
	io.to(socket.id).emit("teamMode", teamMode)

	function keyMsg(key){ //data is the key pressed
		if(Object.keys(players).indexOf(socket.id) != -1){
			players[socket.id].move(key);
			io.sockets.emit('players',players);
		// socket.broadcast.emit('key', data); // this sends to everyone minus the client that sent the message
		}
	}

	function bulletTravel(abilityKey){
		if (Object.keys(players).indexOf(socket.id) != -1){
			// Tank Abilities
			if (players[socket.id].class == "tank" && players[socket.id].canShoot && abilityKey == 74 && players[socket.id].stun == false){
				if(players[socket.id].dir == "left" || players[socket.id].dir == "right"){
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y, 10, 10, players[socket.id].dir, socket.id, 7, "PEACH", "scatter", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 10, 10, players[socket.id].dir, socket.id, 9, "PEACH", "scatter", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 30, 10, 10, players[socket.id].dir, socket.id, 7, "PEACH", "scatter", players[socket.id].team);
					bullets.push(b);
				} else {
					b = new Bullet(players[socket.id].x - 10, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 7, "PEACH", "scatter", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 9, "PEACH", "scatter", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 20, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 7, "PEACH", "scatter", players[socket.id].team);
					bullets.push(b);
				}
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 7;
				players[socket.id].canShootCooldown = gameTime;
			} else if (players[socket.id].class == "tank" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				players[socket.id].hp += 40
				players[socket.id].canAbility1 = false;
				players[socket.id].a1Time = 60;
				players[socket.id].canAbility1Cooldown = gameTime;
			} else if (players[socket.id].class == "tank" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				walls.push(new Wall(players[socket.id].x + 10, players[socket.id].y, 15, 50, socket.id, players[socket.id].dir));
				players[socket.id].wall = true;
				players[socket.id].wallTime = 30;
				players[socket.id].wallCooldown = gameTime;
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 80;
				players[socket.id].canAbility2Cooldown = gameTime;
			} else if (players[socket.id].class == "tank" && players[socket.id].canUltimate && abilityKey == 72 && players[socket.id].stun == false){
				players[socket.id].canUltimate = false;
				players[socket.id].ultTime = 150;
				players[socket.id].ultDurTime = 40;
				players[socket.id].canUltimateCooldown= gameTime;
				players[socket.id].ultimateDuration = gameTime;
			}
			//Assassin abilities
			if (players[socket.id].class == "assassin" && players[socket.id].canShoot && abilityKey == 74 && players[socket.id].stun == false){
				for (player in players){
					// retry this please fix this later
					if (players[player].x + 40>= players[socket.id].x && players[player].x - 20 <= players[socket.id].x + players[socket.id].width && players[player].y + 20 >= players[socket.id].y && players[player].y - 20 <=  players[socket.id].y + players[socket.id].height && player != socket.id){
						players[player].hp -= 30;
					}
				}
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 1;
				players[socket.id].canShootCooldown = gameTime;
			} else if (players[socket.id].class == "assassin" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 25, 12, players[socket.id].dir, socket.id, 30, "TEAL", "slow", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canAbility1 = false;
				players[socket.id].a1Time = 20;
				players[socket.id].canAbility1Cooldown = gameTime;
			} else if (players[socket.id].class == "assassin" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				players[socket.id].invis = true;
				players[socket.id].invisTime = 30
				players[socket.id].invisCooldown = gameTime;
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 100;
				players[socket.id].canAbility2Cooldown = gameTime;
			} else if (players[socket.id].class == "assassin" && players[socket.id].canUltimate && abilityKey == 72 && players[socket.id].stun == false){
				players[socket.id].xAcceleration = 12;
				players[socket.id].speedTime = 50;
				players[socket.id].speedCooldown = gameTime;
				players[socket.id].canUltimate = false;
				players[socket.id].ultTime = 120;
				players[socket.id].canUltimateCooldown = gameTime;
			} 
			//Mercenary Abilities
			if (players[socket.id].class == "mercenary" && players[socket.id].canShoot && abilityKey == 74 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 20, 5, players[socket.id].dir, socket.id, 25, (112,128,144), "bullet", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 1.5;
				players[socket.id].canShootCooldown = gameTime;
			}
			else if (players[socket.id].class == "mercenary" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 32, 35, 8, players[socket.id].dir, socket.id, -10, "PURPLE", "trap", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canAbility1 = false;
				players[socket.id].a1Time = 60;
				players[socket.id].canAbility1Cooldown = gameTime;
			}
			else if (players[socket.id].class == "mercenary" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				if(players[socket.id].dir == "left" || players[socket.id].dir == "right"){
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y, 10, 10, players[socket.id].dir, socket.id, 8, "ORANGE", "shotgun", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 10, 10, players[socket.id].dir, socket.id, 8, "ORANGE", "shotgun", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 30, 10, 10, players[socket.id].dir, socket.id, 8, "ORANGE", "shotgun", players[socket.id].team);
					bullets.push(b);
				} else {
					b = new Bullet(players[socket.id].x - 10, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 8, "ORANGE", "shotgun", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 8, "ORANGE", "shotgun", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 20, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 8, "ORANGE", "shotgun", players[socket.id].team);
					bullets.push(b);
				}
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 25;
				players[socket.id].canAbility2Cooldown = gameTime;
				if(players[socket.id].dir == "left"){
					players[socket.id].BASE -= -60;
					players[socket.id].x -= -60;
				} else if (players[socket.id].dir == "right"){
					players[socket.id].BASE += -60;
					players[socket.id].x += -60;
				} else if (players[socket.id].dir == "up"){
					players[socket.id].y -= -60;
				} else if (players[socket.id].dir == "down"){
					players[socket.id].y += -60;
				}
			} else if (players[socket.id].class == "mercenary" && players[socket.id].canUltimate && abilityKey == 72 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 5, 50, 25, players[socket.id].dir, socket.id, 30, "RED", "rocket", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canUltimate = false;
				players[socket.id].ultTime = 100;
				players[socket.id].canUltimateCooldown = gameTime;
			}
			// Spellslinger ABILITIES
			if (players[socket.id].class == "spellslinger" && players[socket.id].canShoot && abilityKey == 74 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 18, 12, players[socket.id].dir, socket.id, 18, "BLUE", "blast", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 4;
				players[socket.id].canShootCooldown = gameTime;
			}
			else if (players[socket.id].class == "spellslinger" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 20, 10, players[socket.id].dir, socket.id, 20, "YELLOW", "stun", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canAbility1 = false;
				players[socket.id].a1Time = 12;
				players[socket.id].canAbility1Cooldown = gameTime;
			}
			else if (players[socket.id].class == "spellslinger" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				if(players[socket.id].dir == "left"){
					players[socket.id].x -= 150;
					players[socket.id].BASE -= 150;
				} else if (players[socket.id].dir == "right"){
					players[socket.id].x += 150;
					players[socket.id].BASE += 150;
				} else if (players[socket.id].dir == "up"){
					players[socket.id].y -= 150;
				} else if (players[socket.id].dir == "down"){
					players[socket.id].y += 150;
				}
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 30;
				players[socket.id].canAbility2Cooldown = gameTime;
			}
			else if (players[socket.id].class == "spellslinger" && players[socket.id].canUltimate && abilityKey == 72 && players[socket.id].stun == false){
				if (players[socket.id].dir == "right"){
					b = new Bullet(players[socket.id].x + 20, players[socket.id].y - 10, mapWidth - players[socket.id].x, 60, players[socket.id].dir, socket.id, 0, "CYAN", "beam");
				} else if (players[socket.id].dir == "left"){
					b = new Bullet(0, players[socket.id].y - 10, players[socket.id].x, 60, players[socket.id].dir, socket.id, 0, "CYAN", "beam", players[socket.id].team);
				}
				else if (players[socket.id].dir == "down"){
					b = new Bullet(players[socket.id].x - 10, players[socket.id].y + 40, 60, 1200, players[socket.id].dir, socket.id, 0, "CYAN", "beam", players[socket.id].team);
				}
				else if (players[socket.id].dir == "up"){
					b = new Bullet(players[socket.id].x - 10, 0, 60, players[socket.id].y, players[socket.id].dir, socket.id, 0, "CYAN", "beam", players[socket.id].team);
				}
				bullets.push(b);
				players[socket.id].stun = true;
				players[socket.id].stunTime = 12;
				players[socket.id].stunCooldown2 = gameTime;
				players[socket.id].canUltimate = false;
				players[socket.id].ultTime = 180;
				players[socket.id].canUltimateCooldown= gameTime;
				players[socket.id].ultimateDuration = gameTime;
			}
		}
	}
	
	function processUsername(usernameList){
		// if(username == "") {
		// 	players[socket.id] = new Player(socket.id, "spellslinger");
		// } else if (username == "Merc") {
		// 	players[socket.id] = new Player(username, "mercenary");
		// } else if (username == "Assassin") {
		// 	players[socket.id] = new Player(username, "assassin");
		// } else if (username == "Tank") {
		// 	players[socket.id] = new Player(username, "tank");
		// } else {
		// 	players[socket.id] = new Player(username, "spellslinger");
		// }
		var username = usernameList[0];
		var characterClass = usernameList[1];
		var team = usernameList[2];
		if (username == ""){
			players[socket.id] = new Player(socket.id, characterClass, team)
		} else {
			players[socket.id] = new Player(username, characterClass, team)
		}
		io.sockets.emit('players',players);
		gameStart = true;
		if (updateTimer == null){
			updateTimer = setInterval(function(){
				update();
			}, 17)
		}
	}

	function update(){
		// Draw borders
		// update player position
		//console.log(deadPlayers);
		for (player in players){
			// Tank no stun
			if (gameTime - players[player].ultimateDuration < players[player].ultDurTime && players[player].class == "tank" && players[player].ultimateDuration != 0){
				players[player].stun = false;
				players[player].slow = false;
				players[player].slowCooldown = 0;
				players[player].stunCooldown = 0;
				players[player].stunCooldown2 = 0;
				players[player].hp += 0.5
			} else if (players[player].class == "tank" ) {
				players[player].ultimateDuration = 0;
			}
			//cooldowns for the mercenary
			if (gameTime - players[player].canShootCooldown > players[player].shootTime){
				players[player].canShoot = true;
			}
			if (gameTime - players[player].canAbility1Cooldown > players[player].a1Time){
				players[player].canAbility1 = true;
			}
			if (gameTime - players[player].canAbility2Cooldown > players[player].a2Time){
				players[player].canAbility2 = true;
			}
			if (gameTime - players[player].canUltimateCooldown > players[player].ultTime){
				players[player].canUltimate = true;
			}
			if (gameTime - players[player].stunCooldown > players[player].stunTime && players[player].stunCooldown != 0){
				players[player].stun = false;
				players[player].stunCooldown = 0
			} else if (gameTime - players[player].stunCooldown2 > players[player].stunTime && players[player].stunCooldown2 != 0){
				players[player].stun = false;
				players[player].stunCooldown2 = 0
			}

			if (gameTime - players[player].slowCooldown > players[player].slowTime && players[player].slowCooldown != 0){
				players[player].slow = false;
				players[player].xAcceleration = players[player].xOrigA;
				players[player].yAcceleration = players[player].yOrigA;
				players[player].slowCooldown = 0;
			}
			if (gameTime - players[player].invisCooldown > players[player].invisTime && players[player].invisCooldown != 0){
				players[player].invis = false;
				players[player].invisCooldown = 0;
			}
			if (gameTime - players[player].speedCooldown > players[player].speedTime && players[player].speedCooldown != 0){
				players[player].xAcceleration = players[player].xOrigA;
				players[player].speedCooldown = 0;
			}

			if (players[player].y + 40>= 540 && map == 2){
				players[player].hp -= 5;
			}
			if (players[player].hp < 0){
				players[player].hp = 0;
			} else if (players[player].hp > 100){
				players[player].hp = 100;
			}
			if (players[player].hp == 0) {
				console.log(bullets.length)
				for (var i = 0; i < bullets.length; i++) {
					if (bullets[i].type == "beam" && player == bullets[i].shooter){
						bullets.splice(i, 1)
					}
					else if (bullets[i].type == "trap" && player == bullets[i].shooter){
						bullets.splice(i, 1)
						console.log("RUN")
					}
				}
				for (var i = 0; i < bullets.length; i++) {
					if (bullets[i].type == "beam" && player == bullets[i].shooter){
						bullets.splice(i, 1)
					}
					else if (bullets[i].type == "trap" && player == bullets[i].shooter){
						bullets.splice(i, 1)
						console.log("RUN")
					}
				}
				for (var i = 0; i < walls.length; i++) {
					if (walls[i].user = socket.id){
						walls.splice(i, 1)
					}
				}
				players[player].deadTime = gameTime;
				deadPlayers.push(players[player]);
				console.log("THIS happened.")
				io.to(player).emit("dead", 1);
				delete players[player];
			}
		}
		for(player in deadPlayers){
			if (gameTime - deadPlayers[player].deadTime > 30){
				deadPlayers.splice(player, 1)
			}
		}


		// works now
		for (player in players){
			players[player].ySpeed -= 0.5;
			players[player].y -= players[player].ySpeed;
			if (players[player].stun == false){
				players[player].BASE -= players[player].xSpeed;
				players[player].x -= players[player].xSpeed;
			}
			if (players[player].x > mapWidth - players[player].width){
				players[player].x = mapWidth - players[player].width;
				players[player].BASE = mapWidth - players[player].width - 590;
			} else if (players[player].x < 0){
				players[player].x = 0;
				players[player].BASE = -590;
			}
			if (players[player].y < 0){
				players[player].y = 0
			} else if (players[player].y + players[player].height > 600){
				players[player].y = 600 - players[player].height;
				players[player].jump = true;
				players[player].secondJump = true;
			}
		}
		// dead player physics
		for (player in deadPlayers){
			deadPlayers[player].ySpeed -= 1;
			deadPlayers[player].y -= deadPlayers[player].ySpeed;
			deadPlayers[player].x -= deadPlayers[player].xSpeed;

			if (deadPlayers[player].x > mapWidth - deadPlayers[player].width){
				deadPlayers[player].x = mapWidth - deadPlayers[player].width;
			} else if (deadPlayers[player].x < 0){
				deadPlayers[player].x = 0;
			}
			if (deadPlayers[player].y < 0){
				deadPlayers[player].y = 0
			} else if (deadPlayers[player].y > 560){
				deadPlayers[player].y = 580;
				deadPlayers[player].jump = true;
			}
		}

		// platform collision and moving
		for (var i = 0; i < platforms.length; i++) {
			platforms[i].y += platforms[i].speed;
			if (platforms[i].y > 600 - platforms[i].height || platforms[i].y < 40) {
				platforms[i].speed = -platforms[i].speed;
			}
			for (player in players){
				if (players[player].x + 20 > platforms[i].x && players[player].x < platforms[i].x + platforms[i].width && players[player].y + players[player].height > platforms[i].y && players[player].y < platforms[i].y + platforms[i].height) {
					players[player].y = platforms[i].y - players[player].height;
					players[player].ySpeed = 0;
					players[player].jump = true;
					players[player].secondJump = true;
				}
			}
			for (player in deadPlayers){
				if (deadPlayers[player].x + 20 > platforms[i].x && deadPlayers[player].x < platforms[i].x + platforms[i].width && deadPlayers[player].y + 40 > platforms[i].y && deadPlayers[player].y < platforms[i].y + platforms[i].height) {
					deadPlayers[player].y = platforms[i].y - 20
					deadPlayers[player].ySpeed = 0;
					deadPlayers[player].jump = true;
				}
			}
		}

		var wallsToRemove = [];
		for (var i = 0; i < walls.length; i++) {
			for (player in players){
				if (gameTime - players[player].wallCooldown > players[player].wallTime && players[player].wallCooldown != 0){
					wallsToRemove.push(i);
					players[player].wallCooldown = 0;
				} else if (walls[i].user == player){
					if(walls[i].dir == "left"){
						walls[i].x = players[player].x - 35;
						walls[i].y = players[player].y - 10;
					} else if(walls[i].dir ==  "right"){
						walls[i].x = players[player].x + 45;
						walls[i].y = players[player].y - 10;
					} else if (walls[i].dir == "up") {
						walls[i].x = players[player].x - 15;
						walls[i].y = players[player].y - 20;
						walls[i].width = 50;
						walls[i].height = 15;
					} else {
						walls[i].x = players[player].x - 15;
						walls[i].y = players[player].y + 60;
						walls[i].width = 50;
						walls[i].height = 15;
					}
				}
				if (players[player].x + 20 > walls[i].x && players[player].x < walls[i].x + walls[i].width && players[player].y + players[player].height > walls[i].y && players[player].y < walls[i].y + walls[i].height) {
					if(players[player].y + 20 < walls[i].y){
						players[player].y = walls[i].y - players[player].height;
						players[player].ySpeed = 0;
					} else if (players[player].x + 10 < walls[i].x) {
						players[player].x = walls[i].x - players[player].width;
						players[player].BASE = walls[i].x - players[player].width - 590
					} else if (players[player].x > walls[i].x + walls[i].width - 10) {
						players[player].x = walls[i].x + walls[i].width;
						players[player].BASE = walls[i].x + walls[i].width - 590;
					}
					players[player].jump = true;
					players[player].secondJump = true;
				}
			}
		}
		for (var i = wallsToRemove.length; i > 0; i--){
			walls.splice(wallsToRemove[i], 1);
		}

		
		var bulletsToRemove = [];
		for (var i = 0; i < bullets.length; i++) {
			for (var j = 0; j < walls.length; j++) {
				if (walls[j].x + walls[j].width> bullets[i].x && walls[j].x < bullets[i].x + bullets[i].width && walls[j].y + walls[j].height > bullets[i].y && walls[j].y <  bullets[i].y + bullets[i].height && bullets[i].type != "beam" && bullets[i].shooter != walls[j].user){
					bulletsToRemove.push(i);
				}

			}
			if (bullets[i].type == "trap"){
				bullets[i].y -= bullets[i].speed;
				if (bullets[i].y > 592){
					bullets[i].y = 592;
				}
				for (var j = 0; j < platforms.length; j++) {
					if (bullets[i].x + 20 > platforms[j].x && bullets[i].x < platforms[j].x + platforms[j].width && bullets[i].y + bullets[i].height > platforms[j].y && bullets[i].y < platforms[j].y + platforms[j].height) {
						bullets[i].y = platforms[j].y - bullets[i].height;
					}
				}
			} else{
				bullets[i].move();
			}

			if (checkRemove(bullets[i])){
				bulletsToRemove.push(i);
			}
			// check hit
			for (player in players){
				if (gameTime - players[player].ultimateDuration > 12 && bullets[i].type == "beam" && gameTime - players[player].ultimateDuration < 14 && player == bullets[i].shooter && players[player].ultimateDuration != 0){
					bulletsToRemove.push(i);
				}
				if (players[player].x + players[player].width > bullets[i].x && players[player].x < bullets[i].x + bullets[i].width && players[player].y + 40 > bullets[i].y && players[player].y <  bullets[i].y + bullets[i].height && player != bullets[i].shooter && players[player].team != bullets[i].team){
					// Tank detection
					if (bullets[i].type == "scatter"){ 
						players[player].hp -= 14;
						bulletsToRemove.push(i);
					}
					// assassin detection
					if (bullets[i].type == "slow"){
						players[player].hp -= 20;
						players[player].yAcceleration = players[player].yAcceleration/2;
						players[player].xAcceleration = players[player].xAcceleration/2;
						bulletsToRemove.push(i);
						players[player].slow = true;
						players[player].slowTime = 30;
						players[player].slowCooldown = gameTime;
					}
					
					// mercenary detection
					if (bullets[i].type == "bullet"){ 
						players[player].hp -= 12;
						bulletsToRemove.push(i);
					}
					else if (bullets[i].type == "trap"){ 
						players[player].hp -= 10;
						players[player].stun = true;
						players[player].stunTime = 12
						players[player].stunCooldown2 = gameTime;
						bulletsToRemove.push(i);
					}
					else if (bullets[i].type == "shotgun"){ 
						players[player].hp -= 15;
						bulletsToRemove.push(i);
					} else if (bullets[i].type == "rocket"){ 
						players[player].hp -= 40;
						bulletsToRemove.push(i);
						if(bullets[i].dir == "left"){
							players[player].x -= 80;
							players[player].BASE -= 80;
						} else if (bullets[i].dir == "right"){
							players[player].x += 80;
							players[player].BASE += 80;
						} else if (bullets[i].dir == "up"){
							players[player].y -= 80;
						} else if (bullets[i].dir == "down"){
							players[player].y += 80;
						}
					}
					// spellslinger detection
					if (bullets[i].type == "blast"){ 
						players[player].hp -= 20;
						bulletsToRemove.push(i);
					}
					else if (bullets[i].type == "stun"){ 
						players[player].hp -= 10;
						players[player].stun = true;
						players[player].stunTime = 7;
						players[player].stunCooldown = gameTime;
						bulletsToRemove.push(i);
					}
					else if (bullets[i].type == "beam"){ 
						players[player].hp -= 1.5;
					}
					if (players[player].hp <= 0){
						if (players[bullets[i].shooter] == undefined){
							if (bullets[i].team == 1){
								team1Kills += 1;
							} else if (bullets[i].team == 2){
								team2Kills += 1;
							}
						} else{
							players[bullets[i].shooter].kills += 1;
							if (players[bullets[i].shooter].team == 1){
								team1Kills += 1;
							} else if (players[bullets[i].shooter].team == 2){
								team2Kills += 1;
							}
						}
					}
				}
			}
		}
		for (var i = bulletsToRemove.length -1; i > 0; i--){
			bullets.splice(bulletsToRemove[i], 1);
		}

		io.sockets.emit('returnUpdate', [bullets, players, platforms, deadPlayers, map, gameTime, walls, team1Kills, team2Kills]);
	}
}
function Bullet(x, y, width, height, dir, shooter, speed, colour, type, team) {
	this.shooter = shooter;
	this.team = team;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.speed = speed;
	this.dir = dir;
	this.colour = colour;
	this.type = type;
	if (this.type != "trap"){
		this.move = function(){
			if(this.dir == "up"){
				this.y -= this.speed;
			} else if (this.dir == "down") {	
				this.y += this.speed;
			} else if (this.dir == "left") {
				this.x -= this.speed;
			} else if (this.dir == "right") {
				this.x += this.speed;
			}
		}
	}
}

function checkRemove(bullet){
	if (bullet.x > mapWidth || bullet.x < 0 || bullet.y > 600 || bullet.y < 0){
		return true;
	} else{
		return false;
	}
}

function Player(username, chosenClass, team){
	if (teamMode == false){
		this.x = Math.floor(Math.random() * 3580) + 1;
		this.y = 20;
		this.team = teamNumber;
		teamNumber++;
	} else {
		this.team = team;
		if (this.team == 1){
			this.x = Math.floor(Math.random() * 1180) + 2401;
		} else {
			this.x = Math.floor(Math.random() * 1180);
		}
		this.y = 20;
	}
	this.BASE = this.x - 590;
	this.dir = "up";
	this.height = 40;
	this.width = 20;
	this.ySpeed = 0;
	this.xSpeed = 0;
	if (chosenClass == "assassin"){
		this.yOrigA = 10
		this.xOrigA = 8
	} else{
		this.yOrigA = 10
		this.xOrigA = 6
	}
	this.yAcceleration = this.yOrigA;
	this.xAcceleration = this.xOrigA;
	this.hp = 100;
	this.kills = 0;
	this.jump = true;
	this.secondJump = true;
	this.username = username;
	this.canShoot = true;
	this.a1Time = 0;
	this.a2Time = 0;
	this.shootTime = 0;
	this.ultTime = 0;
	this.ultDurTime = 0;
	this.stunTime = 0;
	this.slowTime = 0;
	this.speedTime = 0;
	this.wallTime = 0;
	this.canAbility1 = true;
	this.canAbility2 = true;
	this.canUltimate = true;
	this.class = chosenClass;
	this.stun = false;
	this.slow = false;
	this.wall = false;
	this.canShootCooldown = 0;
	this.canAbility1Cooldown = 0;
	this.canAbility2Cooldown = 0;
	this.stunCooldown = 0;
	this.stunCooldown2 = 0;
	this.slowCooldown = 0;
	this.speedCooldown = 0;
	this.wallCooldown = 0;
	this.canUltimateCooldown = 0;
	this.ultimateDuration = 0;
	this.deadTime = 0;

	this.move = function(dir){
		if(dir == "up" && this.jump == true && this.stun == false){
			this.jump = false;
			this.ySpeed = this.yAcceleration;
			this.dir = "up";
			this.height = 40;
		} else if(dir == "up" && this.secondJump == true && this.stun == false){
			this.secondJump = false;
			this.ySpeed = this.yAcceleration;
			this.dir = "up";
			this.height = 40;
		}
		if (dir == "left") {
			this.xSpeed = this.xAcceleration;
			this.dir = "left";
			this.height = 40;
		} else if (dir == "right") {
			this.xSpeed = -this.xAcceleration;
			this.dir = "right";
			this.height = 40;
		} else if (dir == "down") {
			this.dir = "down";
			this.height = 25;
		} else {
			this.xSpeed = 0;
			this.height = 40;
		}
	}
}

function Platform(x, y, width, height, speed) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.speed = speed;
}

function Wall(x, y, width, height, user, dir){
	this.user = user;
	this.x = x;
	this.y = y;
	this.dir = dir;
	this.width = width;
	this.height = height;
}