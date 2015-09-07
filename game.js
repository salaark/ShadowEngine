$(document).ready(function(){
	//get mask attributes and initialize ShadowMask
	var canvas = $("#mask")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#mask").width();
	var h = $("#mask").height();
	var sm = new ShadowMask(w, h, ctx, 0.9);
	
	var pos = {x:200, y:150};
	var start = {x:0, y:0};
	var count = 9;
	var down = false;

	//get main attributes
	var canvas2 = $("#main")[0];
	var ctx2 = canvas2.getContext("2d");
	var w2 = $("#main").width();
	var h2 = $("#main").height();
	var ss = new ShadowSprites(w2, h2, ctx2, "white");

	//outside edge
	sm.updateObstacle(0, 0, 0, w, 0);
	sm.updateObstacle(1, 0, 0, 0, h);
	sm.updateObstacle(2, 0, h, w, 0);
	sm.updateObstacle(3, w, 0, 0, h);

	//triangle
	sm.updateObstacle(4, 150, 50, 100, 100);
	sm.updateObstacle(5, 250, 150, -100, 0);
	sm.updateObstacle(6, 150, 150, 0, -100);

	//declare sprites
	ss.updateSprite(0, 0, 0, 5, 5);
	ss.addFrame(0, document.getElementById("sprite"));

	loopy = setInterval(mover, 40);

	//update the lights/sprites every 40ms
	function mover() {
		sm.updateLight(0, pos.x, pos.y, .4);
		sm.updateLight(1, pos.x-10, pos.y, .4);
		sm.updateLight(2, pos.x+10, pos.y, .4);
		sm.updateLight(3, pos.x, pos.y-10, .4);
		sm.updateLight(4, pos.x, pos.y+10, .4);
		sm.updateLight(5, pos.x+7.1, pos.y+7.1, .4);
		sm.updateLight(6, pos.x+7.1, pos.y-7.1, .4);
		sm.updateLight(7, pos.x-7.1, pos.y+7.1, .4);
		sm.updateLight(8, pos.x-7.1, pos.y-7.1, .4);

		var sprite = ss.getSprite(0);
		if(sprite.x > w-150) {
			ss.updateSprite(0, sprite.x, sprite.y, -Math.abs(sprite.velx), sprite.vely);
		} else if(sprite.y > h-165) {
			ss.updateSprite(0, sprite.x, sprite.y, sprite.velx, -Math.abs(sprite.vely));
		} else if(sprite.x < 0) {
			ss.updateSprite(0, sprite.x, sprite.y, Math.abs(sprite.velx), sprite.vely);
		} else if(sprite.y < 0) {
			ss.updateSprite(0, sprite.x, sprite.y, sprite.velx, Math.abs(sprite.vely));
		}
	}

	//update light coordinates based on mouse location
	$(document).mousemove(function(event) {
		var poffset = {left:232, top:15};
        pos.x = event.pageX - poffset.left;
        pos.y = event.pageY - poffset.top;
        if(down) sm.updateObstacle(count, start.x, start.y, pos.x-start.x, pos.y-start.y);
    });

    $(document).on('mousedown', function(event) {
		start.x = pos.x;
       	start.y = pos.y;
       	down = true;
    });

    $(document).on('mouseup', function(event) {
		sm.updateObstacle(count, start.x, start.y, pos.x-start.x, pos.y-start.y);
		count++;
		down = false;
	});
});