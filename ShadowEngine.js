/*
ShadowMask creates a lighting mask on a given canvas context
Pre: Takes in a canvas width, height, 2D context, and a shadow opacity
post: Generates a layer of shadows from obstacles and lights
*/
function ShadowMask(w, h, ctx, drk) {

	var obstacles;
	var lights;
	
	//private init method executed upon creation of ShadowMap.
	function init() {
		obstacles = [];
		lights = [];

		if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(paint, 40);
	}
	init();
	
	//private paint method executed every set interval.
	function paint() {
		ctx.clearRect(0, 0, w, h);
		ctx.globalAlpha = drk;
		ctx.globalCompositeOperation = "source-over";
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, w, h);

		drawObstacles();
		drawLights();
	}

	/*
	global updateObstacle method adds or updates an obstacle.
	pre: takes in id, x, y, dx, dy
	post: adds obstacle or changes the existing obstacle to match new obstacle
	*/
	this.updateObstacle = function(nid, nx, ny, ndx, ndy) {
		var found = false;
		for(var i = 0; i < obstacles.length; i++) {
			old = obstacles[i];
			if(old.id == nid) {
				old.x = nx;
				old.y = ny;
				old.dx = ndx;
				old.dy = ndy;
				found = true;
			}
		}
		if(found == false) obstacles.push({id:nid, x:nx, y:ny, dx:ndx, dy:ndy});
	};

	/*
	global updateLight method adds or updates a light source.
	pre: takes in id, x, y, i (brightness)
	post: adds light or changes the existing light to match new light
	*/
	this.updateLight = function(nid, nx, ny, ni) {
		var found = false;
		for(var i = 0; i < lights.length; i++) {
			old = lights[i];
			if(old.id == nid) {
				old.x = nx;
				old.y = ny;
				old.i = ni;
				found = true;
			}
		}
		if(found == false) lights.push({id:nid, x:nx, y:ny, i:ni});
	};

	//private drawObstacles method to stroke all line segments in obstacles array.
	function drawObstacles() {
		for(var i = 0; i < obstacles.length; i++) {
			var o = obstacles[i];
			ctx.globalAlpha = 1;
			ctx.lineWidth = 2;
			ctx.globalCompositeOperation = "source-over";
			ctx.strokeStyle = "white";
			ctx.beginPath();
			ctx.moveTo(o.x,o.y);
			ctx.lineTo(o.x+o.dx,o.y+o.dy);
			ctx.stroke();
		}
	}

	//private drawLights method to drawRays for everything in lights array.
	function drawLights() {
		for(var i = 0; i < lights.length; i++) {
			drawRays(lights[i]);
		}
	}

	//private drawRays method to draw a light source bounded by obstacles.
	function drawRays(l) {
		var angles = [];
		var prevs = [];
		for(var i = 0; i < obstacles.length; i++) {
			var c = obstacles[i];
			for(var z = -0.0000001; z <= 0.0000001; z += 0.0000001) {
				angle = Math.atan2(c.y-l.y, c.x-l.x)+z;
				if(angles.indexOf(angle) == -1) {
					var temp = shortestIntersect({x:l.x, y:l.y, dx:Math.cos(angle), dy:Math.sin(angle)});
					temp.d = angle;
					prevs.push(temp);
					angles.push(angle);
				}
			}
			for(var z = -0.0000001; z <= 0.0000001; z += 0.0000001) {
				angle = Math.atan2(c.y+c.dy-l.y, c.x+c.dx-l.x)+z;
				if(angles.indexOf(angle) == -1) {
					var temp = shortestIntersect({x:l.x, y:l.y, dx:Math.cos(angle), dy:Math.sin(angle)});
					temp.d = angle;
					prevs.push(temp);
					angles.push(angle);
				}
			}
		}
		prevs = prevs.sort(angleCompare);
		var temp = {x:prevs[0].x, y:prevs[0].y};
		for(var i = 1; i < prevs.length; i++) {
			ctx.lineWidth = 0.00000000001;
			ctx.globalAlpha = l.i;
			ctx.globalCompositeOperation = "destination-out";
			ctx.beginPath();
			ctx.moveTo(l.x, l.y);
			ctx.lineTo(temp.x, temp.y);
			ctx.lineTo(prevs[i].x, prevs[i].y);
			ctx.closePath();
			ctx.fill();
			temp.x = prevs[i].x;
			temp.y = prevs[i].y;
		}
		ctx.beginPath();
		ctx.moveTo(l.x, l.y);
		ctx.lineTo(temp.x, temp.y);
		ctx.lineTo(prevs[0].x, prevs[0].y);
		ctx.closePath();
		ctx.fill();
	}

	//private angleCompare method to sort array by angle (d).
	function angleCompare(a,b){
		if (a.d < b.d) return -1;
		if (a.d > b.d) return 1;
		return 0;
	}

	//private shortestIntersect method to findIntersect for all obstacles and
	//return point of intersection with shortest distance.
	function shortestIntersect(r) {
		var shortest = {x:r.x, y:r.y, d:9999999999999999999999999999999999999999};
		for(var i = 0; i < obstacles.length; i++) {
			var temp = findIntersect(r, obstacles[i]);
			if(Math.abs(temp.d) < Math.abs(shortest.d) && temp.d != 0) {
				shortest = temp;
			}
		}
		return shortest;
	}

	//private findIntersect method to find and return point at which ray and segment intersect
	//(returns 3-tuple of 0s if they don't).
	function findIntersect(r, s) {
		if(r.dx == s.dx && r.dy == s.dy) {
			return {x:0, y:0, d:0};
		} else {
			var T2 = (r.dx*(s.y-r.y) + r.dy*(r.x-s.x))/(s.dx*r.dy - s.dy*r.dx);
			var T1 = (s.x+s.dx*T2-r.x)/r.dx;
			if(T1 > 0 && T2 > 0 && T2 < 1) {
				var tempx = r.x+r.dx*T1;
				var tempy = r.y+r.dy*T1;
				return {x:tempx, y:tempy, d:T1};
			}
		}
		return {x:0, y:0, d:0};
	}
}

