
var box2d = {
	//30 pixels on our canvas correspond to 1 meter in the box2d world
	scale : 30,
	//As per the Box2d manual, the suggested iteration count for Box2D is 8 for velocity and 3 for position.
	velocityIterations : 8,
	positionIterations : 3,
	init : function() {

		// Setup the box2d World that will do most of they physics calculation
		var gravity = new b2Vec2(0, 40);
		
		//Allow objects that are at rest to fall asleep and be excluded from calculations
		var allowSleep = true;

		this.world = new b2World(gravity,allowSleep);

		var debugDraw = new b2DebugDraw();
		// Use this canvas context for drawing the debugging screen
		debugDraw.SetSprite(document.getElementById("gamecanvas").getContext("2d"));
		// Set the scale 
		debugDraw.SetDrawScale(this.scale);
		// Fill boxes with an alpha transparency of 0.3
		debugDraw.SetFillAlpha(0.3);
		// Draw lines with a thickness of 1
		debugDraw.SetLineThickness(1.0);
		// Display all shapes and joints
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);	

		// Start using debug draw in our world
		this.world.SetDebugDraw(debugDraw);

		var listener = new Box2D.Dynamics.b2ContactListener;

		listener.BeginContact = function(contact) {

			var body1 = contact.GetFixtureA().GetBody();
			var body2 = contact.GetFixtureB().GetBody();

			var body1UserData = body1.GetUserData();
			var body2UserData = body2.GetUserData();

			var itemBodyToDestroy = null;

			if(body1UserData.gameplayType == "item") {

				itemBodyToDestroy = body1;
			}
			else if(body2UserData.gameplayType == "item") {

				itemBodyToDestroy = body2;				
			}

			if(itemBodyToDestroy){

				var userData = itemBodyToDestroy.GetUserData();
				userData.destroy = true;
				itemBodyToDestroy.SetUserData(userData);
				game.updateBirthdayMessage();
			
			}
			//The player only loses if it touches everything except the ceiling
			else if(body1 != level.ceiling.body && body2 != level.ceiling.body) {

				game.endGame();
			}

		};

		this.world.SetContactListener(listener);

	},

	destroy : function() {

		for (var body = this.world.GetBodyList(); body; body = body.GetNext()) {

			this.world.DestroyBody(body);
		}
	},

	step : function(timeStep) {

		this.world.Step(timeStep, this.velocityIterations, this.positionIterations);
	},

	/**
		Creates a Box 2D rectangle
		@param {Object} o
		@param {Number} o.x
		@param {Number} o.y
		@param {Number} o.width
		@param {Number} o.height
		@param {Number} [o.type]
		@param {Number} [o.density]
		@param {Number} [o.friction]
		@param {Number} [o.restitution]
	*/
	createRectangle : function(o){ 
		
		var bodyDef = new b2BodyDef;
		bodyDef.type = o.type || b2Body.b2_staticBody;		
		bodyDef.position.x = o.x/this.scale;
		bodyDef.position.y = o.y/this.scale;
		
		// A fixture is used to attach a shape to a body for collision detection.
		// A fixture definition is used to create a fixture
		var fixtureDef = new b2FixtureDef;
		fixtureDef.density = o.density || 1.0;
		fixtureDef.friction = o.friction || 0.5;
		fixtureDef.restitution = o.restitution || 0.2;
		fixtureDef.isSensor = o.isSensor || false;
		
		fixtureDef.shape = new b2PolygonShape;
		fixtureDef.shape.SetAsBox((o.width/2)/this.scale, (o.height/2)/this.scale);

		var body = this.world.CreateBody(bodyDef);
		body.SetUserData({width: o.width, height: o.height, gameplayType: o.gameplayType});

		var fixture = body.CreateFixture(fixtureDef);
		return body;
	},

	/**
	* Creates a Box 2D circle body
	*
	*/
	createCircle : function(o){

		var bodyDef = new b2BodyDef;
		bodyDef.type = o.type || b2Body.b2_staticBody;
		bodyDef.position.x = o.x/this.scale;
		bodyDef.position.y = o.y/this.scale;

		var fixtureDef = new b2FixtureDef;
		fixtureDef.density = o.density || 1.0;
		fixtureDef.friction = o.friction || 0.5;
		fixtureDef.restitution = o.restitution || 0.4;
		fixtureDef.isSensor = o.isSensor || false;
		
		fixtureDef.shape = new b2CircleShape(o.radius/this.scale);
		
		var body = this.world.CreateBody(bodyDef);
		body.SetUserData({radius: o.radius, gameplayType: o.gameplayType});

		var fixture = body.CreateFixture(fixtureDef);

		return body;
	},

	checkCollisionBetweenRectangles : function(rectangle1, rectangle2) {

		if(!rectangle1 || !rectangle2) {
			return false;
		}

		if(rectangle1.left > rectangle2.right || rectangle1.right < rectangle2.left || rectangle1.top > rectangle2.bottom || rectangle1.bottom < rectangle2.top) {
			return false;
		}
		
		return true;
	}
};