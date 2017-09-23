var player = {

	init : function(){

		this.sprite = loader.loadImage("images/fappy1.png");

		var frames = [
			{image: loader.loadImage("images/fappy1.png"), delay: 100},
			{image: loader.loadImage("images/fappy2.png"), delay: 100}
		];

		this.animation = animationFactory.createAnimation({
			frames: frames
		});

		this.tail = {};

		//these are the dimensions for the tail only in this.sprite image
		this.tail.dimensions = {

			width : 66,
			height: 25,
			//this is the top (y coordinate) relative to the center of the head
			relativeTop : -16
		};

		this.jumpSound = loader.loadSound('audio/jump1');
		
		this.deathSound = loader.loadSound('audio/death');
	},

	playDeathSound: function() {
		
		this.deathSound.play();
	},

	load : function() {

		this.body = box2d.createCircle({
			x : game.canvas.width/2,
			y : game.canvas.height/4,
			radius : 24,
			type : b2Body.b2_dynamicBody,
			restitution: 0
		});

		this.tail.boundingBox = {};

		//console.info("player body: %o", this.body);
	},   

	jump : function(pImpulse){
	
		this.jumpSound.play();	
		var impulse = pImpulse || new b2Vec2(0, -18);
		this.body.SetLinearVelocity(new b2Vec2(0, 0)); 
		this.body.ApplyImpulse(impulse, this.body.GetWorldCenter());
		    
	},

	update : function() {
		
		this.animation.update();
	},

	draw : function() {

		var playerPosition = this.body.GetPosition();
		var playerAngle = this.body.GetAngle();
		var playerData = this.body.GetUserData();

		var canvasX = playerPosition.x * box2d.scale;
		var canvasY = playerPosition.y * box2d.scale;

		game.context.save();
		game.context.translate(canvasX, canvasY);
		game.context.rotate(playerAngle);

		this.tail.boundingBox.left = canvasX - playerData.radius - this.tail.dimensions.width;
		this.tail.boundingBox.top = canvasY + this.tail.dimensions.relativeTop;
		this.tail.boundingBox.right = this.tail.boundingBox.left + this.tail.dimensions.width;
		this.tail.boundingBox.bottom = this.tail.boundingBox.top + this.tail.dimensions.height;

		//game.context.strokeStyle = "red";
		//game.context.strokeRect(-playerData.radius-this.tail.dimensions.width, this.tail.dimensions.relativeTop, this.tail.dimensions.width, this.tail.dimensions.height);

		//game.context.drawImage(this.sprite, -playerData.radius-67, -playerData.radius, this.sprite.width, this.sprite.height);
		var sprite = this.animation.getCurrentFrame().image;
		game.context.drawImage(sprite, -playerData.radius-67, -playerData.radius, sprite.width, sprite.height);

		game.context.restore();
	},
};