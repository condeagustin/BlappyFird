var animationFactory = (function() {

	function update() {

		if(!this.running) {
			return;
		}

		this.frameTimer += game.timeSinceLastFrame*1000;

		var currentFrame = this.getCurrentFrame();

		var delay = currentFrame ? currentFrame.delay : this.delay;

		if(this.frameTimer >= delay) {

			this.frameTimer = 0;

			var widthLength = this.frames ? this.frames.length : this.tileMapWidth - 1;
			//we can increment column before we hit the tile width
			if(this.currentPosition.column < widthLength) {
				this.currentPosition.column++;
				this.framesCounter++;
			}
			//once we have reached the tile width limit then we go down another row
			else {

				this.currentPosition.row++;
				this.currentPosition.column = 0;
				this.framesCounter++;
				
			}

			var numberOfFrames = this.frames ? this.frames.length : this.tilesAmount;

			if(this.framesCounter > numberOfFrames) {

				this.currentPosition.row = this.initialPosition.row;
				this.currentPosition.column = this.initialPosition.column;
				this.framesCounter = 1;

				if(!this.repeat) {

					running = false;
				}
			}
		}
	}

	function getCurrentFrame() {

		if(this.frames) {

			return this.frames[this.currentPosition.column];	
		}

		return null;
		
	}

	function getCurrentPosition() {

		return this.currentPosition;
	}

	return {

		createAnimation : function(o) {

			var animationInstance = {
				frames : o.frames,
				//current position in the spritesheet
				initialPosition : o.initialPosition || {row: 0, column: 0},
				tileMapWidth : o.tileMapWidth,
				tileMapHeight : o.tileMapHeight,
				//actual number of tiles to use for the animation (equivalent to this.frames.length)
				tilesAmount : o.tilesAmount,
				framesCounter : 1,
				//timer in milliseconds
				frameTimer : 0,
				delay : o.delay || 100,
				repeat : o.repeat || true,
				running : o.running || true,
				getCurrentFrame : getCurrentFrame,
				getCurrentPosition : getCurrentPosition,
				update : update
			};

			animationInstance.currentPosition = {row : animationInstance.initialPosition.row, column : animationInstance.initialPosition.column};

			return animationInstance;
		}


	};

})();