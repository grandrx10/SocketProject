
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
var healBoxes = [];
//let startTime = second();
var map = 2;
var updateTimer = null;
var gameTime = 0;
var mapWidth = 6000;
var mapHeight = 1200;
var mapDeathWall = 0;
var teamMode = "survival";
var survivalCount = 0;
var winnerDecided = 0;
var winner = "none"
var currentJugg = false;
var teamNumber = 0;
var team1Kills = 0;
var team2Kills = 0;
var healGot = true;
var n = 0;
var killer =0;
var minionCount = 0;
var killing = ["none", "none", "none"];
var killed = ["none", "none", "none"];


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
	// mirror
	platforms.push(new Platform(3900, 500, 600, 20, 0));
	platforms.push(new Platform(3800, 500, 100, 20, 2));
	platforms.push(new Platform(4500, 500, 100, 20, -2));
	platforms.push(new Platform(3900, 100, 200, 20, 0.5));
	platforms.push(new Platform(4300, 300, 200, 20, -0.5));
	platforms.push(new Platform(4600, 200, 200, 20, 0.5));
	platforms.push(new Platform(3600, 350, 200, 20, -0.5));
	platforms.push(new Platform(4100, 50, 200, 20, 0.2));
	// third part
	platforms.push(new Platform(4800, 500, 300, 20, 0));
	platforms.push(new Platform(5700, 500, 300, 20, 0));
	platforms.push(new Platform(5100, 370, 200, 20, 0));
	platforms.push(new Platform(5350, 350, 100, 20, 3));
	platforms.push(new Platform(5500, 370, 200, 20, 0));
	platforms.push(new Platform(5000, 200, 350, 20, 0));
	platforms.push(new Platform(5450, 200, 350, 20, 0));
	platforms.push(new Platform(4800, 310, 100, 20, 0));
	platforms.push(new Platform(5900, 310, 100, 20, 0));


	platforms.push(new Platform(0, 800, 1000, 20, 0));
	platforms.push(new Platform(mapWidth - 1000, 800, 1000, 20, 0));

	platforms.push(new Platform(1500, 800, 800, 20, 0));
	platforms.push(new Platform(mapWidth - 2300, 800, 800, 20, 0));

	platforms.push(new Platform(2600, 800, 300, 20, 0));
	platforms.push(new Platform(3100, 800, 300, 20, 0));

	platforms.push(new Platform(1000, 900, 400, 20, 0.7));
	platforms.push(new Platform(mapWidth - 1000, 900, 400, 20, 0.7));

	platforms.push(new Platform(2400, 900, 500, 20, 0.3));
	platforms.push(new Platform(mapWidth - 2900, 900, 500, 20, 0.3));

	var healLocationX = [1785, 900, 2700, 4185, 3300,5100]
	var healLocationY = [400, 100, 100, 400, 100, 100]
} else if (map == 3){
	walls.push(new Wall(0, 1000, 6000, 40));
	var healLocationX = [1785, 900, 2700, 4185, 3300,5100]
	var healLocationY = [400, 100, 100, 400, 100, 100]
}

