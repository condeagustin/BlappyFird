var keyboard = {

	init : function(){
		$(window).keyup(this.handleKeyUp);
	},

	handleKeyUp : function(e){

		if(game.isOver) {
			return;
		}
		
		if(!e){
			e = event;
		}
		var key = e.keyCode || e.which;
		
		switch(key){

			//SPACE
			case 32:

				if(!game.hasStarted) {
					if(loader.loaded){
						game.start();
					} else {
						loader.onload = game.start;
					}
					return;
				}

				player.jump();
				break;
		}
	}
};


var touching = {

	init : function() {

		game.canvas.addEventListener("touchstart", this.handleTouchStart, false);
	},

	handleTouchStart : function(e){

		e.preventDefault();
		//var touch = e.targetTouches[0];
		if(!game.hasStarted) {
		
			loader.loadSounds();
			if(loader.loaded){
				game.start();
			} else {
				loader.onload = game.start;
			}
			return;
		}
		
		player.jump();

	}

};

var mouse = {
	
	
	init:function(){
		
		$('#gamecanvas').mousedown(mouse.mousedownhandler);
	},
	mousedownhandler:function(ev){
		
		if(!game.hasStarted) {
			if(loader.loaded){
				game.start();
			} else {
				loader.onload = game.start;
			}
			return;
		}
		player.jump();
		ev.originalEvent.preventDefault();
	}
}