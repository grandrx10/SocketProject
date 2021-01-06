var socket;
var players;
var platforms = [];
var bullets = [];
var deadPlayers = [];
var gameStart = false;
var userNameSubmitted = false;
var map;
var gameTime;
var walls = [];

function setup(){
    createCanvas(1200,600);
    background(51);
    frameRate(60);

    socket = io();
    socket.on('players', test);
    socket.on("dead", respawn);

    $(document).ready(function() {
        //username modal start     
        $('#myModal').appendTo('body').modal('show');
        $('#myModal').on('hidden.bs.modal',function(){
          if(!userNameSubmitted){
            socket.emit('username',"");
          }
        });
        $('#theButton').click(function() {
          socket.emit('username',$('#userName').val());
          userNameSubmitted = true;
        });
        //username modal end
    
        //focus on the textbox
        $("#myModal").on('shown.bs.modal', function(){
            $(this).find('#userName').focus();
        });
    
        //when you press enter, closes the modal
        $(document).keypress(function(e) {
          var keycode = (event.keyCode ? event.keyCode : event.which);
          if(keycode == '13'){
            if($('#myModal').is(':visible')){
              socket.emit('username',$('#userName').val());
              userNameSubmitted = true;
              $("#myModal").removeClass("in");
              $(".modal-backdrop").remove();
              $("#myModal").hide();
            }  
          }
        });
    });
    
}

