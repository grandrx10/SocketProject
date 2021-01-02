var socket;
var players;
var platforms = [];
var bullets = [];
var deadPlayers = [];
var gameStart = false;
var userNameSubmitted = false;

function setup(){
    createCanvas(1200,600);
    background(51);
    frameRate(60);

    socket = io.connect();
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
    for (var i = 0; i < platforms.length; i++) {
        if (platforms[i].speed === 0) {
            fill(4, 207, 95);
        } else {
            fill(247, 191, 60);
        }
        rect(platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height);
    }

    for (player in deadPlayers){
        fill("RED")
        rect(deadPlayers[player].x, deadPlayers[player].y, 40, 20);
    }

    if (bullets != []) {
        for (var i = 0; i < bullets.length; i++) {
            if (bullets[i].shooter == socket.id){
                fill("BLUE");
            } else{
                fill("RED")
            }
            rect(bullets[i].x, bullets[i].y, 10, 10);
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
            if(socket.id == player){
                fill(87, 109, 255);
            } else {
                fill("red");
            }
            rect(players[player].x, players[player].y, 20, 40);
            fill("white")
            rect(players[player].x - 10, players[player].y - 10, 40, 5);
            fill("green")
            rect(players[player].x - 10, players[player].y - 10, 40 * players[player].hp/100, 5);
            textAlign(CENTER);
            fill("black");
            text(players[player].username, players[player].x + 10, players[player].y - 15);
        }
    }
}

function keyPressed(){
    if (keyCode == 32) {
        console.log('space was pressed')
        socket.emit('shoot', 1);
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
}

function respawn(){
    $('#myModal').appendTo('body').modal('show');
}