/*
ShadowSprites creates sprites on a given canvas context
pre: Takes in a canvas width, height, 2D context, background color
post: Paints created sprites from given frames and attributes
*/
function ShadowSprites(w, h, ctx, col) {

	var sprites;
	
	//private init method executed upon creation of ShadowSprites.
	function init() {
		sprites = [];

		if(typeof game_loop2 != "undefined") clearInterval(game_loop2);
		game_loop2 = setInterval(paint, 40);
	}
	init();
	
	//private paint method executed every set interval.
	function paint() {
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = "source-over";
		ctx.fillStyle = col;
		ctx.fillRect(0, 0, w, h);

		processSprites();
	}

	/*
	global updateSprite method changes sprites state variables
	pre: takes in sprite id, x, y, velx, vely
	post: adds or changes sprite
	*/
	this.updateSprite = function(nid, nx, ny, nvelx, nvely) {
		var found = false;
		for(var i = 0; i < sprites.length; i++) {
			old = sprites[i];
			if(old.id == nid) {
				old.x = nx;
				old.y = ny;
				old.velx = nvelx;
				old.vely = nvely;
				found = true;
			}
		}
		if(found == false) sprites.push({id:nid, x:nx, y:ny, velx:nvelx, vely:nvely, frames:[], curr:0});
	};

	/*
	global addFrame method adds a frame to sprite animation
	pre: takes in sprite id, image
	post: frame added
	*/
	this.addFrame = function(nid, img) {
		for(var i = 0; i < sprites.length; i++) {
			old = sprites[i];
			if(old.id == nid) {
				old.frames.push(img);
			}
		}
	};

	//private processSprites method moves and draws all of the sprites
	function processSprites() {
		for(var i = 0; i < sprites.length; i++) {
			s = sprites[i];
			if(s.frames.length != 0) {
				ctx.drawImage(s.frames[s.curr], s.x, s.y);
				if(s.curr == s.frames.length - 1) {
					s.curr = 0;
				} else {
					s.curr++;
				}
			}
			s.x += s.velx;
			s.y += s.vely;
		}
	}

	this.getSprite = function(nid) {
		for(var i = 0; i < sprites.length; i++) {
			old = sprites[i];
			if(old.id == nid) {
				return {x:old.x, y:old.y, velx:old.velx, vely:old.vely};
			}
		}
	}
}