function draw() {
    background(220);
    if (gameStart){
        socket.on('returnUpdate', update);
    }
    if (map == 2){
        fill(220,20,60)
        rect(0, 540, 1200, 60)
    }
    for (var i = 0; i < platforms.length; i++) {
        if (platforms[i].speed === 0) {
            fill(4, 207, 95);
        } else {
            fill(247, 191, 60);
        }
        rect(platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height);
    }

    for (var i = 0; i < walls.length; i++) {
        fill(205, 249, 138);
        rect(walls[i].x, walls[i].y, walls[i].width, walls[i].height);
    }

    for (player in deadPlayers){
        fill("RED")
        rect(deadPlayers[player].x, deadPlayers[player].y, 40, 20);
    }

    if (bullets != []) {
        for (var i = 0; i < bullets.length; i++) {
            fill(bullets[i].colour)
            if (bullets[i].type == "beam" || bullets[i].type == "trap"){
                rect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
            } else{
                if (bullets[i].dir == "up" || bullets[i].dir == "down"){
                    rect(bullets[i].x, bullets[i].y, bullets[i].height, bullets[i].width);
                } else {
                    rect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
                }
            }   
        }
    }

    if (keyIsDown(83)){
        key = "down";
        socket.emit('key',key);
    } 
    if (keyIsDown(65)){
        key = "left";
        socket.emit('key',key);
    } else if (keyIsDown(68)){
        key = "right";
        socket.emit('key',key);
    } else if (keyIsDown(83)){
        key = "down";
        socket.emit('key',key);
    } else {
        key = "none";
        socket.emit('key',key);
    }
    if(gameStart){
        for(player in players) {
            if (players[player].class == "assassin" && (gameTime - players[player].canShootCooldown) < players[player].shootTime){
                fill(76, 0, 153);
                if (players[player].dir == "left"){
                    rect(players[player].x - 20, players[player].y+10, 20, 12);
                } else if (players[player].dir == "right"){
                    rect(players[player].x + 20, players[player].y+10, 20, 12);
                } else {
                    rect(players[player].x + 20, players[player].y+10, 20, 12);
                }
            }
            if (players[player].invis == true){
                if(socket.id == player){
                    fill(204, 255, 255);
                    rect(players[player].x, players[player].y, 20, players[player].height);
                    fill("BLACK")
                    if (players[player].dir == "left"){
                        rect(players[player].x, players[player].y + 10, 14, 6)
                    } else if (players[player].dir == "up"){
                        rect(players[player].x, players[player].y + 10, 14, 6)
                    } else {
                        rect(players[player].x + 6, players[player].y + 10, 14, 6)
                    }
                    // healthbars
                    fill("white")
                    rect(players[player].x - 10, players[player].y - 10, 40, 5);
                    fill("green")
                    rect(players[player].x - 10, players[player].y - 10, 40 * players[player].hp/100, 5);
                    // usernames
                    textAlign(CENTER);
                    fill("black");
                    text(players[player].username, players[player].x + 10, players[player].y - 15);
                    fill("white")
                    rect(players[player].x - 5, players[player].y - 35, 30, 5);
                    fill("black")
                    if ((gameTime - players[player].invisCooldown) < players[player].invisTime){
                        rect(players[player].x - 5, players[player].y - 35, (gameTime - players[player].invisCooldown)/players[player].invisTime * 30, 5);
                    }
                    if (players[player].xAcceleration == 12){
                        fill("white")
                        rect(players[player].x - 5, players[player].y - 40, 30, 5);
                        fill(255, 178, 102)
                        rect(players[player].x - 5, players[player].y - 40, (gameTime - players[player].speedCooldown)/players[player].speedTime * 30, 5);
                    }
                }
            } else {
                if(socket.id == player){
                    fill(87, 109, 255);
                } else {
                    fill("red");
                }
                rect(players[player].x, players[player].y, 20, players[player].height);
                if (players[player].stun == true){
                    fill("WHITE")
                    rect(players[player].x - 5, players[player].y - 30, 30, 5);
                    fill("YELLOW")
                    if ((gameTime - players[player].stunCooldown) < players[player].stunTime){
                        rect(players[player].x - 5, players[player].y - 30, (gameTime - players[player].stunCooldown)/players[player].stunTime * 30, 5);
                    } else if ((gameTime - players[player].stunCooldown2) < players[player].stunTime){
                        rect(players[player].x - 5, players[player].y - 30, (gameTime - players[player].stunCooldown2)/players[player].stunTime * 30, 5);
                    }
                }
                if(players[player].class == "assassin"){
                    fill("BLACK")
                    if (players[player].dir == "left"){
                        rect(players[player].x, players[player].y + 10, 14, 6)
                    } else if (players[player].dir == "up"){
                        rect(players[player].x, players[player].y + 10, 14, 6)
                    } else {
                        rect(players[player].x + 6, players[player].y + 10, 14, 6)
                    }
                } else if (players[player].class == "tank"){
                    fill(66, 245, 239)
                    rect(players[player].x - 2, players[player].y + 5, 24, 10)
                } else if (players[player].class == "mercenary"){
                    fill(66, 47, 79)
                    if (players[player].dir == "left"){
                        rect(players[player].x, players[player].y, 20, 8)
                        rect(players[player].x - 6, players[player].y + 8, 26, 8)
                    } else if (players[player].dir == "up"){
                        rect(players[player].x, players[player].y, 20, 8)
                        rect(players[player].x - 6, players[player].y + 8, 26, 8)
                    } else {
                        rect(players[player].x, players[player].y, 20, 8)
                        rect(players[player].x, players[player].y + 8, 26, 8)
                    }
                } else if (players[player].class == "spellslinger"){
                    fill(161, 94, 0)
                    if (players[player].height == 25){
                        rect(players[player].x - 1, players[player].y + 15, 22, 10);
                    } else {
                        rect(players[player].x - 1, players[player].y + 15, 22, 25);
                    }
                }
                if(players[player].class == "tank" && players[player].ultimateDuration != 0){
                    fill("white")
                    rect(players[player].x - 5, players[player].y - 40, 30, 5);
                    fill(255, 178, 102)
                    rect(players[player].x - 5, players[player].y - 40, (gameTime - players[player].ultimateDuration)/players[player].ultDurTime * 30, 5);
                }
                if (players[player].xAcceleration == 12){
                    fill("white")
                    rect(players[player].x - 5, players[player].y - 40, 30, 5);
                    fill(255, 178, 102)
                    rect(players[player].x - 5, players[player].y - 40, (gameTime - players[player].speedCooldown)/players[player].speedTime * 30, 5);
                }
                // healthbars
                fill("white")
                rect(players[player].x - 10, players[player].y - 10, 40, 5);
                fill("green")
                rect(players[player].x - 10, players[player].y - 10, 40 * players[player].hp/100, 5);
                // usernames
                textAlign(CENTER);
                fill("black");
                text(players[player].username, players[player].x + 10, players[player].y - 15);
            }
            // Cooldowns
            if(socket.id == player){
                // BASIC ABILITY
                fill("WHITE")
                rect(5, 5, 20, 20)
                fill("BLACK")
                text("J", 15, 20);
                fill("WHITE")
                rect(30, 10, 100, 10);
                if (gameTime - players[player].canShootCooldown > players[player].shootTime){
                    fill("GREEN")
                    rect(30, 10, 100, 10);
                } else{
                    fill("YELLOW")
                    rect(30, 10, (gameTime - players[player].canShootCooldown)/players[player].shootTime * 100, 10);
                }
                // ABILITY 1
                fill("WHITE")
                rect(5, 25, 20, 20)
                fill("BLACK")
                text("K", 15, 40);
                fill("WHITE")
                rect(30, 30, 100, 10);
                if (gameTime - players[player].canAbility1Cooldown > players[player].a1Time){
                    fill("GREEN")
                    rect(30, 30, 100, 10);
                } else{
                    fill("YELLOW")
                    rect(30, 30, (gameTime - players[player].canAbility1Cooldown)/players[player].a1Time * 100, 10);
                }
                // ABILITY 2
                fill("WHITE")
                rect(5, 45, 20, 20)
                fill("BLACK")
                text("L", 15, 60);
                fill("WHITE")
                rect(30, 50, 100, 10);
                if (gameTime - players[player].canAbility2Cooldown > players[player].a2Time){
                    fill("GREEN")
                    rect(30, 50, 100, 10);
                } else{
                    fill("YELLOW")
                    rect(30, 50, (gameTime - players[player].canAbility2Cooldown)/players[player].a2Time * 100, 10);
                }
                // Ultimate
                fill("WHITE")
                rect(5, 65, 20, 20)
                fill("BLACK")
                text("H", 15, 80);
                fill("WHITE")
                rect(30, 70, 100, 10);
                if (gameTime - players[player].canUltimateCooldown > players[player].ultTime){
                    fill("GREEN")
                    rect(30, 70, 100, 10);
                } else{
                    fill("YELLOW")
                    rect(30, 70, (gameTime - players[player].canUltimateCooldown)/players[player].ultTime * 100, 10);
                }
            }
        }
    }
}

function keyPressed(){
    if (keyCode == 74) {
        socket.emit('shoot', 74);
    } if (keyCode == 75) {
        socket.emit('shoot', 75);
    }
    if (keyCode == 76) {
        socket.emit('shoot', 76);
    }
    if (keyCode == 72) {
        socket.emit('shoot', 72);
    }
    if (keyIsDown(87)){
        key = "up";
        socket.emit('key',key);
    }
}

function test(data){
	players = data;
    gameStart = true;
    
}

function update(returnList){
    bullets = returnList[0];
    players = returnList[1];
    platforms = returnList[2];
    deadPlayers = returnList[3];
    map = returnList[4];
    gameTime = returnList[5];
    walls = returnList[6];
}

function respawn(){
    console.log("This happened here.????")
    $('#myModal').appendTo('body').modal('show');
}