function newConnection(socket) {
	socket.on('disconnect', () => {	
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
			// watcher
			if (players[socket.id].class == "watcher" && players[socket.id].canShoot && abilityKey == 74 && players[socket.id].stun == false && players[socket.id].invinc != true){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 20, 30, 10, players[socket.id].dir, socket.id, 30, "green", "slowDart", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 4;
				players[socket.id].canShootCooldown = gameTime;
			}else if (players[socket.id].class == "watcher" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				players[minionCount] = new Player(players[socket.id].username, "watcherClone", players[socket.id].team)
				players[minionCount].team = players[socket.id].team
				players[minionCount].x = players[socket.id].x
				players[minionCount].y = players[socket.id].y
				players[minionCount].hp = players[socket.id].hp
				players[minionCount].owner = socket.id;
				if (players[socket.id].dir == "left" || players[socket.id].dir == "up"){
					players[minionCount].xSpeed = 6
					minionCount ++;
				} else {
					players[minionCount].xSpeed = -6
					minionCount ++;
				}
				players[socket.id].canAbility1 = false
				players[socket.id].a1Time = 60;
				players[socket.id].canAbility1Cooldown = gameTime;
			} else if (players[socket.id].class == "watcher" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				players[socket.id].invis = true;
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 100;
				players[socket.id].canAbility2Cooldown = gameTime;
			} else if (players[socket.id].class == "watcher" && players[socket.id].canUltimate && abilityKey == 72 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 10, 40, 20, players[socket.id].dir, socket.id, 40, "yellow", "megaStun", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canUltimate = false;
				players[socket.id].ultTime = 150;
				players[socket.id].canUltimateCooldown = gameTime;
			} 
			// ancient evil
			if (players[socket.id].class == "ae" && players[socket.id].canShoot && abilityKey == 74 && players[socket.id].stun == false && players[socket.id].invinc != true){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 28, 15, players[socket.id].dir, socket.id, 18, "#fae", "boomerang", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 6;
				players[socket.id].canShootCooldown = gameTime;
			} else if (players[socket.id].class == "ae" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 30, 10, players[socket.id].dir, socket.id, 24, "rgb(225, 54, 255)", "evilFarm", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canAbility1 = false;
				players[socket.id].a1Time = 30;
				players[socket.id].canAbility1Cooldown = gameTime;
			} else if (players[socket.id].class == "ae" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				players[socket.id].jump = true;
				players[socket.id].secondJump = true;
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 70 - players[socket.id].evil * 0.2;
				players[socket.id].canAbility2Cooldown = gameTime;
			} else if (players[socket.id].class == "ae" && players[socket.id].canUltimate && abilityKey == 72 && players[socket.id].stun == false){
				players[socket.id].xAcceleration = 10;
				players[socket.id].invincTime = 30 + players[socket.id].evil * 0.2;
				players[socket.id].invinc = true;
				players[socket.id].invincCooldown = gameTime;
				players[socket.id].speedTime = 30 + players[socket.id].evil * 0.2;
				players[socket.id].speedCooldown = gameTime;
				players[socket.id].canUltimate = false;
				players[socket.id].ultTime = 200 - players[socket.id].evil * 0.2;
				players[socket.id].canUltimateCooldown = gameTime;
			} 
			//time traveller
			if (players[socket.id].class == "tt" && players[socket.id].canShoot && abilityKey == 74 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 28, 15, players[socket.id].dir, socket.id, 18, "white", "timeShot", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 5;
				players[socket.id].canShootCooldown = gameTime;
			} else if (players[socket.id].class == "tt" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 25, 10, players[socket.id].dir, socket.id, 30, "pink", "timeMark", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canAbility1 = false;
				players[socket.id].a1Time = 30;
				players[socket.id].canAbility1Cooldown = gameTime;
			} else if (players[socket.id].class == "tt" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 5, 15, 30, players[socket.id].dir, socket.id, 25, "CYAN", "timeShift", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 40;
				players[socket.id].canAbility2Cooldown = gameTime;
			} else if (players[socket.id].class == "tt" && players[socket.id].canUltimate && abilityKey == 72 && players[socket.id].hp > 0){
				players[socket.id].x = players[socket.id].pastX
				players[socket.id].y = players[socket.id].pastY
				players[socket.id].hp = 100
				players[socket.id].canUltimate = false;
				players[socket.id].ultTime = 150;
				players[socket.id].canUltimateCooldown= gameTime;
			}
			//necro abilities
			if (players[socket.id].class == "necro" && players[socket.id].canShoot && abilityKey == 74 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 20, 12, players[socket.id].dir, socket.id, 22, "purple", "necroShot", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 6;
				players[socket.id].canShootCooldown = gameTime;
				for (player in players){
					if (players[player].class == "none" && players[player].owner == socket.id){
						b = new Bullet(players[player].x + 5, players[player].y + 15, 20, 12, players[socket.id].dir, socket.id, 22, "purple", "necroShot", players[player].team);
						bullets.push(b);
					}
				}
			} else if (players[socket.id].class == "necro" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 20, 20, players[socket.id].dir, socket.id, 25, "yellow", "necroStun", players[socket.id].team);
				bullets.push(b);
				for (player in players){
					if (players[player].class == "none" && players[player].owner == socket.id){
						b = new Bullet(players[player].x + 5, players[player].y + 15, 20, 20, players[socket.id].dir, socket.id, 25, "yellow", "necroStun", players[socket.id].team);
						bullets.push(b);
					}
				}
				players[socket.id].canAbility1 = false;
				players[socket.id].a1Time = 30;
				players[socket.id].canAbility1Cooldown = gameTime;
			} else if (players[socket.id].class == "necro" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				players[minionCount] = new Player("Minion", "none", players[socket.id].team)
				players[minionCount].team = players[socket.id].team
				players[minionCount].x = players[socket.id].x
				players[minionCount].y = players[socket.id].y
				players[minionCount].hp = 50
				players[minionCount].owner = socket.id;
				if (players[socket.id].dir == "left" || players[socket.id].dir == "up"){
					players[minionCount].xSpeed = 5
					minionCount ++;
				} else {
					players[minionCount].xSpeed = -5
					minionCount ++;
				}
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 60;
				players[socket.id].canAbility2Cooldown = gameTime;
			} else if (players[socket.id].class == "necro" && players[socket.id].canUltimate && abilityKey == 72 && players[socket.id].stun == false){
				for (player in players){
					if (players[player].class == "none" && players[player].owner == socket.id){
						b = new Bullet(players[player].x - 100, players[player].y + 25, 220, 15, players[socket.id].dir, socket.id, 0, "RED", "pool", players[socket.id].team);
						bullets.push(b);
						players[player].stun = true;
						players[player].stunTime = 15;
						players[player].stunCooldown = gameTime;
					}
				}
				players[socket.id].canUltimate = false;
				players[socket.id].ultTime = 150;
				players[socket.id].canUltimateCooldown= gameTime;
				players[socket.id].ultimateDuration = gameTime;
			}
			//jugg Abilities
			if (players[socket.id].class == "juggernaut" && players[socket.id].canShoot && abilityKey == 74 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 30, 15, players[socket.id].dir, socket.id, 20, "RED", "juggRound", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 3;
				players[socket.id].canShootCooldown = gameTime;
			} else if (players[socket.id].class == "juggernaut" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				if(players[socket.id].dir == "left" || players[socket.id].dir == "right"){
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y, 10, 10, players[socket.id].dir, socket.id, 7, "GRAY", "juggShot", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 10, 10, players[socket.id].dir, socket.id, 9, "GRAY", "juggShot", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 30, 10, 10, players[socket.id].dir, socket.id, 7, "GRAY", "juggShot", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y, 10, 10, players[socket.id].dir, socket.id, 10, "GRAY", "juggShot", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 10, 10, players[socket.id].dir, socket.id, 12, "GRAY", "juggShot", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 30, 10, 10, players[socket.id].dir, socket.id, 10, "GRAY", "juggShot", players[socket.id].team);
					bullets.push(b);
				} else {
					b = new Bullet(players[socket.id].x - 10, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 7,"GRAY", "juggShot", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 9, "GRAY", "juggShot", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 20, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 7, "GRAY", "juggShot", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x - 10, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 10,"GRAY", "juggShot", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 12, "GRAY", "juggShot", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 20, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 10, "GRAY", "juggShot", players[socket.id].team);
					bullets.push(b);
				}
				players[socket.id].canAbility1 = false;
				players[socket.id].a1Time = 30;
				players[socket.id].canAbility1Cooldown = gameTime;
			} else if (players[socket.id].class == "juggernaut" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				players[socket.id].xAcceleration = 10;
				players[socket.id].speedTime = 30;
				players[socket.id].speedCooldown = gameTime;
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 60;
				players[socket.id].canAbility2Cooldown = gameTime;
			} else if (players[socket.id].class == "juggernaut" && players[socket.id].canUltimate && abilityKey == 72 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y - 20, 20, 100, players[socket.id].dir, socket.id, 40, "RED", "juggKill", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canUltimate = false;
				players[socket.id].ultTime = 160;
				players[socket.id].canUltimateCooldown = gameTime;
			}
			//deadeye Abilities
			if (players[socket.id].class == "deadeye" && players[socket.id].canShoot && abilityKey == 74 && players[socket.id].stun == false && players[socket.id].ammo > 0){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 23, 14, players[socket.id].dir, socket.id, 24, "ORANGE", "revolver", players[socket.id].team);
				bullets.push(b);
				players[socket.id].ammo --;
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 1.5;
				players[socket.id].canShootCooldown = gameTime;
			} 
			else if (players[socket.id].class == "deadeye" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				players[socket.id].xAcceleration = 10;
				players[socket.id].speedTime = 15;
				players[socket.id].speedCooldown = gameTime;
				players[socket.id].ammo = 6;
				players[socket.id].canAbility1 = false;
				players[socket.id].a1Time = 40;
				players[socket.id].canAbility1Cooldown = gameTime;
			} else if (players[socket.id].class == "deadeye" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x, players[socket.id].y + 25, 15, 15, players[socket.id].dir, socket.id, 8, "BLUE", "teleport", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 90;
				players[socket.id].canAbility2Cooldown = gameTime;
			} else if (players[socket.id].class == "deadeye" && players[socket.id].canAbility2 != true && abilityKey == 76 && players[socket.id].stun == false){
				for (var i = 0; i < bullets.length; i++) {
					if (bullets[i].shooter == socket.id && bullets[i].type == "teleport"){
						players[socket.id].x = bullets[i].x
						players[socket.id].BASE = bullets[i].x - 590
						players[socket.id].y = bullets[i].y - 25
						bullets.splice(i, 1);
					}
				}
			}else if (players[socket.id].class == "deadeye" && players[socket.id].canUltimate && abilityKey == 72 && players[socket.id].stun == false){
				players[socket.id].canUltimate = false;
				players[socket.id].ultTime = 180;
				players[socket.id].ultDurTime = 9;
				players[socket.id].canUltimateCooldown= gameTime;
				players[socket.id].ultimateDuration = gameTime;
			}
			// Doc abilities
			if (players[socket.id].class == "doc" && players[socket.id].canShoot && abilityKey == 74 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 30, 15, players[socket.id].dir, socket.id, 20, "RED", "lifesteal", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 6;
				players[socket.id].canShootCooldown = gameTime;
			} else if (players[socket.id].class == "doc" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 5, 10, 25, players[socket.id].dir, socket.id, 22, "YELLOW", "snipe", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canAbility1 = false;
				players[socket.id].a1Time = 40;
				players[socket.id].canAbility1Cooldown = gameTime;
			} else if (players[socket.id].class == "doc" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x, players[socket.id].y - 30, 20, 20, players[socket.id].dir, socket.id, 0, "GREEN", "healing", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 50;
				players[socket.id].canAbility2Cooldown = gameTime;
			} else if (players[socket.id].class == "doc" && players[socket.id].canUltimate && abilityKey == 72 && players[socket.id].stun == false){
				// not work
				b = new Bullet(players[socket.id].x - 100, players[socket.id].y + 25, 220, 15, players[socket.id].dir, socket.id, 0, "GREEN", "ultrahealing", players[socket.id].team);
				bullets.push(b);
				players[socket.id].stun = true;
				players[socket.id].stunTime = 15;
				players[socket.id].stunCooldown = gameTime;
				players[socket.id].canUltimate = false;
				players[socket.id].ultTime = 150;
				players[socket.id].canUltimateCooldown= gameTime;
				players[socket.id].ultimateDuration = gameTime;
			}
			// huntsman Abilities
			if (players[socket.id].class == "huntsman" && players[socket.id].canShoot && abilityKey == 74 && players[socket.id].stun == false){
				if(players[socket.id].dir == "left" || players[socket.id].dir == "right"){
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 10, 10, players[socket.id].dir, socket.id, 8, "BLUE", "pulse", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y +  10, 10, 20, players[socket.id].dir, socket.id, 9, "BLUE", "pulse", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 5, 10, 30, players[socket.id].dir, socket.id, 10, "BLUE", "pulse", players[socket.id].team);
					bullets.push(b);
				} else {
					b = new Bullet(players[socket.id].x  + 5, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 8, "BLUE", "pulse", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x, players[socket.id].y +5, 10, 20, players[socket.id].dir, socket.id, 9, "BLUE", "pulse", players[socket.id].team);
					bullets.push(b);
					b = new Bullet(players[socket.id].x - 5, players[socket.id].y +5, 10, 30, players[socket.id].dir, socket.id, 10, "BLUE", "pulse", players[socket.id].team);
					bullets.push(b);
				}
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 12;
				players[socket.id].canShootCooldown = gameTime;
			} else if (players[socket.id].class == "huntsman" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				for (player in players){
					// retry this please fix this later
					if (players[player].x + players[player].height>= players[socket.id].x && players[player].x - 20 <= players[socket.id].x + players[socket.id].width && players[player].y + 20 >= players[socket.id].y && players[player].y - 20 <=  players[socket.id].y + players[socket.id].height && player != socket.id && players[socket.id].team != players[player].team){
						players[player].hp -= 20;
						players[player].stun = true;
						players[player].stunTime = 15;
						players[player].stunCooldown = gameTime;
					}
				}
				players[socket.id].canAbility1 = false;
				players[socket.id].a1Time = 40;
				players[socket.id].canAbility1Cooldown = gameTime;
			} else if (players[socket.id].class == "huntsman" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				// dash
				if(players[socket.id].dir == "left"){
					players[socket.id].x -= 250;
					players[socket.id].BASE -= 250;
					b = new Bullet(players[socket.id].x + 20, players[socket.id].y, 250, 40, players[socket.id].dir, socket.id, 0, "RED", "rush", players[socket.id].team);
					bullets.push(b);
				} else if (players[socket.id].dir == "right"){
					players[socket.id].x += 250;
					players[socket.id].BASE += 250;
					b = new Bullet(players[socket.id].x - 250, players[socket.id].y, 250, 40, players[socket.id].dir, socket.id, 0, "RED", "rush", players[socket.id].team);
					bullets.push(b);
				} else if (players[socket.id].dir == "up"){
					players[socket.id].y -= 250;
					b = new Bullet(players[socket.id].x - 10, players[socket.id].y + 40, 40, 250, players[socket.id].dir, socket.id, 0, "RED", "rush", players[socket.id].team);
					bullets.push(b);
				} else if (players[socket.id].dir == "down"){
					players[socket.id].y += 250;
					b = new Bullet(players[socket.id].x - 10, players[socket.id].y - 250, 40, 250, players[socket.id].dir, socket.id, 0, "RED", "rush", players[socket.id].team);
					bullets.push(b);
				}
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 60;
				players[socket.id].canAbility2Cooldown = gameTime;
				players[socket.id].stun = true;
				players[socket.id].stunCooldown = gameTime;
				players[socket.id].stunTime = 2;
			} else if (players[socket.id].class == "huntsman" && players[socket.id].canUltimate && abilityKey == 72 && players[socket.id].stun == false){
				players[socket.id].canUltimate = false;
				players[socket.id].ultTime = 150;
				players[socket.id].canUltimateCooldown = gameTime;
				players[socket.id].canShoot = true;
				players[socket.id].canAbility1 = true;
				players[socket.id].canAbility2 = true;
				players[socket.id].canAbility2Cooldown = 0
				players[socket.id].canAbility1Cooldown = 0
				players[socket.id].canShootCooldown = 0
			}

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
				players[socket.id].wallTime = 60;
				players[socket.id].wallCooldown = gameTime;
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 100;
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
					if (players[player].x + players[player].height>= players[socket.id].x && players[player].x - 20 <= players[socket.id].x + players[socket.id].width && players[player].y + 20 >= players[socket.id].y && players[player].y - 20 <=  players[socket.id].y + players[socket.id].height && player != socket.id && players[socket.id].team != players[player].team && players[player].invinc != true){
						players[player].hp -= 30;
						if (players[player].hp <= 0){
							killer = socket.id;
						}
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
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 18, 12, players[socket.id].dir, socket.id, 23, "BLUE", "blast", players[socket.id].team);
				bullets.push(b);
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 3.5;
				players[socket.id].canShootCooldown = gameTime;
			}
			else if (players[socket.id].class == "spellslinger" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 28, 10, players[socket.id].dir, socket.id, 30, "YELLOW", "stun", players[socket.id].team);
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
		if (gameTime > 120 && teamMode == "survival"){
			var characterClass = "spec";
		} else {
			var characterClass = usernameList[1];
		}
		var team = usernameList[2];
		if (username == ""){
			players[socket.id] = new Player("Unnamed", characterClass, team)
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
		// healing blocks
		// if (gameTime > 5000){
		// 	gameTime = 0;
		// 	bullets = [];
		// 	team1Kills = 0;
		// 	team2Kills = 0;
		// 	for (player in players){
		// 		io.to(player).emit("dead", 1);
		// 		delete players[player];
		// 	}
		// }
		
		//survival game
		if (gameTime == 120 && teamMode == "survival"){
			for (player in players){
				players[player].invinc = false;
			}
		} else if (gameTime > 120 && teamMode == "survival"){
			mapDeathWall += 2;
		}

		if (gameTime % 250 == 0 && healGot == true){
			for (var i = 0; i < healLocationX.length; i++){
				b = new Bullet(healLocationX[i], healLocationY[i], 30, 30, "left", 0, 0, "green", "heal", -1)
				bullets.push(b);
			}
			healGot = false;
		}

		for (player in players){
			//check for jug
			if (teamMode == "jugg"){
				if (players[player].class == "juggernaut"){
					currentJugg = true;
				}
			}
			if (players[player].class == "tt" && gameTime % 70 == 0){
				players[player].pastX = players[player].x;
				players[player].pastY = players[player].y;
				players[player].pastHP = players[player].hp;
			} else if (players[player].class == "ae" && gameTime % 2 == 0){
				players[player].pastX = players[player].x;
				players[player].pastY = players[player].y;
			}

			if (teamMode == "survival" && players[player].class != "spec"){
				survivalCount += 1;
			}
		}
		
		if (Object.keys(players).length == 0){
			gameTime = 0;
		}
		
		if (survivalCount <= 1 && gameTime > 120 && winner == "none" && teamMode == "survival"){
			winnerDecided = gameTime;
			for (player in players){
				if (players[player].class != "spec"){
					winner = players[player].username;
				}
			}
			mapDeathWall = 0;
		} else {
			survivalCount = 0;
		}

		if (winnerDecided != 0 && gameTime - winnerDecided > 30 ){
			gameTime = 0;
			bullets = [];
			bullets.push(new Bullet(2 + 5, 600 + 15, 18, 12, "left", 12, 15, "BLUE", "blast", 0))
			team1Kills = 0;
			team2Kills = 0;
			mapDeathWall = 0;
			winner = "none";
			winnerDecided = 0;
			for (player in players){
				io.to(player).emit("dead", 1);
				delete players[player];
			}
			deadPlayers = [];
		}

		if (teamMode == "jugg" && currentJugg == false){
			b = new Bullet( 2975, 100, 50, 50, "left", 0, 0, "WHITE", "becomeJugg", -1)
			bullets.push(b);
		} else {
			currentJugg = false;
		}

		for (player in players){
			// Tank no stun
			if (gameTime - players[player].ultimateDuration < players[player].ultDurTime && players[player].class == "tank" && players[player].ultimateDuration != 0){
				players[player].stun = false;
				players[player].slow = false;
				players[player].slowCooldown = 0;
				players[player].stunCooldown = 0;
				players[player].stunCooldown2 = 0;
				players[player].hp += 1.5
			} else if (players[player].class == "tank" ) {
				players[player].ultimateDuration = 0;
			}

			if (gameTime - players[player].ultimateDuration < players[player].ultDurTime && players[player].class == "deadeye" && players[player].ultimateDuration != 0){
				players[player].xAcceleration = 3;
				players[player].yAcceleration = 5;
			}
			else if (gameTime - players[player].ultimateDuration > players[player].ultDurTime && players[player].class == "deadeye" && players[player].ultimateDuration != 0){
				players[player].xAcceleration = players[player].xOrigA;
				players[player].yAcceleration = players[player].yOrigA;
				players[player].ultimateDuration = 0;
				b = new Bullet(players[player].x + 5, players[player].y + 15, 30, 20, players[player].dir, player, 40, "BLACK", "deadshot", players[player].team);
				bullets.push(b);
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
				players[player].canUltimateCooldown = 0;
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
			if (gameTime - players[player].markTimer > players[player].markDuration && players[player].markTimer != 0){
				markTimer = 0;
				players[player].marked = false;
			}
			if (players[player].xSpeed != 0 && players[player].class == "watcher"){
				players[player].invis = false;
			}
			if (gameTime - players[player].invisCooldown > players[player].invisTime && players[player].invisCooldown != 0){
				players[player].invis = false;
				players[player].invisCooldown = 0;
			}
			if (gameTime - players[player].speedCooldown > players[player].speedTime && players[player].speedCooldown != 0){
				players[player].xAcceleration = players[player].xOrigA;
				players[player].speedCooldown = 0;
			}
			if (gameTime - players[player].invincCooldown > players[player].invincTime && players[player].invincCooldown != 0){
				players[player].xAcceleration = players[player].xOrigA;
				players[player].invinc = false;
				players[player].invincCooldown = 0;
			}

			if (players[player].y + 40>= 1000 && map == 2){
				players[player].hp -= 100;
			}

			if (players[player].x < mapDeathWall && mapDeathWall != 0){
				players[player].hp -= 100;
			}
			if (players[player].x > mapWidth - mapDeathWall && mapDeathWall != 0){
				players[player].hp -= 100;
			}

			if (players[player].hp < 0){
				players[player].canUltimate = false;
				players[player].canUltimateCooldown = gameTime;
				players[player].hp = 0;
			} else if (players[player].hp > 100 && players[player].class != "juggernaut"){
				players[player].hp = 100;
			} else if (players[player].hp > 200 && players[player].class == "juggernaut"){
				players[player].hp = 200;
			}
			// remove after death
			if (players[player].hp == 0) {
				players[player].canUltimate = false;
				for (var i = 0; i < bullets.length; i++) {
					if (bullets[i].type == "beam" && player == bullets[i].shooter){
						bullets.splice(i, 1)
					}
					else if (bullets[i].type == "trap" && player == bullets[i].shooter){
						bullets.splice(i, 1)
					}
					else if (bullets[i].type == "rush" && player == bullets[i].shooter){
						bullets.splice(i, 1)
					} else if (bullets[i].type == "ultrahealing" && player == bullets[i].shooter){
						bullets.splice(i, 1)
					} else if (bullets[i].type == "pool" && player == bullets[i].shooter){
						bullets.splice(i, 1)
					}
				}
				for (var i = 0; i < walls.length; i++) {
					if (walls[i].user = socket.id){
						walls.splice(i, 1)
					}
				}
				players[player].deadTime = gameTime;
				deadPlayers.push(players[player]);
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
			if (players[player].x > mapWidth - players[player].width && players[player].class == "none"){
				players[player].hp -= 100;
				players[player].BASE = -590;
			}  else if (players[player].x > mapWidth - players[player].width){
				players[player].x = mapWidth - players[player].width;
				players[player].BASE = mapWidth - players[player].width - 590;
			}
			else if (players[player].x < 0 && players[player].class == "none"){
				players[player].hp -= 100;
				players[player].BASE = -590;
			} else if (players[player].x < 0 && players[player].class == "watcherClone"){
				players[player].hp -= 100;
				players[player].BASE = -590;
			} else if (players[player].x > mapWidth - 30 && players[player].class == "watcherClone"){
				players[player].hp -= 100;
				players[player].BASE = -590;
			}

			else if (players[player].x < 0){
				players[player].x = 0;
				players[player].BASE = -590;
			}
			if (players[player].y + players[player].height > mapHeight){
				players[player].y = mapHeight - players[player].height;
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
			} else if (deadPlayers[player].y > 1180){
				deadPlayers[player].y = 1180;
				deadPlayers[player].jump = true;
			}
		}

		// platform collision and moving
		for (var i = 0; i < platforms.length; i++) {
			platforms[i].y += platforms[i].speed;
			if (platforms[i].y > mapHeight - platforms[i].height - 200 || platforms[i].y < 40) {
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

		if (killer!= 0){
			players[killer].kills += 1;
			if (players[killer].team == "teamB"){
				team1Kills += 1;
			} else if (players[killer].team == "teamA"){
				team2Kills += 1;
			}

			if (teamMode == "jugg"){
				players[killer].class = "juggernaut"
				players[killer].width = 30;
				players[killer].height = 60;
				players[killer].origHeight = 60;
				players[killer].hp = 200;
				players[killer].xOrigA = 6;
				players[killer].yOrigA = 10;
				players[killer].team = 2;
			}
			killer = 0;
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
				if (bullets[i].y > 1192){
					bullets[i].y = 1192;
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
				if (gameTime - players[player].ultimateDuration > 15 && bullets[i].type == "ultrahealing" && gameTime - players[player].ultimateDuration < 17 && player == bullets[i].shooter && players[player].ultimateDuration != 0){
					bulletsToRemove.push(i);
				}
				if (gameTime - players[player].ultimateDuration > 15 && bullets[i].type == "pool" && gameTime - players[player].ultimateDuration < 17 && player == bullets[i].shooter && players[player].ultimateDuration != 0){
					bulletsToRemove.push(i);
				}
				if (gameTime - players[player].canAbility2Cooldown > 2 && bullets[i].type == "rush" && gameTime - players[player].canAbility2Cooldown < 10 && player == bullets[i].shooter){
					bulletsToRemove.push(i);
				}
				if (players[player].x + players[player].width > bullets[i].x && players[player].x < bullets[i].x + bullets[i].width && players[player].y + players[player].height > bullets[i].y && players[player].y <  bullets[i].y + bullets[i].height && players[player].team == bullets[i].team){
					if (bullets[i].type == "healing"){ 
						players[player].hp += 30;
						bulletsToRemove.push(i);
					} 
					if (bullets[i].type == "ultrahealing"){ 
						players[player].hp += 5;
					}
				}
				if (players[player].x + players[player].width > bullets[i].x && players[player].x < bullets[i].x + bullets[i].width && players[player].y + players[player].height > bullets[i].y && players[player].y <  bullets[i].y + bullets[i].height && player != bullets[i].shooter && players[player].team != bullets[i].team  && players[player].invinc != true){
					// watcher
					if(bullets[i].type == "slowDart"){
						players[player].hp -= 24;
						players[player].yAcceleration = 4*players[player].yAcceleration/5;
						players[player].xAcceleration = 4*players[player].xAcceleration/5;
						bulletsToRemove.push(i);
						players[player].slow = true;
						players[player].slowTime = 10;
						players[player].slowCooldown = gameTime;
					} else if(bullets[i].type == "megaStun"){
						players[player].hp -= 20;
						bulletsToRemove.push(i);
						players[player].stun = true;
						players[player].stunTime = 15;
						players[player].stunCooldown = gameTime;
					}
					// ae
					else if (bullets[i].type == "boomerang" && players[bullets[i].shooter] != null){ 
						players[player].hp -= 10 + players[bullets[i].shooter].evil;
						players[bullets[i].shooter].evil += 3;
						players[bullets[i].shooter].canShoot = true;
						players[bullets[i].shooter].canShootCooldown = 0;
						bulletsToRemove.push(i);
					} else if (bullets[i].type == "evilFarm" && players[bullets[i].shooter] != null){ 
						players[player].hp -= 3 +  0.2*players[bullets[i].shooter].evil;
						players[bullets[i].shooter].evil += 1;
					}
					// time traveller bullets
					else if (bullets[i].type == "timeShot" && players[player].marked == true){
						marked = false;
						players[player].markTimer = 0;
						players[player].hp -= 40;
						// players[player].stun = true;
						// players[player].stunTime = 4;
						// players[player].stunCooldown = gameTime;
						players[player].marked = false;
						players[player].markTimer = 0;
						bulletsToRemove.push(i);
					} else if (bullets[i].type == "timeShot"){ 
						players[player].hp -= 15;
						players[player].marked = true;
						players[player].markTimer = gameTime;
						players[player].markDuration = 50;
						bulletsToRemove.push(i);
					} else if (bullets[i].type == "timeMark" && players[player].marked == true){
						players[player].hp -= 20;
						players[player].stun = true;
						players[player].stunTime = 10;
						players[player].stunCooldown = gameTime;
						players[player].marked = false;
						players[player].markTimer = 0;
						bulletsToRemove.push(i);
					}
					else if (bullets[i].type == "timeMark"){
						players[player].hp -= 10;
						players[player].stun = true;
						players[player].stunTime = 4;
						players[player].stunCooldown = gameTime;
						players[player].marked = true;
						players[player].markTimer = gameTime;
						players[player].markDuration = 50;
						bulletsToRemove.push(i);
					} else if (bullets[i].type == "timeShift" && players[player].marked == true){
						players[player].hp -= 10;
						players[player].marked = false;
						players[player].markTimer = 0;
						players[player].markDuration = 50;
						if (players[bullets[i].shooter] != null){
							players[bullets[i].shooter].hp += 30;
							players[bullets[i].shooter].x = players[player].x;
							players[bullets[i].shooter].y = players[player].y;
						}
						bulletsToRemove.push(i);
					}
					else if (bullets[i].type == "timeShift"){
						players[player].hp -= 10;
						players[player].marked = true;
						players[player].markTimer = gameTime;
						players[player].markDuration = 50;
						if (players[bullets[i].shooter] != null){
							players[bullets[i].shooter].x = players[player].x;
							players[bullets[i].shooter].y = players[player].y;
						}
						bulletsToRemove.push(i);
					}
					//necro bullets
					if (bullets[i].type == "necroShot"){ 
						players[player].hp -= 20;
						if (players[bullets[i].shooter] != null){
							players[bullets[i].shooter].hp += 20;
						}
						bulletsToRemove.push(i);
					} else if (bullets[i].type == "necroStun"){ 
						players[player].hp -= 10;
						if (players[bullets[i].shooter] != null){
							players[bullets[i].shooter].canAbility2 = true;
							players[bullets[i].shooter].canAbility2Cooldown = 0;
						}
						bulletsToRemove.push(i);
						players[player].stun = true;
						players[player].stunTime = 2;
						players[player].stunCooldown = gameTime;
					} else if (bullets[i].type == "pool"){ 
						players[player].hp -= 3;
					}
					//jugg bullets
					if (bullets[i].type == "juggRound"){ 
						players[player].hp -= 40;
						bulletsToRemove.push(i);
					} else if (bullets[i].type == "juggShot"){ 
						players[player].hp -= 15;
						if (players[bullets[i].shooter] != null){
							players[bullets[i].shooter].hp += 8;
						}
						bulletsToRemove.push(i);
					} else if (bullets[i].type == "juggKill"){ 
						players[player].hp -= 80;
					} 
					//become jugg
					if (bullets[i].type == "becomeJugg" && players[player].class != "none"){ 
						players[player].class = "juggernaut"
						players[player].width = 30;
						players[player].height = 60;
						players[player].origHeight = 60;
						players[player].hp = 200;
						players[player].xOrigA = 6;
						players[player].yOrigA = 10;
						bulletsToRemove.push(i);
						players[player].team = 2;
					}
					//deadeye
					if (bullets[i].type == "revolver"){ 
						players[player].hp -= 27;
						bulletsToRemove.push(i);
					} else if (bullets[i].type == "deadshot"){ 
						players[player].hp -= 100;
						bulletsToRemove.push(i);
					}
					// doc detection
					if (bullets[i].type == "lifesteal"){ 
						players[player].hp -= 10;
						if (players[bullets[i].shooter] != null){
							players[bullets[i].shooter].hp += 6;
						}
					} else if (bullets[i].type == "snipe"){
						players[player].hp -= 5;
						players[player].stun = true;
						players[player].stunTime = 10;
						players[player].stunCooldown = gameTime;
					} else if (bullets[i].type == "healing"){ 
						players[player].hp += 15;
						bulletsToRemove.push(i);
					} else if (bullets[i].type == "ultrahealing"){ 
						
						players[player].yAcceleration = 63*players[player].yAcceleration/64;
						players[player].xAcceleration = 63*players[player].xAcceleration/64;
						players[player].slow = true;
						players[player].slowTime = 20;
						players[player].slowCooldown = gameTime;
					}
					// heal detection
					if (bullets[i].type == "heal"){ 
						players[player].hp -= -30;
						bulletsToRemove.push(i);
						healGot = true;
					}
					// Huntsman
					if (bullets[i].type == "pulse"){ 
						players[player].hp -= 16;
						bulletsToRemove.push(i);
					} else if (bullets[i].type == "rush"){
						players[player].hp -= 4.5;
					}
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
						players[player].slowTime = 20;
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
							// if (bullets[i].team == "teamA"){
							// 	team1Kills += 1;
							// } else if (bullets[i].team == "teamB"){
							// 	team2Kills += 1;
							// }
						} 
						else if (players[player].class == "none" || players[player].username == "Minion"){
							//do nothing
						} 
						else{	
							players[bullets[i].shooter].kills += 1;
							killing[2] = killing[1]
							killed[2] = killed[1]
							killing[1] = killing[0]
							killed[1] = killed[0]
							killing[0] = players[bullets[i].shooter].username;
							killed[0] = players[player].username;
							
							if (players[bullets[i].shooter].class == "huntsman"){
								players[bullets[i].shooter].canShoot = true;
								players[bullets[i].shooter].canAbility1 = true;
								players[bullets[i].shooter].canAbility2 = true;
								players[bullets[i].shooter].canUltimate = true;
								players[bullets[i].shooter].canAbility2Cooldown = 0
								players[bullets[i].shooter].canAbility1Cooldown = 0
								players[bullets[i].shooter].canShootCooldown = 0
								players[bullets[i].shooter].canUltimateCooldown = 0
								if (bullets[i].type == "rush"){
									bulletsToRemove.push(i);
								}
							} else if (players[bullets[i].shooter].class == "juggernaut"){
								players[bullets[i].shooter].hp += 30;
							} else if (players[bullets[i].shooter].class == "necro"){
								players[minionCount] = new Player("Minion", "none", players[bullets[i].shooter].team)
								players[minionCount].team = players[bullets[i].shooter].team
								players[minionCount].x = players[player].x
								players[minionCount].y = players[player].y
								players[minionCount].hp = 50
								players[minionCount].owner = bullets[i].shooter;
								if (players[player].dir == "left" || players[player].dir == "up"){
									players[minionCount].xSpeed = 5
									minionCount ++;
								} else {
									players[minionCount].xSpeed = -5
									minionCount ++;
								}
							} else if (players[bullets[i].shooter].class == "ae"){
								players[bullets[i].shooter].evil += 3;
							}

							if (players[bullets[i].shooter].class != null && players[player].class == "juggernaut"){
								players[bullets[i].shooter].class = "juggernaut";
								players[bullets[i].shooter].class = "juggernaut"
								players[bullets[i].shooter].width = 30;
								players[bullets[i].shooter].height = 60;
								players[bullets[i].shooter].origHeight = 60;
								players[bullets[i].shooter].hp = 200;
								players[bullets[i].shooter].xOrigA = 6;
								players[bullets[i].shooter].yOrigA = 10;
								players[bullets[i].shooter].team = 2;
							}

							if (players[bullets[i].shooter].team == "teamB"){
								team1Kills += 1;
							} else if (players[bullets[i].shooter].team == "teamA"){
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
		for (player in players){
			players[player].RANGE = players[player].y - 300 + players[player].height/2;
			players[player].BASE = players[player].x - 600 + players[player].width/2;
		}
		io.sockets.emit('returnUpdate', [bullets, players, platforms, deadPlayers, map, gameTime, walls, team1Kills, team2Kills, teamMode, killing, killed, mapDeathWall, winner]);
		for (player in players){
			players[player].loadedSong = true;
		}
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
	if (bullet.x > mapWidth || bullet.x < 0 || bullet.y > mapHeight || bullet.y < -300){
		return true;
	} else{
		return false;
	}
}

function Player(username, chosenClass, team){
	if (teamMode == "ffa"){
		this.x = Math.floor(Math.random() * 5980) + 1;
		this.y = 20;
		this.team = teamNumber;
		teamNumber++;
	} else if (teamMode == "tdm"){
		this.team = team;
		if (this.team == "teamB"){
			this.x = Math.floor(Math.random() * 1180) + 4801;
		} else if (this.team == "teamA") {
			this.x = Math.floor(Math.random() * 1180);
		}
		this.y = 20;
	} else if (teamMode == "jugg"){
		this.team = 1;
		this.x = Math.floor(Math.random() * 5980) + 1;
		this.y = 20;
	} else if (teamMode == "survival"){
		if (mapDeathWall != 0){
			this.x = Math.floor(Math.random() * (mapWidth - mapDeathWall)) + mapDeathWall;
		} else {
			this.x = Math.floor(Math.random() * 5980) + 1;
		}
		this.y = 20;
		this.team = teamNumber;
		teamNumber++;
	}
	this.height = 40;
	this.width = 20;
	this.origHeight = 40;
	this.BASE = this.x - 600 + this.width/2;
	this.RANGE = this.y - 300 + this.height/2;
	this.dir = "up";
	this.ySpeed = 0;
	this.xSpeed = 0;
	if (chosenClass == "assassin"){
		this.yOrigA = 10
		this.xOrigA = 8
	} else if(chosenClass == "deadeye"){
		this.yOrigA = 10
		this.xOrigA = 6
		this.ammo = 6
	} else if(chosenClass == "huntsman"){
		this.yOrigA = 10
		this.xOrigA = 7
	} else if(chosenClass == "spec"){
		this.yOrigA = 12
		this.xOrigA = 10
	} else {
		this.yOrigA = 10
		this.xOrigA = 6
	}
	if (chosenClass == "tt"){
		this.pastX = this.x;
		this.pastY = this.y;
		this.pastHP = this.hp;
	} else if (chosenClass == "ae"){
		this.pastX = this.x;
		this.pastY = this.y;
	}
	this.evil = 0;
	this.yAcceleration = this.yOrigA;
	this.xAcceleration = this.xOrigA;
	this.hp = 100;
	this.marked = false;
	this.markTimer = 0;
	this.markDuration = 0;
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
	this.invincTime = 0;
	if (chosenClass == "spec"){
		this.invinc = true;
		this.invis = true;
	} else if (teamMode == "survival") {
		this.invinc = true;
	} else {
		this.invinc = false;
	}
	this.invincCooldown = 0;
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
	this.owner = 0;
	this.loadedSong = false;

	this.move = function(dir){
		if(dir == "up" && this.jump == true && this.stun == false){
			this.jump = false;
			this.ySpeed = this.yAcceleration;
			this.dir = "up";
			this.height = this.origHeight;
		} else if(dir == "up" && this.secondJump == true && this.stun == false){
			this.secondJump = false;
			this.ySpeed = this.yAcceleration;
			this.dir = "up";
			this.height = this.origHeight;
		}
		if (dir == "left") {
			this.xSpeed = this.xAcceleration;
			this.dir = "left";
			this.height = this.origHeight;
		} else if (dir == "right") {
			this.xSpeed = -this.xAcceleration;
			this.dir = "right";
			this.height = this.origHeight;
		} else if (dir == "down") {
			this.dir = "down";
			this.height = this.origHeight/2;
		} else {
			this.xSpeed = 0;
			this.height = this.origHeight;
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