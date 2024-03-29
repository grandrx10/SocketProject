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
var base = 0;
var range = 0;
var mapWidth = 6000;
var mapDeathWall;
var winner;
var team1Kills = 0;
var team2Kills = 0;
var team = 0;
var teamMode = "";
var killed = ["none", "none", "none"]
var killing = ["none", "none", "none"]
var deadeyeSong;
var huntsmanSong;
var spellslingerSong
var aeSong
var assassinSong
var necromancerSong
var ttSong
var tankSong
var mercSong
var watcherSong
var docSong
var wave
var captainSong
var song

function preload(){
    deadeyeSong = createAudio("Assets/sixShooter.mp3");
    huntsmanSong = createAudio("Assets/hellsing.mp3");
    spellslingerSong = createAudio("Assets/valedictory.mp3");
    aeSong = createAudio("Assets/untold.mp3");
    assassinSong = createAudio("Assets/psychoKiller.mp3");
    necromancerSong = createAudio("Assets/necromancer.mp3");
    ttSong = createAudio("Assets/dmc.mp3");
    mercSong = createAudio("Assets/themeHell.mp3");
    tankSong = createAudio("Assets/doom.mp3");
    docSong = createAudio("Assets/civilWar.mp3")
    captainSong = createAudio("Assets/stillFeel.mp3")
    samuraiSong = createAudio("Assets/ManInTheMirror.mp3")
    reverSong = createAudio("Assets/HMU.mp3")
    cardmasterSong = createAudio("Assets/talkaboutyou.mp3")
}


function setup(){
    createCanvas(1200,600);
    background(51);
    frameRate(60);

    socket = io();
    socket.on('players', test);
    socket.on("dead", respawn);

    socket.on("teamMode", displayTeamRadio);

    $(document).ready(function() {
        //username modal start     
        $('#myModal').appendTo('body').modal('show');
        $('#myModal').on('hidden.bs.modal',function(){
          if(!userNameSubmitted){
            loopSong($("input[type='radio'][name='class']:checked").val())
            socket.emit('username',["", $("input[type='radio'][name='class']:checked").val(), $("input[type='radio'][name='team']:checked").val()]);
          }
        });
        $('#theButton').click(function() {
          loopSong($("input[type='radio'][name='class']:checked").val())
          socket.emit('username',[$('#userName').val(), $("input[type='radio'][name='class']:checked").val(), $("input[type='radio'][name='team']:checked").val()]);
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
              loopSong($("input[type='radio'][name='class']:checked").val())
              socket.emit('username',[$('#userName').val(), $("input[type='radio'][name='class']:checked").val(), $("input[type='radio'][name='team']:checked").val()]);
              userNameSubmitted = true;
              $("#myModal").removeClass("in");
              $(".modal-backdrop").remove();
              $("#myModal").hide();
            }  
          }
        });
    });
    
}

function loopSong(charClass){
    if (charClass == "huntsman"){
        song = huntsmanSong
        song.volume(1.0);
        song.loop();
    } else if (charClass == "deadeye"){
        song = deadeyeSong
        song.volume(0.1);
        song.loop();
    } else if (charClass == "spellslinger"){
        song = spellslingerSong
        song.volume(0.05);
        song.loop();
    } else if (charClass == "ae"){
        song = aeSong
        song.volume(0.05);
        song.loop();
    } else if (charClass == "assassin"){
        song = assassinSong
        song.volume(0.1);
        song.loop();
    } else if (charClass == "necro"){
        song = necromancerSong
        song.volume(0.1);
        song.loop();
    } else if (charClass == "tt"){
        song = ttSong
        song.volume(0.1);
        song.loop();
    } else if (charClass == "mercenary"){
        song = mercSong
        song.volume(0.1);
        song.loop();
    } else if (charClass == "tank"){
        song = tankSong
        song.volume(0.05);
        song.loop();
    } else if (charClass == "doc"){
        song = docSong;
        song.volume(0.1);
        song.loop();
    } else if (charClass == "captain"){
        song = captainSong
        song.volume(0.05);
        song.loop();
    } else if (charClass == "samurai"){
        song = samuraiSong
        song.volume(0.05);
        song.loop();
    } else if (charClass == "rever"){
        song = reverSong
        song.volume(0.05);
        song.loop();
    } else if (charClass == "cardmaster"){
        song = cardmasterSong
        song.volume(0.1);
        song.loop();
    }
}

