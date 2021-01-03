
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
var updateTimer = null;
var bulletTimer = {};
var ability1Timer = {};
var ability2Timer = {};
var stunTimer = {};

platforms.push(new Platform(0, 500, 300, 20, 0));
platforms.push(new Platform(900, 500, 300, 20, 0));
platforms.push(new Platform(300, 370, 200, 20, 0));
platforms.push(new Platform(550, 350, 100, 20, 3));
platforms.push(new Platform(700, 370, 200, 20, 0));
platforms.push(new Platform(200, 200, 350, 20, 0));
platforms.push(new Platform(650, 200, 350, 20, 0));
platforms.push(new Platform(0, 310, 100, 20, 0));
platforms.push(new Platform(1100, 310, 100, 20, 0));

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
			if (players[socket.id].class == "mage" && players[socket.id].canShoot && abilityKey == 74){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 18, 12, players[socket.id].dir, socket.id, 15, "BLUE", "blast");
				bullets.push(b);
				players[socket.id].canShoot = false;
				bulletTimer[socket.id] = setInterval(function(){
					players[socket.id].canShoot = true;
					clearInterval(bulletTimer[socket.id]);
				}, 700)
			}
			else if (players[socket.id].class == "mage" && players[socket.id].canAbility1 && abilityKey == 75){
				b = new Bullet(players[socket.id].x + 5, players[socket.id].y + 15, 20, 10, players[socket.id].dir, socket.id, 20, "YELLOW", "stun");
				bullets.push(b);
				players[socket.id].canAbility1 = false;
				ability1Timer[socket.id] = setInterval(function(){
					players[socket.id].canAbility1 = true;
					clearInterval(ability1Timer[socket.id]);
				}, 1500)
			}
			else if (players[socket.id].class == "mage" && players[socket.id].canAbility2 && abilityKey == 76){
				if(players[socket.id].dir == "left"){
					players[socket.id].x -= 100;
				} else if (players[socket.id].dir == "right"){
					players[socket.id].x += 100;
				} else if (players[socket.id].dir == "up"){
					players[socket.id].y -= 100;
				} else if (players[socket.id].dir == "down"){
					players[socket.id].y += 100;
				}
				players[socket.id].canAbility2 = false;
				ability2Timer[socket.id] = setInterval(function(){
					players[socket.id].canAbility2 = true;
					clearInterval(ability2Timer[socket.id]);
				}, 2500)
			}
		}
	}
	
	function processUsername(username){
		if(username == "") {
			players[socket.id] = new Player(socket.id);
		} else {
			players[socket.id] = new Player(username);
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
			} else if (players[player].y > 560){
				players[player].y = 560;
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
				if (players[player].x + 20 > platforms[i].x && players[player].x < platforms[i].x + platforms[i].width && players[player].y + 40 > platforms[i].y && players[player].y < platforms[i].y + platforms[i].height) {
					players[player].y = platforms[i].y - 40
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
			bullets[i].move();
			if (checkRemove(bullets[i])){
				bulletsToRemove.push(i);
			}
			// check hit
			for (player in players){
				console.log(players[player].stun)
				if (bullets[i].x > players[player].x && bullets[i].x < players[player].x + 20 && bullets[i].y > players[player].y && bullets[i].y < players[player].y + 40 && player != bullets[i].shooter){
					if (bullets[i].type == "blast"){ 
						players[player].hp -= 20;
					} else if (bullets[i].type == "stun"){ 
						players[player].hp -= 10;
						players[player].stun = true;
						stunTimer[socket.id] = setInterval(function(){
							players[socket.id].stun = false;
							clearInterval(stunTimer[socket.id]);
						}, 700)
					}
					bulletsToRemove.push(i);
					if (players[player].hp < 0){
						players[player].hp = 0;
					}
				}
				if (players[player].hp == 0) {
					deadPlayers.push(players[player]);
					console.log("THIS happened.")
					io.to(player).emit("dead", 1);
					delete players[player];
				}
			}
		}
		for (var i = bulletsToRemove.length - 1; i > 0; i--){
			bullets.splice(bulletsToRemove[i], 1);
		}

		io.sockets.emit('returnUpdate', [bullets, players, platforms, deadPlayers]);
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

function checkRemove(bullet){
	if (bullet.x > 1200 || bullet.x < 0 || bullet.y > 600 || bullet.y < 0){
		return true;
	} else{
		return false;
	}
}

function Player(username){
	this.x = Math.floor(Math.random() * Math.floor(1000));;
	this.y = Math.floor(Math.random() * Math.floor(600));;
	this.dir = "up";
	this.ySpeed = 0;
	this.xSpeed = 0;
	this.hp = 100;
	this.jump = true;
	this.secondJump = true;
	this.username = username;
	this.canShoot = true;
	this.canAbility1 = true;
	this.canAbility2 = true;
	this.class = "mage";
	this.stun = false;

	this.move = function(dir){
		if(dir == "up" && this.jump == true && this.stun == false){
			this.jump = false;
			this.ySpeed = 10;
			this.dir = "up";
		} else if(dir == "up" && this.secondJump == true && this.stun == false){
			this.secondJump = false;
			this.ySpeed = 10;
			this.dir = "up";
		}
		if (dir == "down") {
			this.dir = "down";
		} else if (dir == "left") {
			this.xSpeed = 6;
			this.dir = "left";
		} else if (dir == "right") {
			this.xSpeed = -6;
			this.dir = "right";
		} else {
			this.xSpeed = 0;
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