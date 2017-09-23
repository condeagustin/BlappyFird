var loader = {
	
	loaded: true,
	loadedCount: 0, //Assets that have been loaded so far
	totalCount: 0,
	sounds: [],
	init: function(){
		var mp3Support, oggSupport;
		var audio = document.createElement("audio");
		
		if(audio.canPlayType){
			//Currently canPlayType() returns: "", "maybe" or "probably"
			mp3Support = "" != audio.canPlayType("audio/mpeg");
			oggSupport = "" != audio.canPlayType('audio/ogg; codecs="vorbis"')
		} 
		else {
			//The audio tag is not supported
			mp3Support = false;
			oggSupport = false;
		}
		
		this.soundFileExtn = oggSupport ? ".ogg" : mp3Support? ".mp3" : undefined;
		game.log("soundFileExtn: " + this.soundFileExtn);
		
		this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
	},
	
	loadImage: function(url){
		
		this.totalCount++;
		this.loaded = false;
		
		var image = new Image();
		image.src = url;
		image.onload = this.itemLoaded;
		return image;
	},
	
	soundFileExtn: ".ogg",
	
	loadSound: function(url){
		
		var audio = new Audio();
		audio.src = url + this.soundFileExtn;
	
		if(isMobile()) {
			
			if(isIOS()) {
				
			}
			else { 
				this.sounds.push(audio);
			}
		}
		else {
			this.totalCount++;
			this.loaded = false;
			audio.addEventListener("canplaythrough", loader.itemLoaded, false);
		}
		
		return audio;
	},
	
	loadSounds : function() {
		
		for(var i=0; i<this.sounds.length; i++) {
			
			this.sounds[i].play();
			this.sounds[i].pause();
		}
	},
	
	itemLoaded: function(e){
		
		if(e.type == "canplaythrough") {
		
		}
		
		loader.loadedCount++;
		//console.debug("Loaded " + loader.loadedCount + " of " + loader.totalCount);
		if(loader.loadedCount == loader.totalCount){
			loader.loaded = true;
			if(loader.onload){
				loader.onload();
				loader.onload = undefined;
			}
		}
	}	
};