function draw() {
    textSize(12)
    background(220);

    if (gameStart){
        socket.on('returnUpdate', update);
    }

    for (player in players){
        if (player == socket.id){
            base = players[socket.id].BASE;
            range = players[socket.id].RANGE;
        }
        if (map == 2){
            fill(220,20,60)
            rect(0, 1000 - range, mapWidth, 600)
            fill(102, 153, 153)
            rect(0, -600 - range, mapWidth, -600)
        }
        // fix next time... :( massive rip
        // if (players[socket.id].loadedSong == false){
        //     var song = createAudio("Assets/SongForGame.mp3");
        //     song.volume(0.2);
        //     song.loop();
        // }
    }

    fill("BLACK")
    rect(-20 - base, 0, 20, 600)
    rect(mapWidth - base, 0, 20, 600)
    fill("RED")
    if (mapDeathWall != 0){
        rect(mapDeathWall - base, 0, 30, 600)
        rect(mapWidth - mapDeathWall - base, 0, 30, 600)
    }

    if (winner != "none" && teamMode == "survival"){
        textSize(20)
        textAlign(CENTER)
        text("WINNER: " + winner, 600, 100)
        textSize(12)
    }
    for (var i = 0; i < platforms.length; i++) {
        if (platforms[i].speed === 0) {
            fill(4, 207, 95);
        } else {
            fill(247, 191, 60);
        }
        rect(platforms[i].x - base, platforms[i].y - range, platforms[i].width, platforms[i].height);
    }

    for (var i = 0; i < walls.length; i++) {
        fill(205, 249, 138);
        rect(walls[i].x - base, walls[i].y - range, walls[i].width, walls[i].height);
    }

    for (player in deadPlayers){
        fill("RED")
        rect(deadPlayers[player].x - base, deadPlayers[player].y- range, 40, 20);
    }

    if (bullets != []) {
        for (var i = 0; i < bullets.length; i++) {
            fill(bullets[i].colour)
            if (bullets[i].type == "beam" || bullets[i].type == "trap" || bullets[i].type == "ultrahealing" || bullets[i].type == "rush" || bullets[i].type == "rushStun"){
                rect(bullets[i].x - base, bullets[i].y - range, bullets[i].width, bullets[i].height);
            } else{
                if (bullets[i].dir == "up" || bullets[i].dir == "down"){
                    rect(bullets[i].x - base, bullets[i].y - range, bullets[i].height, bullets[i].width);
                } else {
                    rect(bullets[i].x- base, bullets[i].y - range, bullets[i].width, bullets[i].height);
                }
            }   
        }
    }
    if (gameStart){
        if (players[socket.id] != null){
            if (keyIsDown(83) && players[socket.id].reversed == false){
                console.log("trigger")
                key = "down";
                socket.emit('key',key);
            } else if (keyIsDown(87) && players[socket.id].reversed == true){
                key = "up";
                socket.emit('key',key);
            } 
            else if (keyIsDown(65)){
                key = "left";
                socket.emit('key',key);
            } else if (keyIsDown(68)){
                key = "right";
                socket.emit('key',key);
            } else {
                key = "none";
                socket.emit('key',key);
            }
        }
    }
    if(gameStart){
        for(player in players) {
            if (players[player].class == "assassin" && (gameTime - players[player].canShootCooldown) < players[player].shootTime){
                fill(76, 0, 153);
                if (players[player].dir == "left"){
                    rect(players[player].x - 20 - base, players[player].y+10 - range, 20, 12);
                } else if (players[player].dir == "right"){
                    rect(players[player].x + 20 - base, players[player].y+10 - range, 20, 12);
                } else {
                    rect(players[player].x + 20 - base, players[player].y+10 - range, 20, 12);
                }
            } else if (players[player].class == "huntsman" && (gameTime - players[player].canAbility1Cooldown) > 0 && (gameTime - players[player].canAbility1Cooldown) < 2) {
                fill("yellow");
                if (players[player].dir == "left"){
                    rect(players[player].x - 20 - base, players[player].y+10 -range, 20, 12);
                } else if (players[player].dir == "right"){
                    rect(players[player].x + 20 - base, players[player].y+10-range, 20, 12);
                } else {
                    rect(players[player].x + 20 - base, players[player].y+10-range, 20, 12);
                }
            }
            if (players[player].invis == true){
                if(socket.id == player){
                    fill(204, 255, 255);
                    rect(players[player].x - base, players[player].y-range, 20, players[player].height);
                    if(players[player].class == "assassin"){
                        fill("BLACK")
                        if (players[player].dir == "left"){
                            rect(players[player].x - base, players[player].y + 10-range, 14, 6)
                        } else if (players[player].dir == "up"){
                            rect(players[player].x - base, players[player].y + 10-range, 14, 6)
                        } else {
                            rect(players[player].x + 6 - base, players[player].y + 10-range, 14, 6)
                        }
                        fill("white")
                        rect(players[player].x - 5 - base, players[player].y - 35-range, 30, 5);
                        fill("black")
                        if ((gameTime - players[player].invisCooldown) < players[player].invisTime && players[player].invisTime != 0){
                            rect(players[player].x - 5 - base, players[player].y - 35-range, (gameTime - players[player].invisCooldown)/players[player].invisTime * 30, 5);
                        }
                    } else if (players[player].class == "watcher"){
                        fill("green")
                        rect(players[player].x - base - 1, players[player].y -range- 2, 22, 12)
                        if (players[player].dir == "left" || players[player].dir == "down"){
                            fill("BLUE")
                            rect(players[player].x - base + 1, players[player].y -range + 2, 5, 5)
                            rect(players[player].x - base + 12, players[player].y -range + 2, 5, 5)
                        } else{
                            fill("BLUE")
                            rect(players[player].x - base + 3, players[player].y -range + 2, 5, 5)
                            rect(players[player].x - base + 14, players[player].y -range + 2, 5, 5)
                        }
                    }
                    // healthbars
                    fill("white")
                    rect(players[player].x - players[player].width/2 - base, players[player].y - 10-range, players[player].origHeight, 5);
                    fill(44, 222, 0)
                    rect(players[player].x - players[player].width/2 - base, players[player].y - 10-range, players[player].origHeight * players[player].hp/players[player].maxHp, 5);
                    // usernames
                    textAlign(CENTER);
                    fill("black");
                    text(players[player].username, players[player].x + 10 - base, players[player].y - 15-range);
                    if (players[player].xAcceleration != players[player].xOrigA && players[player].class != "samurai"){
                        fill("white")
                        rect(players[player].x - 5 - base, players[player].y - 40-range, 30, 5);
                        fill(255, 178, 102)
                        rect(players[player].x - 5 - base, players[player].y - 40-range, (gameTime - players[player].speedCooldown)/players[player].speedTime * 30, 5);
                    }
                }
            } else {
                if(socket.id == player){
                    team = players[socket.id].team
                    fill(87, 109, 255);
                    rect(600 - players[player].width/2, 300 - players[player].height/2, players[player].width, players[player].height);
                } 
                else if (players[player].team == team) {
                    fill("GREEN");
                    rect(players[player].x - base, players[player].y-range, players[player].width, players[player].height);
                } 
                else{
                    fill("RED")
                    rect(players[player].x - base, players[player].y-range, players[player].width, players[player].height);
                }
                if (players[player].stun == true){
                    fill("WHITE")
                    rect(players[player].x - 5- base, players[player].y - 30-range, 30, 5);
                    fill("YELLOW")
                    if ((gameTime - players[player].stunCooldown) < players[player].stunTime){
                        rect(players[player].x - 5- base, players[player].y - 30-range, (gameTime - players[player].stunCooldown)/players[player].stunTime * 30, 5);
                    } else if ((gameTime - players[player].stunCooldown2) < players[player].stunTime){
                        rect(players[player].x - 5- base, players[player].y - 30-range, (gameTime - players[player].stunCooldown2)/players[player].stunTime * 30, 5);
                    }
                }
                if (players[player].marked == true){
                    fill("WHITE")
                    rect(players[player].x - 5- base, players[player].y - 35-range, 30, 5);
                    fill("CYAN")
                    if ((gameTime - players[player].markTimer) < players[player].markDuration){
                        rect(players[player].x - 5- base, players[player].y - 35-range, (gameTime - players[player].markTimer)/players[player].markDuration * 30, 5);
                    }
                }
                if (players[player].reversed == true && players[player].reversedTime != 0){
                    fill("WHITE")
                    rect(players[player].x - 5- base, players[player].y - 35-range, 30, 5);
                    fill(51, 102, 153)
                    if ((gameTime - players[player].reversedTime) < players[player].reversedDuration){
                        rect(players[player].x - 5- base, players[player].y - 35-range, (gameTime - players[player].reversedTime)/players[player].reversedDuration * 30, 5);
                    }
                }
                
                if (players[player].class == "tt" && socket.id == player && players[player].canUltimateCooldown == 0){
                    fill(0, 0 , 0, 50)
                    rect(players[player].pastX- base, players[player].pastY - range, 20, 40, 0.1)
                } else if (players[player].class == "ae" && players[player].invinc == true){
                    fill(0, 0 , 0, 50)
                    rect(players[player].pastX- base, players[player].pastY - range, 20, 40, 0.1)
                }
                if (players[player].class == "ae"){
                    fill("Black")
                    text(players[player].evil, players[player].x + 10 - base, players[player].y - 30- range)
                    fill("RED")
                    rect(players[player].x -base, players[player].y -range + 6, 20, 4)
                    rect(players[player].x -base + 6, players[player].y -range + 4, 8, 8)
                } else if (players[player].class == "watcher"){
                    fill("green")
                    rect(players[player].x - base - 1, players[player].y -range- 2, 22, 12)
                    if (players[player].dir == "left" || players[player].dir == "down"){
                        fill("BLUE")
                        rect(players[player].x - base + 1, players[player].y -range + 2, 5, 5)
                        rect(players[player].x - base + 12, players[player].y -range + 2, 5, 5)
                    } else{
                        fill("BLUE")
                        rect(players[player].x - base + 3, players[player].y -range + 2, 5, 5)
                        rect(players[player].x - base + 14, players[player].y -range + 2, 5, 5)
                    }
                }else if (players[player].class == "watcherClone"){
                    fill("green")
                    rect(players[player].x - base - 1, players[player].y -range- 2, 22, 12)
                    if (players[player].dir == "left" || players[player].dir == "down"){
                        fill("BLUE")
                        rect(players[player].x - base + 1, players[player].y -range + 2, 5, 5)
                        rect(players[player].x - base + 12, players[player].y -range + 2, 5, 5)
                    } else{
                        fill("BLUE")
                        rect(players[player].x - base + 3, players[player].y -range + 2, 5, 5)
                        rect(players[player].x - base + 14, players[player].y -range + 2, 5, 5)
                    }
                }
                if (players[player].class == "tt"){
                    if(players[player].height != 20){
                        fill("PURPLE")
                        rect(players[player].x - base, players[player].y - range + 18, 20, 22)
                        fill("CYAN")
                        rect(players[player].x - base, players[player].y - range + 15, 8, 25)
                        rect(players[player].x - base + 12, players[player].y - range + 15, 8, 25)
                    } else{
                        fill("PURPLE")
                        rect(players[player].x - base, players[player].y - range + 18, 20, 2)
                        fill("CYAN")
                        rect(players[player].x - base, players[player].y - range + 15, 8, 5)
                        rect(players[player].x - base + 12, players[player].y - range + 15, 8, 5)
                        
                    }
                } 
                if (players[player].class == "cardmaster"){
                    if(players[player].height != 20){
                        fill("black")
                        rect(players[player].x - base, players[player].y - range + 30, 20, 10)
                        fill("brown")
                        rect(players[player].x - base, players[player].y - range + 25, 20, 5)
                        fill("blue")
                        rect(players[player].x - base + 2, players[player].y - range + 23, 4, 8)
                        fill("red")
                        rect(players[player].x - base+ 8, players[player].y - range + 23, 4, 8)
                        fill("yellow")
                        rect(players[player].x - base + 14, players[player].y - range + 23, 4, 8)
                        
                    }
                }
                else if (players[player].class == "necro"){
                    if (players[player].dir == "down"){
                        fill("purple")
                        rect(players[player].x - base, players[player].y - range + 15, 20, 5)
                        rect(players[player].x - base + 20, players[player].y - range + 15, 5, 5)
                        fill("black")
                        rect(players[player].x - base + 25, players[player].y - range + 10, 5, 5)
                        fill(252, 50, 77)
                        rect(players[player].x - base + 25, players[player].y - range + 15, 5, 5)
                    } else if (players[player].dir == "left"|| players[player].dir == "up"){
                        fill("purple")
                        rect(players[player].x - base, players[player].y - range + 15, 20, 25)
                        rect(players[player].x - base -5, players[player].y - range + 15, 5, 8)
                        fill("black")
                        rect(players[player].x - base - 10, players[player].y - range + 10, 5, 5)
                        fill(252, 50, 77)
                        rect(players[player].x - base - 10, players[player].y - range + 15, 5, 25)
                    } else {
                        fill("purple")
                        rect(players[player].x - base, players[player].y - range + 15, 20, 25)
                        rect(players[player].x - base + 20, players[player].y - range + 15, 5, 8)
                        fill("black")
                        rect(players[player].x - base + 25, players[player].y - range + 10, 5, 5)
                        fill(252, 50, 77)
                        rect(players[player].x - base + 25, players[player].y - range + 15, 5, 25)
                    }
                }
                else if (players[player].class == "samurai"){
                    if (gameTime - players[player].ultimateDuration < players[player].ultDurTime && players[player].ultimateDuration != 0){
                        fill("WHITE")
                        rect(players[player].x - 5- base, players[player].y - 35-range, 30, 5);
                        fill("GOLD")
                        rect(players[player].x - 5 - base, players[player].y - 35 - range, (gameTime - players[player].ultimateDuration)/players[player].ultDurTime*30, 5)
                    }
                    if (players[player].dir == "right"|| players[player].dir == "up"){
                        fill("rgb(237, 133, 133)")
                        rect(players[player].x - base - 2, players[player].y - range, 24, 12)
                        rect(players[player].x - base - 7, players[player].y - range - 5, 10, 10)
                        rect(players[player].x - base - 13, players[player].y - range - 2, 8, 20)
                        fill("black")
                        rect(players[player].x - base + 5, players[player].y - range + 12, 4, 4)
                        fill("red")
                        rect(players[player].x - base + 15, players[player].y - range + 12, 4, 4)
                    } else if (players[player].dir == "left"|| players[player].dir == "down"){
                        fill("rgb(237, 133, 133)")
                        rect(players[player].x - base - 2, players[player].y - range, 24, 12)
                        rect(players[player].x - base + 18, players[player].y - range - 5, 10, 10)
                        rect(players[player].x - base + 26, players[player].y - range - 2, 8, 20)
                        fill("black")
                        rect(players[player].x - base, players[player].y - range + 12, 4, 4)
                        fill("red")
                        rect(players[player].x - base + 10, players[player].y - range + 12, 4, 4)
                    }
                }
                else if (players[player].class == "captain"){
                    if (gameTime - players[player].ultimateDuration < players[player].ultDurTime && players[player].ultimateDuration != 0){
                        fill("WHITE")
                        rect(players[player].x - 5- base, players[player].y - 35-range, 30, 5);
                        fill("GREY")
                        rect(players[player].x - 5 - base, players[player].y - 35 - range, (gameTime - players[player].ultimateDuration)/players[player].ultDurTime*30, 5)
                    }
                    fill("BROWN")
                    rect(players[player].x - base - 8, players[player].y + 5-range, 36, 5)
                    rect(players[player].x - base, players[player].y -range , 20, 5)
                    fill("WHITE")
                    rect(players[player].x - base - 10, players[player].y - range - 5, 40, 3)
                    fill(102, 153, 153)
                    if (players[player].dir == "right"){
                        rect(players[player].x - base, players[player].y + 20 - range, 8, 3)
                        rect(players[player].x - base, players[player].y + 20 - range, 3, 5)
                        rect(players[player].x - base + 20, players[player].y + 24 - range, 8, 3)
                        rect(players[player].x - base + 20, players[player].y + 24 - range, 3, 5)
                    } else if (players[player].dir == "left" || players[player].dir == "up"){
                        rect(players[player].x - base - 8, players[player].y + 24 - range, 8, 3)
                        rect(players[player].x - base - 3, players[player].y + 24 - range, 3, 5)
                        rect(players[player].x - base + 12, players[player].y + 20 - range, 8, 3)
                        rect(players[player].x - base + 17, players[player].y + 20 - range, 3, 5)
                    }
                    for (var i = 0; i < players[player].ammo; i++){
                        rect(players[player].x - base - 8 + (i - 1)*2, players[player].y - range - 5, 2, 3)
                    }
                }else if (players[player].class == "rever"){
                    fill("black")
                    rect(players[player].x - base + 7.5, players[player].y -range , 5, 5)
                    rect(players[player].x - base + 7.5, players[player].y -range + 8 , 5, 5)
                    fill("WHITE")
                    rect(players[player].x - base - 10, players[player].y - range - 5, 40, 3)
                    fill ("cyan")
                    rect(players[player].x - base - 10, players[player].y - range - 5, players[player].charge/100 *40, 3)
                }
                else if (players[player].class == "deadeye"){
                    fill("BROWN")
                    rect(players[player].x - base - 8, players[player].y + 5-range, 36, 5)
                    rect(players[player].x - base, players[player].y -range , 20, 5)
                    fill("BLACK")
                    if (players[player].dir == "left" || players[player].dir == "up"){
                        rect(players[player].x - base + 2, players[player].y - range + 10, 14, 3)
                    } else {
                        rect(players[player].x - base + 4, players[player].y - range + 10, 14, 3)
                    }
                    fill("WHITE")
                    rect(players[player].x - base - 10, players[player].y - range - 5, 40, 3)
                    fill ("RED")
                    for (var i = 0; i < players[player].ammo; i++){
                        rect(players[player].x - base - 3 + (i - 1)*6.6, players[player].y - range - 5, 6.6, 3)
                    }
                    if (gameTime - players[player].ultimateDuration < players[player].ultDurTime && players[player].ultDurTime != 0){
                        fill("RED")
                        if (players[player].dir == "left" || players[player].dir == "up"){
                            rect(players[player].x - base + 2, players[player].y - range + 10, 14, 3)
                        } else {
                            rect(players[player].x - base + 4, players[player].y - range + 10, 14, 3)
                        }
                        fill("WHITE")
                        rect(players[player].x - base - 10, players[player].y - range - 30, 40, 3)
                        fill("BLACK")
                        rect(players[player].x - base - 10, players[player].y - range - 30, ((gameTime - players[player].ultimateDuration)/players[player].ultDurTime) * 40, 3)
                    }
                }
                else if(players[player].class == "doc"){
                    fill("white")
                    rect(players[player].x - base, players[player].y -range, 20, 10)
                    fill ("red")
                    rect(players[player].x - base, players[player].y-range , 6, 10)
                    rect(players[player].x - base + 14, players[player].y-range , 6, 10)
                    if (players[player].dir == "left" || players[player].dir == "up"){
                        rect(players[player].x - base - 5, players[player].y-range + 10, 25, 5)
                    } else {
                        rect(players[player].x - base, players[player].y-range + 10, 25, 5)
                    }
                }
                else if(players[player].class == "huntsman"){
                    fill("BROWN")
                    rect(players[player].x - base - 8, players[player].y + 5-range, 36, 5)
                    rect(players[player].x - base, players[player].y -range, 20, 5)
                    if (players[player].dir == "left"){
                        rect(players[player].x - base - 1, players[player].y-range + 15, 22, 15)
                        rect(players[player].x - base + 21, players[player].y -range+ 16, 10, 20)
                    } else if (players[player].dir == "up"){
                        rect(players[player].x - base - 1, players[player].y-range + 15, 22, 15)
                        rect(players[player].x - base + 21, players[player].y-range + 16, 10, 20)
                    } 
                    else {
                        rect(players[player].x - base - 1, players[player].y-range + 15, 22, 15)
                        rect(players[player].x - base - 11, players[player].y-range + 16, 10, 20)
                    }
                }
                else if(players[player].class == "assassin" || players[player].class == "aiA"){
                    fill("BLACK")
                    if (players[player].dir == "left"){
                        rect(players[player].x - base, players[player].y + 10-range, 14, 6)
                    } else if (players[player].dir == "up"){
                        rect(players[player].x - base, players[player].y + 10-range, 14, 6)
                    } else {
                        rect(players[player].x + 6 - base, players[player].y -range+ 10, 14, 6)
                    }
                }
                else if (players[player].class == "tank" || players[player].class == "aiTank"){
                    fill(66, 245, 239)
                    rect(players[player].x - 2 - base, players[player].y -range+ 5, 4 + players[player].width, 10)
                }
                else if (players[player].class == "mercenary" || players[player].class == "aiMerc"){
                    fill(66, 47, 79)
                    if (players[player].dir == "left"){
                        rect(players[player].x - base, players[player].y-range, 20, 8)
                        rect(players[player].x - 6 - base, players[player].y -range+ 8, 26, 8)
                    } else if (players[player].dir == "up"){
                        rect(players[player].x- base, players[player].y-range, 20, 8)
                        rect(players[player].x - 6 - base, players[player].y-range + 8, 26, 8)
                    } else {
                        rect(players[player].x- base, players[player].y-range, 20, 8)
                        rect(players[player].x- base, players[player].y -range+ 8, 26, 8)
                    }
                }
                else if (players[player].class == "spellslinger"){
                    fill(161, 94, 0)
                    if (players[player].height == players[player].origHeight/2 ){
                        rect(players[player].x - 1- base, players[player].y-range + 15, 22, 10);
                    } else {
                        rect(players[player].x - 1- base, players[player].y-range + 15, 22, 25);
                    }
                }
                if(players[player].class == "tank" && players[player].ultimateDuration != 0){
                    fill("white")
                    rect(players[player].x - 5- base, players[player].y-range - 40, 30, 5);
                    fill(255, 178, 102)
                    rect(players[player].x - 5- base, players[player].y -range- 40, (gameTime - players[player].ultimateDuration)/players[player].ultDurTime * 30, 5);
                }
                if (players[player].xAcceleration > players[player].xOrigA && players[player].class != "samurai" && players[player].class != "juggernaut"){
                    fill("white")
                    rect(players[player].x - 5- base, players[player].y-range - 40, 30, 5);
                    fill(255, 178, 102)
                    rect(players[player].x - 5- base, players[player].y-range - 40, (gameTime - players[player].speedCooldown)/players[player].speedTime * 30, 5);
                }
                // healthbars
                if (players[player].class != "juggernaut"){
                    fill("white")
                    rect(players[player].x - players[player].width/2- base, players[player].y-range - 10, players[player].origWidth*2, 5);
                    fill(44, 222, 0)
                    rect(players[player].x - players[player].width/2- base, players[player].y -range- 10, players[player].origWidth*2 * players[player].hp/players[player].maxHp, 5);
                } else{
                    fill("white")
                    rect(players[player].x - 14- base, players[player].y-range - 10, 60, 5);
                    fill(44, 222, 0)
                    rect(players[player].x - 14- base, players[player].y -range- 10, 60 * players[player].hp/200, 5);
                }
                // usernames
                textAlign(CENTER);
                fill("black");
                text(players[player].username, players[player].x + players[player].width/2 - base, players[player].y -range- 15);
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
                if (gameTime - players[player].canShootCooldown > players[player].shootTime || players[player].canShoot == true){
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
                if (gameTime - players[player].canAbility1Cooldown > players[player].a1Time || players[player].canAbility1 == true){
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
                    fill("YELLOW");
                    rect(30, 70, (gameTime - players[player].canUltimateCooldown)/players[player].ultTime * 100, 10);
                }
                textSize(20);
                if (teamMode == "tdm"){
                    fill("RED")
                    textSize(20);
                    text("Team A Kills: " + team2Kills, 500, 20);
                    fill("BLUE")
                    text("Team B Kills: " + team1Kills, 700, 20);
                }
                fill("black")
                text(Math.round(gameTime/10), 600, 20)
                // Kills
                textAlign(RIGHT)
                fill("BLACK")
                textSize(20);
                text("Kills: " + players[socket.id].kills, 1180, 20);
                // Kills TEAMS
                textSize(18);
                if (killing[0] != "none"){
                    text(killing[0] + " has killed " + killed[0], 1180, 60)
                }
                if (killing[1] != "none"){
                    text(killing[1] + " has killed " + killed[1], 1180, 80)
                }
                if (killing[2] != "none"){
                    text(killing[2] + " has killed " + killed[2], 1180, 100)
                }
                textAlign(CENTER)
                textSize(12);
            }
        }
    }
    fill("RED")
    if (winner != "none" && teamMode == "coop"){
        textSize(20)
        textAlign(CENTER)
        text("GAME OVER", 600, 100)
        text("Waves Survived: " + wave, 600, 150)
        textSize(12)
    }

    if (teamMode == "coop"){
        textSize(20)
        fill("BLACK")
        textAlign(CENTER)
        text("Wave: " + wave, 600, 40);
        textAlign(RIGHT)
        text("Enemies: " + enemiesLeft, 1180, 40);
        textSize(12)
        textAlign(CENTER)
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
    if (players[socket.id] != null){
        if (keyIsDown(87) && players[socket.id].reversed == false){
            key = "up";
            socket.emit('key',key);
        }
        if (keyIsDown(83)&& players[socket.id].reversed == true){
            key = "down";
            socket.emit('key',key);
        }
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
    team1Kills = returnList[7];
    team2Kills = returnList[8];
    teamMode = returnList[9];
    killing = returnList[10];
    killed = returnList[11];
    mapDeathWall = returnList[12];
    winner = returnList[13];
    wave = returnList[14];
    enemiesLeft = returnList[15];
}

function respawn(){
    $('#myModal').appendTo('body').modal('show');
    song.stop()
}

function displayTeamRadio(teamMode){
    if (teamMode == "tdm"){
        $("#team").html('<p>Choose a team:</p><input type="radio" id="teamA" name="team" value="teamA" checked><label for="teamA">TEAM A</label><br><input type="radio" id="teamB" name="team" value="teamB"><label for="teamB">TEAM B</label><br>')
    }
}