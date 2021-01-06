
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
var deadPlayers = [];
//let startTime = second();
var map = 1;
var updateTimer = null;
var gameTime = 0;
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
	bullets.push(new Bullet(2 + 5, 600 + 15, 18, 12, "left", 12, 15, "BLUE", "blast"))
} else if (map == 2){
	platforms.push(new Platform(300, 500, 600, 20, 0));
	platforms.push(new Platform(200, 500, 100, 20, 2));
	platforms.push(new Platform(900, 500, 100, 20, -2));
	platforms.push(new Platform(300, 100, 200, 20, 0.5));
	platforms.push(new Platform(700, 300, 200, 20, -0.5));
	platforms.push(new Platform(1000, 200, 200, 20, 0.5));
	platforms.push(new Platform(0, 350, 200, 20, -0.5));
	platforms.push(new Platform(500, 50, 200, 20, 0.2));
	bullets.push(new Bullet(2 + 5, 600 + 15, 18, 12, "left", 12, 15, "BLUE", "blast"))
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

	function keyMsg(key){ //data is the key pressed
		if(Object.keys(players).indexOf(socket.id) != -1){
			players[socket.id].move(key);
			io.sockets.emit('players',players);
		// socket.broadcast.emit('key', data); // this sends to everyone minus the client that sent the message
		}
	}

	function bulletTravel(abilityKey){
		if (Object.keys(players).indexOf(socket.id) != -1){
			//Assassin abilities
			if (players[socket.id].class == "assassin" && players[socket.id].canShoot && abilityKey == 74 && players[socket.id].stun == false){
				for (player in players){
					// retry this please fix this later
					if (players[player].x + 20>= players[socket.id].x && players[player].x <= players[socket.id].x + players[socket.id].width && players[player].y >= players[socket.id].y && players[player].y <=  players[socket.id].y + players[socket.id].height && player != socket.id){
						players[player].hp -= 35;
					}
				}
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 1;
				players[socket.id].canShootCooldown = gameTime;
			} else if (players[socket.id].class == "assassin" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 25, 12, players[socket.id].dir, socket.id, 30, "TEAL", "slow");
				bullets.push(b);
				players[socket.id].canAbility1 = false;
				players[socket.id].a1Time = 20;
				players[socket.id].canAbility1Cooldown = gameTime;
			} else if (players[socket.id].class == "assassin" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				players[socket.id].invis = true;
				players[socket.id].invisTime = 30
				players[socket.id].invisCooldown = gameTime;
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 70;
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
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 20, 5, players[socket.id].dir, socket.id, 25, (112,128,144), "bullet");
				bullets.push(b);
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 1.5;
				players[socket.id].canShootCooldown = gameTime;
			}
			else if (players[socket.id].class == "mercenary" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 32, 35, 8, players[socket.id].dir, socket.id, -10, "PURPLE", "trap");
				bullets.push(b);
				players[socket.id].canAbility1 = false;
				players[socket.id].a1Time = 70;
				players[socket.id].canAbility1Cooldown = gameTime;
			}
			else if (players[socket.id].class == "mercenary" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				if(players[socket.id].dir == "left" || players[socket.id].dir == "right"){
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y, 10, 10, players[socket.id].dir, socket.id, 8, "ORANGE", "shotgun");
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 10, 10, players[socket.id].dir, socket.id, 8, "ORANGE", "shotgun");
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 30, 10, 10, players[socket.id].dir, socket.id, 8, "ORANGE", "shotgun");
					bullets.push(b);
				} else {
					b = new Bullet(players[socket.id].x - 10, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 8, "ORANGE", "shotgun");
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 5, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 8, "ORANGE", "shotgun");
					bullets.push(b);
					b = new Bullet(players[socket.id].x + 20, players[socket.id].y +5, 10, 10, players[socket.id].dir, socket.id, 8, "ORANGE", "shotgun");
					bullets.push(b);
				}
				players[socket.id].canAbility2 = false;
				players[socket.id].a2Time = 25;
				players[socket.id].canAbility2Cooldown = gameTime;
				if(players[socket.id].dir == "left"){
					players[socket.id].x -= -60;
				} else if (players[socket.id].dir == "right"){
					players[socket.id].x += -60;
				} else if (players[socket.id].dir == "up"){
					players[socket.id].y -= -60;
				} else if (players[socket.id].dir == "down"){
					players[socket.id].y += -60;
				}
			} else if (players[socket.id].class == "mercenary" && players[socket.id].canUltimate && abilityKey == 72 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 5, 50, 25, players[socket.id].dir, socket.id, 30, "RED", "rocket");
				bullets.push(b);
				players[socket.id].canUltimate = false;
				players[socket.id].ultTime = 150;
				players[socket.id].canUltimateCooldown = gameTime;
			}
			// Spellslinger ABILITIES
			if (players[socket.id].class == "spellslinger" && players[socket.id].canShoot && abilityKey == 74 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 18, 12, players[socket.id].dir, socket.id, 15, "BLUE", "blast");
				bullets.push(b);
				players[socket.id].canShoot = false;
				players[socket.id].shootTime = 6;
				players[socket.id].canShootCooldown = gameTime;
			}
			else if (players[socket.id].class == "spellslinger" && players[socket.id].canAbility1 && abilityKey == 75 && players[socket.id].stun == false){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 20, 10, players[socket.id].dir, socket.id, 20, "YELLOW", "stun");
				bullets.push(b);
				players[socket.id].canAbility1 = false;
				players[socket.id].a1Time = 12;
				players[socket.id].canAbility1Cooldown = gameTime;
			}
			else if (players[socket.id].class == "spellslinger" && players[socket.id].canAbility2 && abilityKey == 76 && players[socket.id].stun == false){
				if(players[socket.id].dir == "left"){
					players[socket.id].x -= 150;
				} else if (players[socket.id].dir == "right"){
					players[socket.id].x += 150;
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
				console.log("I shoot")
				if (players[socket.id].dir == "right"){
					b = new Bullet(players[socket.id].x + 20, players[socket.id].y - 10, 1200, 60, players[socket.id].dir, socket.id, 0, "CYAN", "beam");
				} else if (players[socket.id].dir == "left"){
					b = new Bullet(0, players[socket.id].y - 10, players[socket.id].x, 60, players[socket.id].dir, socket.id, 0, "CYAN", "beam");
				}
				else if (players[socket.id].dir == "down"){
					b = new Bullet(players[socket.id].x - 10, players[socket.id].y + 40, 60, 1200, players[socket.id].dir, socket.id, 0, "CYAN", "beam");
				}
				else if (players[socket.id].dir == "up"){
					b = new Bullet(players[socket.id].x - 10, 0, 60, players[socket.id].y, players[socket.id].dir, socket.id, 0, "CYAN", "beam");
				}
				bullets.push(b);
				players[socket.id].stun = true;
				players[socket.id].stunTime = 12
				players[socket.id].stunCooldown2 = gameTime;
				players[socket.id].canUltimate = false;
				players[socket.id].ultTime = 150;
				players[socket.id].canUltimateCooldown= gameTime;
				players[socket.id].ultimateDuration = gameTime;
			}
		}
	}
	
	function processUsername(username){
		if(username == "") {
			players[socket.id] = new Player(socket.id, "spellslinger");
		} else if (username == "Merc") {
			players[socket.id] = new Player(username, "mercenary");
		} else if (username == "Assassin") {
			players[socket.id] = new Player(username, "assassin");
		} else {
			players[socket.id] = new Player(username, "spellslinger");
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
		// update player position
		//console.log(deadPlayers);
		for (player in players){
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
			}
			if (players[player].hp == 0) {
				for (var i = 0; i < bullets.length; i++) {
					if (bullets[i].type == "beam" && player == bullets[i].shooter){
						bullets.splice(i, 1)
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
				players[player].x -= players[player].xSpeed;
			}
			if (players[player].x > 1180){
				players[player].x = 1180;
			} else if (players[player].x < 0){
				players[player].x = 0;
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

			if (deadPlayers[player].x > 1160){
				deadPlayers[player].x = 1160;
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

		
		var bulletsToRemove = [];
		for (var i = 0; i < bullets.length; i++) {

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
				if (gameTime - players[player].ultimateDuration > 12 && bullets[i].type == "beam" && gameTime - players[player].ultimateDuration < 14 && player == bullets[i].shooter){
					bulletsToRemove.push(i);
					console.log("REMOVE.")
				}
				if (players[player].x + 20> bullets[i].x && players[player].x < bullets[i].x + bullets[i].width && players[player].y + 40 > bullets[i].y && players[player].y <  bullets[i].y + bullets[i].height && player != bullets[i].shooter){
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
						players[player].hp -= 10;
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
						players[player].hp -= 20;
						bulletsToRemove.push(i);
					} else if (bullets[i].type == "rocket"){ 
						players[player].hp -= 60;
						bulletsToRemove.push(i);
						if(bullets[i].dir == "left"){
							players[player].x -= 80;
						} else if (bullets[i].dir == "right"){
							players[player].x += 80;
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
				}
			}
		}
		for (var i = bulletsToRemove.length -1; i > 0; i--){
			bullets.splice(bulletsToRemove[i], 1);
		}

		io.sockets.emit('returnUpdate', [bullets, players, platforms, deadPlayers, map, gameTime]);
	}
}
function Bullet(x, y, width, height, dir, shooter, speed, colour, type) {
	this.shooter = shooter;
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
	if (bullet.x > 1200 || bullet.x < 0 || bullet.y > 600 || bullet.y < 0){
		return true;
	} else{
		return false;
	}
}

function Player(username, chosenClass){
	if (map == 1){
		this.x = Math.floor(Math.random() * Math.floor(1000));;
		this.y = Math.floor(Math.random() * Math.floor(600));;
	} else if (map == 2){
		this.x = Math.floor(Math.random() * Math.floor(1000));;
		this.y = Math.floor(Math.random() * Math.floor(400));;
	}
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
	this.jump = true;
	this.secondJump = true;
	this.username = username;
	this.canShoot = true;
	this.a1Time = 0;
	this.a2Time = 0;
	this.shootTime = 0;
	this.ultTime = 0;
	this.stunTime = 0;
	this.slowTime = 0;
	this.speedTime = 0;
	this.canAbility1 = true;
	this.canAbility2 = true;
	this.canUltimate = true;
	this.class = chosenClass;
	this.stun = false;
	this.slow = false;
	this.canShootCooldown = 0;
	this.canAbility1Cooldown = 0;
	this.canAbility2Cooldown = 0;
	this.stunCooldown = 0;
	this.stunCooldown2 = 0;
	this.slowCooldown = 0;
	this.speedCooldown = 0;
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