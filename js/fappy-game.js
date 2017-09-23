$(window).load(function(){
	game.init();
});

var game = {
	
	init : function(){
		// Setup the box2d World that will do most of they physics calculation
		
		this.canvas =  document.getElementById('gamecanvas');
		this.context = this.canvas.getContext('2d');
		
		this.debug = document.getElementById("debug");
		this.debugLines = 0;
		this.debug.style.display = "none";

		$("#playAgain").click(game.playAgain);

		loader.init();
		player.init();
		level.init();
		keyboard.init();
		touching.init();
		mouse.init();

		this.birthdayMusic = loader.loadSound('audio/birthday');
		
		this.scoreSound = loader.loadSound('audio/score');

		this.birthdayColors = ["yellow", "red", "chartreuse", "orangeRed"];
		this.birthdayMessages = ["Hello", "...from my heart", "HAPPY BIRTHDAY!"];
		
		this.birthdayIndex = 0;
		
		this.log("isMobile: " + isMobile());
		
		$('#gamecanvas').show();
		
	},
	
	log: function(message) {
		this.debug.innerHTML += message + "</br>";
		this.debugLines++;
		if(this.debugLines == 20) {
			this.debug.innerHTML = "";
			this.debugLines = 0;
		}
	},

	playAgain : function() {
		window.cancelAnimationFrame(game.animationFrame);		
		game.lastUpdateTime = undefined;
		box2d.destroy();
		game.start();
	},

	incrementScore : function() {

		this.scoreSound.play();
		game.score++;
		$('#score').html(game.score);
	},

	updateBirthdayMessage : function() {

		this.birthdayIndex++;

		if(this.birthdayIndex == this.birthdayMessages.length -1) {
			this.birthdayMusic.play();			
		}

		if(this.birthdayIndex == this.birthdayMessages.length) {

			this.birthdayIndex = 0;
		}

		$('#birthdayscreen').css("color", this.birthdayColors[Math.round(Math.random()*(this.birthdayColors.length-1))]);

		$('#birthdaymessage').html(this.birthdayMessages[this.birthdayIndex]);
	},

	start : function() {
		
		$('.gamelayer').hide();
		$('#gamecanvas').show();
		box2d.init();
		player.load();
		level.load();
		this.score = 0;
		this.timeSinceLastFrame = 0;
		
		$('#score').html(game.score);
		$('#scorescreen').show();

		this.birthdayIndex = 0;
		$('#birthdayscreen').css("color", "yellow");
		$('#birthdaymessage').html(this.birthdayMessages[this.birthdayIndex]);
		$('#birthdayscreen').show();
		
		this.hasStarted = true;
		this.isOver = false;
		this.isPaused = false;

		this.animationFrame = window.requestAnimationFrame(this.gameLoop, this.canvas);
	},

	endGame : function() {

		player.playDeathSound();
		game.isOver = true;
		$("#endingscreen").show();
	},

	update : function() {

		level.update();
		player.update();
	},

	draw : function() {

		game.context.fillStyle = "#255d7e";
		game.context.fillRect(0, 0, game.canvas.width, game.canvas.height);
		//box2d.world.DrawDebugData();
		level.draw();
		player.draw();
	},

	gameLoop : function(){

		game.update();

		game.draw();
		
		var currentTime = new Date().getTime();


		//Calculate time since last frame to update variable framerate in box 2d
		if(game.lastUpdateTime) {

			//store time since last frame (in seconds)
			game.timeSinceLastFrame = (currentTime - game.lastUpdateTime)/1000;
			
			if(game.timeSinceLastFrame > 2/60) {

				game.timeSinceLastFrame = 2/60;
			}

			box2d.step(game.timeSinceLastFrame);

		}

		game.lastUpdateTime = currentTime;

		if(!game.isOver) {
			game.animationFrame = window.requestAnimationFrame(game.gameLoop, game.canvas);	
		}
		
	}
		
};