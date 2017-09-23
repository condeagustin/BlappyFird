var level = {
	
	init : function() {

		this.holeHeight = game.canvas.height/4.5;
		this.minHoleY = 100;
		this.maxHoleY = game.canvas.height - 160 - this.holeHeight;
		this.pipeWidth = 32;
		this.pipeSpeed = 150/box2d.scale;
		//how often (in seconds) to create obstacles
		this.timeToCreateObstacle = 2;
		
		this.ceiling ={};

		this.floor = {
			speed : 150
		};

		this.condomTipSprite = loader.loadImage("images/condomTip.png");
		this.condomBodySprite = loader.loadImage("images/condomBody.png");
		this.floor.sprite = loader.loadImage("images/floor.png");
		
		this.heart1 = {
			spriteSheet : loader.loadImage("images/heart1.png"),
			tileWidth : 50,
			tileHeight : 50,
			tileMapWidth : 24,
			tileMapHeight : 1,
			tilesAmount : 24
		};

		this.heart2 = {
			spriteSheet : loader.loadImage("images/heart2.png"),
			tileWidth : 50,
			tileHeight : 45,
			tileMapWidth : 4,
			tileMapHeight : 1,
			tilesAmount : 4
		};
	

		this.birthdayItems = [this.heart1, this.heart2];

		this.heartSound = loader.loadSound('audio/heart');
	},

	load : function() {

		this.time = 0;
		this.obstacles = [];

		//create the ceiling body
		this.ceiling.body = box2d.createRectangle({
			x : game.canvas.width/2,
			y : -20,
			width : game.canvas.width,
			height : 10
		});
 
 		//create the floor body
		this.floor.body = box2d.createRectangle({
			x : game.canvas.width/2,
			y : game.canvas.height - 30,
			width : game.canvas.width,
			height : 60,
			isSensor : true
		});

		this.floor.spriteX = -this.floor.body.GetUserData().width/2;
		
	},

	attemptToDestroyObstacle : function(obstacle) {

		if(!obstacle) {
			return;
		}

		var pipe = obstacle.upPipe || obstacle.downPipe;		

		if(pipe.GetPosition().x*box2d.scale < -this.pipeWidth/2){
			
			this.obstacles.shift();

			if(obstacle.upPipe){
				box2d.world.DestroyBody(obstacle.upPipe);
			}
			
			if(obstacle.downPipe){
				box2d.world.DestroyBody(obstacle.downPipe);				
			}
		}

	},

	update : function() {

		this.updateFloor();

		this.attemptToDestroyObstacle(this.obstacles[0]);

		for(var i = 0; i < this.obstacles.length; i++){

			this.updateObstacle(this.obstacles[i]);
		}
		
		if(this.time >= this.timeToCreateObstacle){
			this.createObstacle();    
			this.time = 0;
		}

		this.time += game.timeSinceLastFrame;
	},

	updateFloor : function() {

		this.floor.spriteX -=  this.floor.speed * game.timeSinceLastFrame;

		var originalX = -this.floor.body.GetUserData().width/2;

		if( originalX - this.floor.spriteX > this.floor.sprite.width) {

			this.floor.spriteX = originalX;
		}

	},

	createObstacle : function() {

		var obstacle = {};

		var holeY = Math.floor((Math.random()*this.maxHoleY)+1);
		
		holeY = Math.max(holeY, this.minHoleY);

		var pipeHeight;

		//create up pipe
		pipeHeight = holeY;
		obstacle.upPipe = box2d.createRectangle({
			//x coordinate in pixels with center as pivot point
			x : game.canvas.width,
			//y coordinate in pixles with center as pivot point   
			y : pipeHeight/2,
			//width in pixels			
			width : this.pipeWidth,
			//height in pixels
			height : pipeHeight,
			restitution : 0,
			isSensor : true
		});
		
		obstacle.upPipe.isUp = true;
		obstacle.upPipe.boundingBox = {};

		//create the item
		var itemSprite = this.birthdayItems[Math.round(Math.random()*(this.birthdayItems.length-1))];

		obstacle.item = {
			sprite : itemSprite,
			animation : animationFactory.createAnimation({
				tileMapWidth : itemSprite.tileMapWidth,
				tileMapHeight : itemSprite.tileMapHeight,
				tilesAmount : itemSprite.tilesAmount
			}),
			body : box2d.createCircle({
				x : game.canvas.width,
				y : pipeHeight + this.holeHeight/2,
				radius : itemSprite.tileWidth/2,
				//height : itemSprite.tileHeight,
				restitution : 0,
				isSensor : true,
				gameplayType : "item"
			})
		};

		//create down pipe
		pipeHeight = game.canvas.height - 60 - (holeY+this.holeHeight);

		obstacle.downPipe = box2d.createRectangle({
			x : game.canvas.width,
			y : game.canvas.height - 60 - pipeHeight/2,
			width : this.pipeWidth,
			height : pipeHeight,
			restitution : 0,
			isSensor : true
		})
		obstacle.downPipe.boundingBox = {};

		this.obstacles.push(obstacle);

	},

	updateObstacle : function(obstacle){

		
		this.updatePipe(obstacle.upPipe);
		this.updateItem(obstacle.item);
		this.updatePipe(obstacle.downPipe);

		if(obstacle.passedByPlayer) {
			return;
		}

		var pipe = obstacle.upPipe || obstacle.downPipe;

		if(player.tail.boundingBox.left > pipe.boundingBox.right) {
			game.incrementScore();
			obstacle.passedByPlayer = true;
		}

		var pipeRectangle = obstacle.upPipe ? obstacle.upPipe.boundingBox : null;
		var collisionWithObstacle = box2d.checkCollisionBetweenRectangles(player.tail.boundingBox, pipeRectangle);

		if(collisionWithObstacle) {
			//console.info("Collision with up pipe")
			game.endGame();
			return;
		}

		pipeRectangle = obstacle.downPipe ? obstacle.downPipe.boundingBox : null;
		collisionWithObstacle = box2d.checkCollisionBetweenRectangles(player.tail.boundingBox, pipeRectangle);

		if(collisionWithObstacle) {
			//console.info("Collision with down pipe");
			game.endGame();
			return;
		}
		
	},

	updateItem : function(item) {

		if(!item.body) {
			return;
		}

		var userData = item.body.GetUserData();

		if(userData.destroy) {
			this.heartSound.play();
			box2d.world.DestroyBody(item.body);
			item.body = null;
			item.animation = null;
			return;
		}

		var newX = item.body.GetPosition().x - this.pipeSpeed*game.timeSinceLastFrame;

		item.body.SetPosition({x: newX, y:item.body.GetPosition().y});

		item.animation.update();
	},

	updatePipe : function(pipe){

		if(!pipe) {
			return;
		}

		var newX = pipe.GetPosition().x - this.pipeSpeed*game.timeSinceLastFrame;

		pipe.SetPosition({x: newX, y: pipe.GetPosition().y});
	
	},

	draw : function() {

		this.drawFloor();

		for(var i=0; i<this.obstacles.length; i++) {

			var obstacle = this.obstacles[i];

			this.drawPipe(obstacle.upPipe);
			this.drawItem(obstacle.item);
			this.drawPipe(obstacle.downPipe);
		}

	},

	drawFloor : function() {

		var floorPosition =  this.floor.body.GetPosition();
		var floorData = this.floor.body.GetUserData();

		var canvasX = floorPosition.x * box2d.scale;
		var canvasY = floorPosition.y * box2d.scale;

		game.context.save();
		game.context.translate(canvasX, canvasY);

		var spriteX = this.floor.spriteX;

		var widthLeft = floorData.width + this.floor.sprite.width;

		while(widthLeft > 0) {

			game.context.drawImage(this.floor.sprite, spriteX, -floorData.height/2, this.floor.sprite.width, this.floor.sprite.height);

			widthLeft -= this.floor.sprite.width;
			spriteX += this.floor.sprite.width;
		}

		game.context.restore();


	},

	drawItem : function(item) {

		if(!item.body) {
			return;
		}

		var itemPosition = item.body.GetPosition();

		game.context.save();
		game.context.translate(itemPosition.x * box2d.scale, itemPosition.y * box2d.scale);

		var spriteX = -item.sprite.tileWidth/2;
		var spriteY = -item.sprite.tileHeight/2;
		var currentTilePosition = item.animation.getCurrentPosition();
		game.context.drawImage(item.sprite.spriteSheet, currentTilePosition.column*item.sprite.tileWidth, currentTilePosition.row*item.sprite.tileHeight, item.sprite.tileWidth, item.sprite.tileHeight, spriteX, spriteY, item.sprite.tileWidth, item.sprite.tileHeight);

		game.context.restore();		
	},

	drawPipe : function(pipe) {

		var pipePosition = pipe.GetPosition();
		var pipeData = pipe.GetUserData();
		
		var spriteXOffset = 2;
		var spriteY = -pipeData.height/2;
		var spriteAngle = 0;

		if(pipe.isUp) {

			spriteXOffset = -2
			spriteAngle = Math.PI;			
		}

		var canvasX = pipePosition.x * box2d.scale;
		var canvasY = pipePosition.y * box2d.scale;

		game.context.save();
		game.context.translate(canvasX, canvasY);
		game.context.rotate(spriteAngle);

		var spriteX =  -pipeData.width/2 + spriteXOffset;
		var heightLeft = pipeData.height;
		
		var heightToSubstract = this.condomTipSprite.height;

		pipe.boundingBox.left = canvasX + spriteX;
		pipe.boundingBox.top = canvasY + spriteY;
		pipe.boundingBox.right = pipe.boundingBox.left + pipeData.width;
		pipe.boundingBox.bottom = pipe.boundingBox.top + pipeData.height;

		//game.context.strokeStyle = "red";
		//game.context.strokeRect(spriteX, spriteY, pipeData.width, pipeData.height);
		
		while (heightLeft > 0) {
                 
			if(heightLeft == pipeData.height) {

				game.context.drawImage(this.condomTipSprite, spriteX, spriteY, this.condomTipSprite.width, this.condomTipSprite.height);
			}
			else if(heightLeft >= this.condomBodySprite.height) {
				
				game.context.drawImage(this.condomBodySprite, spriteX, spriteY, this.condomBodySprite.width, this.condomBodySprite.height);
				heightToSubstract = this.condomBodySprite.height;
			}
			else {

				game.context.drawImage(this.condomBodySprite, 0, 0, this.condomBodySprite.width, heightLeft, spriteX, spriteY, this.condomBodySprite.width, heightLeft);
			}
        
			spriteY += heightToSubstract - 1;
			heightLeft -= heightToSubstract -1;
		}

		game.context.restore();
	}

};