(function (){
	'use strict';
	//.......................Variables............................//
	
	var pause = false;
	var KEY_ESC = 27,
		KEY_ENTER = 13,
		KEY_LEFT = 37,
		KEY_UP =38,
		KEY_RIGHT = 39,
		KEY_DOWN = 40,
		KEY_W = 87,
		KEY_S = 83,
		KEY_A = 65,
		KEY_D = 68,
		KEY_SPACE = 32,
		mouseX = null,
		mouseY = null,
		defineMouseMove = null;

	var k = false;
	var v = false;
	var level = 1;
	var debug = true;
	var shotcounter = 0;
	var shootspeed = 6;


	var lastUpdate = 0,
		//deltaTime = 0,
		acumDelta = 0,
		fps = 59,
		FPS  = 0,
		fpsFrames = 0,
		fpsAcumDelta = 0,
		fpsDeltaTime = 0,
		fpsLastUpdate = 0;

	var bgTimer = 0,	
	 	speed = 15,
	 	pressing = [],
	 	lastPress = null;
		
	var canvas = null,
		ctx = null;

	var currentBackground;	
	
	var backgroundLvl1 = new Image(); 
		backgroundLvl1.src = 'assets/fondos/space1.png';
		
	var backgroundLvl2 = new Image();
		backgroundLvl2.src = 'assets/fondos/space2.png';

	
	var shots = [],
		shotsSheet = new Image();
		shotsSheet.src = 'assets/laserbeams/gold_laserbeam.png';

	var player = new actor(260,490,85,85,1,20),
		playerSheet = new Image(),
		posShit = 256; 
		playerSheet.src = 'assets/player_ships/ship_spride_md.png';

	var currentEnemyPawn,
		currentEnemyPawnSheet,
		currentBossPawn,
		currentBossPawnSheet,
		boss = false,
		dir = 1;
	
	var enemyPawn1 = [],
		enemyPawn1Sheet = new Image();
		enemyPawn1Sheet.src = 'assets/enemy_ships/sprite_Pawn1_md.png';

	var enemyPawn2 = [],
		enemyPawn2Sheet = new Image();
		enemyPawn2Sheet.src = '';	

	var bossPawn1 = [],	
		bossPawn1Sheet = new Image();
		bossPawn1Sheet.src = 'assets/enemy_ships/bossPawn1.png';

	var direction = "",
    	oldx = 0,
    	fire = false,
    	autoFire = true;

    var score = 0;
    var restartTimer = 200;
    var gameover;
    var wavesCounter = 0;
    var pawnCounter = 0;
    particleSystem.prototype = [];
    var explotion = new particleSystem();
    function random(max){ 
    	return ~~(Math.random()*max);
    }
    
    function particleSystem(){}
	//.............................................................// 
	
	//...................addEvents.................................//
	document.addEventListener('keydown',function(evt){
		lastPress = evt.keycode;
		pressing[evt.keyCode] = true;
		defineMouseMove = false;
	}, false);

	document.addEventListener('keyup',function(evt){
		pressing[evt.keyCode] =  false;	
	},false);

	window.addEventListener('click',function(){
		fire =  true;	
	});

	window.addEventListener('mousemove',function(evt){
		mouseX = evt.pageX - canvas.offsetLeft;
		mouseY = evt.pageY - canvas.offsetTop;
		defineMouseMove = true;
	}, false);

	document.body.style.cursor = 'none';
	
	window.addEventListener('load',init,false);
	//.............................................................//
	
	//.................Medir FPS...................................//
	function medirfps(){
		var fpsNow = Date.now(),
		fpsDeltaTime = (fpsNow - fpsLastUpdate) / 1000;
		if(fpsDeltaTime > 1){
			fpsDeltaTime = 0;
		}
		fpsLastUpdate = fpsNow;

		fpsFrames += 1;
		fpsAcumDelta += fpsDeltaTime;
		if(fpsAcumDelta > 1){
			FPS = fpsFrames;
			fpsFrames = 0;
			fpsAcumDelta -= 1;
		}
		
	}
	function restart(){
			pawnCounter =  0;
			wavesCounter = -500;
			boss = false;
			bossPawn1.splice(0,1);
	}

	function getRandomIntInclusive() {
		var myArray = [0,50,100,150,200,250,300,350,400,500];
		var myRandomElement = myArray.randomElement();
		return myRandomElement;
	}

	function actorExplota(lux,luy){
		for(var pl = 0; pl < 130; pl++){			
			explotion.push(new particle(lux, luy, 1, 0.1 + random(500)/1000, random(200) , random(360),'red'));

			explotion.push(new particle(lux, luy, 1, 0.5 + random(500)/1000, 100 , random(360),'red'));

			explotion.push(new particle(lux, luy, 1, 0.5 + random(500)/1000, 190 , random(360),'red'));
					
			explotion.push(new particle(lux, luy, 1, 0.5 + random(500)/1000, 160 , random(360),'red'));
		} 
	}
	//.............................................................//

	//....................Functions Centrales.......................//
	function init(){
		canvas = document.getElementById('canvas');
		ctx = canvas.getContext('2d');
		canvas.width = 600;
		canvas.height = 620;
		run();
	}

	function run(){
		var now=Date.now(); 
		var deltaTime = (now - lastUpdate)/1000; 
		if(deltaTime>1) deltaTime=0; 
		lastUpdate = now; 
		setTimeout(run,1000/fps);
		medirfps();
		actividad(deltaTime);
		paint(ctx);
	}

	function repaint(){
		requestAnimationFrame(repaint);
		paint(ctx);
	}

	//..............................................................//

	function particle(x, y, radius, life, pSpeed, angle, color){
		this.x = (x == null)?0:x;
		this.y = (y == null)?0:y;
		this.radius = (radius == null)?1:radius;
		this.life = (life == null)?0:life;
		this.pSpeed = (pSpeed == null)?0:pSpeed;
		this.angle = (angle == null)?0:angle;
		this.color = (color == null)?0:color;
	}

	particleSystem.prototype.move = function(deltaTime){
		for (var i =0, l = this.length; i<l; i++){
			this[i].life -= deltaTime;
			if(this[i].life < 0){
				this.splice(i --,1);
				l--;
			}else{
				this[i].x += Math.cos(this[i].angle) * this[i].pSpeed*deltaTime;
				this[i].y += Math.sin(this[i].angle) * this[i].pSpeed*deltaTime;
			}
		}
	}	

	particleSystem.prototype.fill = function(ctx){
		for(var i=0; i<this.length;i++){
			ctx.fillStyle = this[i.color];
			ctx.beginPath();
			ctx.arc(this[i].x, this[i].y,this[i].radius,0,Math.PI*2,true);
			ctx.fill();
		}
	}

	
	function actor (x, y, width, height, type, health){
		this.x = (x == null) ? 0:x;
		this.y = (y == null) ? 0:y;
		this.width = (width == null) ? 0:width;
		this.height = (height == null) ? this.width:height;
		this.type = (type == null) ? 1:type;
		this.health = (health == null) ?1:health;
		this.timer = 0;
	}

	actor.prototype.collision = function(ac){
		if(ac != null){
			/*return(this.x < ac.x + ac.width && 
					this.x + this.width > ac.x && 
					this.y < ac.y + ac.height && 
					this.y + this.height > ac.y);*/

			if(this.x + this.width >= ac.x && this.x < ac.x + ac.width){
				if(this.y + this.height >= ac.y && this.y < ac.y + ac.height){
					return true;
				}
			}
			if(this.x <= ac.x && this.x + this.width >= ac.x + ac.width){
				if(this.y <= ac.y && this.y + this.height >= ac.y + ac.height){
					return true;
				}
			}
			if(ac.x <= this.x && ac.x + ac.width >= this.x + this.width){
				if(ac.y <= this.y && ac.y + ac.height >= this.y + this.height){
					return true;
				}
			}
		}else return false;	
	}

	actor.prototype.sprite = function(ctx,img,ox,oy,ow,oh){
		if(img.width)
			ctx.drawImage(img,ox,oy,ow,oh,this.x,this.y,this.width,this.height);
		else
			ctx.strokeRect(this.x,this.y,this.width,this.height);
	}

	Array.prototype.randomElement = function () {///Funcion para la tomar un valor ramdom dentro de una arreglo
    	return this[Math.floor(Math.random() * this.length)]
	}	
	

///////****************************FUNCION PRINCIPAL DE DIBUJADO****************************/////////////
	function paint(){
		ctx.font = 'italic 12pt Calibri';
	
		//..........dibular Fondo...........// 
		if(currentBackground.width){
			ctx.drawImage(currentBackground,0,bgTimer);
			ctx.drawImage(currentBackground,0,620 + bgTimer);

		}else{
			ctx.fillRect(0,0,canvas.width,canvas.height);
		}
		//..................................//

		///...........boss....................//
		if(boss){
			currentBossPawn[0].sprite(ctx,currentBossPawnSheet,22,0,600,480);
			//ctx.drawImage(img,ox,oy,ow,oh,this.x,this.y,this.width,this.height);	
		}	
				


		for(var i = 0, l = currentEnemyPawn.length; i < l; i++){
			currentEnemyPawn[i].sprite(ctx,currentEnemyPawnSheet,256,0,256,256);
		}

		//..........dibujar player..........//
		
		if(player.health > 0) player.sprite(ctx,playerSheet,posShit,0,256,256);

		

		//.........dibujar player's shots..............//
		
		for(var i = 0, l = shots.length; i < l; i++){
			shots[i].sprite(ctx, shotsSheet, 0, 256, 256, 256);	
		}

		
		//......................debug log................//
		if(debug){
			ctx.font = 'italic 10pt '
			ctx.fillStyle = 'white';
			ctx.fillText('FPS:' + FPS,0,15);
			ctx.fillText('Shots :' +shots.length,0,30);
			ctx.fillText('Enemies :' + currentEnemyPawn.length,0,45);
			//ctx.fillText('Mouse Cordinates :' + mouseX + ';' + mouseY, 0, 60);
			//ctx.fillText('Mouse Controller :'+ defineMouseMove, 0, 75);
		}	
		ctx.fillText('SCORE:' + score,480,15);
		ctx.fillText('ENEMIES:' + pawnCounter,280,15);

		//....................draw FPS..................//
		
		explotion.fill(ctx);

		if(pause){
			ctx.fillStyle = 'white';
			ctx.fillText('Press ESC Key to Resume', (canvas.width/2)-100, canvas.height/2);
		}
		//
	}

	///.....................Funcion donde se realizan los calculos......................//
	function actividad(deltaTime){
		// Pause/Unpause 
		if(pressing[KEY_ESC]){
			if(v == false){
				v = true;
				if(pause == true){
					pause = false;
				}else pause = true;
			}			
		} else v = false;

		
////......................Programacion Referente al player.................................//////////			
		if(level == 1){
			currentBackground = backgroundLvl1;
			currentEnemyPawn = enemyPawn1;
			currentEnemyPawnSheet = enemyPawn1Sheet;
			currentBossPawn = bossPawn1;
			currentBossPawnSheet = bossPawn1Sheet;

		}

		if(level == 2){
			currentBackground = backgroundLvl2;
		}	

			//..............bgTimer..............//
		bgTimer+= 9;
		if(bgTimer > 0) bgTimer -= canvas.height;

		if(!pause){
			//.............mover player..........//
			if(!defineMouseMove){		
				posShit = 256;
				
				if(pressing[KEY_UP] || pressing[KEY_W]){
					player.y -= speed;
				}
				
				if(pressing[KEY_DOWN] || pressing[KEY_S]){
					player.y += speed;
				}
				
				if(pressing[KEY_RIGHT] || pressing[KEY_D]){
					player.x += speed;
					posShit = 512;
				}
				
				if(pressing[KEY_LEFT] || pressing[KEY_A]){
					player.x -= speed;
					posShit = 0;
				}
			}	
			//.............mover al player con el mouse...........REVISAR CON ERRORES.///
			if(defineMouseMove){
				player.y = mouseY;
				player.x = mouseX;
				
				if(mouseX == oldx){
					posShit = 256;
				}
        		if (mouseX < (oldx - 3)) {
            		posShit = 0;
        		
        		} else if (mouseX > (oldx + 3)) {
           	 	
           	 		posShit = 512;
       			}

        		oldx = mouseX;
			}

			//............establecer limites player.........//
			if(player.x < 0){
				player.x = 0;
			}
			if(player.x > canvas.width - player.width){
				player.x = canvas.width - player.width;
			}

			if(player.y < 200){
				player.y = 200;
			}
			if(player.y > canvas.height - player.height){
				player.y = canvas.height -player.height;
			}

			//................Player's Shots.........//
			/*if(pressing [KEY_SPACE] || fire == true){
				if(k == false){
					//Side shots
					
					shots.push(new actor(player.x - 3, player.y + 40, 30, 85, 100, 100));
					shots.push(new actor(player.x + 72, player.y + 40, 30, 85, 100, 100));

					//Center shots
					shots.push(new actor(player.x + 30, player.y, 30, 90, 100, 100));
					shots.push(new actor(player.x + 35, player.y, 30, 90, 100, 100));
					if(autoFire == true){
						setTimeout(60);
					}
					k = true;
					fire = false;						
				}	
			} else k = false;*/

			//................Player's autoShots.........//
			if(pressing [KEY_SPACE] && player.health > 0){
				
					//Side shots
				if(shotcounter == shootspeed){
					shots.push(new actor(player.x - 3, player.y + 40, 30, 85, 100, 100));
					shots.push(new actor(player.x + 72, player.y + 40, 30, 85, 100, 100));

					//Center shots
					shots.push(new actor(player.x + 30, player.y, 30, 90, 100, 100));
					shots.push(new actor(player.x + 35, player.y, 30, 90, 100, 100));
					shotcounter = 0;
				}	
				shotcounter++;	
			}
							
			
			//...........Mover Player's Shots.....//
			for(var i = 0, l = shots.length; i < l; i++){
				shots[i].y -=20;
				if(shots[i].y < 0){
					shots.splice(i--,1); 
					l--;0
				}
			}	
			
			if(player.health < 1 && restartTimer > 0){
				restartTimer--;
				
	
			}else if(restartTimer < 1 && player.health < 1){
				player.health = 20;
				restartTimer = 200;
				
			} 


			//......................................Collision contra el boss..........................................
			if(player.health > 0){
				if(player.collision(currentBossPawn[0])){
					var lux = player.x + 40;
					var luy = player.y + 40;
					player.health = 0;
					actorExplota(lux,luy);
					restart();

				}
			}


			//////////............................player collision vs enemies..............................................///////////////


			if(player.health > 0){
				for(var i = 0, l = currentEnemyPawn.length; i<l; i++){
					if( player.collision(currentEnemyPawn[i])){
						var lux = player.x + 40;
						var luy = player.y + 40;
						player.health = 0;
				
						actorExplota(lux,luy);

						currentEnemyPawn[i].x = 700;

						restart();
					}

				}
				
			
				//..................................shots_vs_Boss........................//	
				for(var i = 0, l = shots.length; i < l; i++ ){
					if(boss){
						if(shots[i].collision(currentBossPawn[0])){
							if(currentBossPawn[0].health < 1 ){
							
								var ux = currentBossPawn[0].x;
								var uy = currentBossPawn[0].y;
								
								for(var p = 0; p < 130; p++){
								
									explotion.push(new particle(ux + 140, uy + 180, 3, 2 + random(500)/1000, 
										random(300) , random(360),'red'));

									explotion.push(new particle(ux + 140, uy + 180, 3, 1.5 + random(500)/1000, 
										260 , random(360),'red'));

								
									explotion.push(new particle(ux + 140, uy + 180, 3, 1.5 + random(500)/1000, 
										190 , random(360),'red'));

									explotion.push(new particle(ux + 140, uy + 180, 3, 1.5 + random(500)/1000, 
										160 , random(360),'red'));
								} 
								currentBossPawn[0].x = 900;
								boss = false;
								currentBossPawn.splice(0,1);
								wavesCounter = -400;
								pawnCounter = 0;

								score+=20000;
								level++;
							}	
							shots[i].x = 900;
							shots.splice(i--,1);
							currentBossPawn[0].health--;
						}
						l--;	
					}		
					//.....................................shots_vs_enemies...................................//
					for(var j = 0, ll = currentEnemyPawn.length; j < ll; j++){
						if(!boss || boss){
							if(shots[i].collision(currentEnemyPawn[j])){
								shots[i].x = 900;
								shots.splice(i--,1);
								currentEnemyPawn[j].health--;
						
								if(currentEnemyPawn[j].health < 1 ){
							
									var ux = currentEnemyPawn[j].x;
									var uy = currentEnemyPawn[j].y;
									for(var p = 0; p < 130; p++){
										//estado++;
										explotion.push(new particle(ux + 20, uy + 10, 3, 1 + random(500)/1000, 
											random(100) , random(360),'red'));

										//explotion.push(new particle(ux + 20, uy + 10, 3, 0.5 + random(500)/1000, 
										//	160 , random(360),'red'));

								
										explotion.push(new particle(ux + 20, uy + 10, 3, 0.5 + random(500)/1000, 
											100 , random(360),'red'));

										//explotion.push(new particle(ux + 20, uy + 10, 3, 0.5 + random(500)/1000, 
											//100 , random(360),'red'));
									} 
									score+=20;
									currentEnemyPawn.x = 700;
									currentEnemyPawn.splice(j--,1);
									ll--;	
						    	}
	
								l--;
							}		
						}				
					}
				}
			}	
			explotion.move(deltaTime);	

			///.........................Programacion referente a los enemigos......................////////////
			
			//console.log(wavesCounter);
			if(wavesCounter == 35 && !boss){
				currentEnemyPawn.push(new actor(getRandomIntInclusive(),10,75,75,0,10));
				wavesCounter = 0;
				pawnCounter++;
				if(pawnCounter > 25){
					boss = true;
					currentBossPawn.push(new actor (160,0,200,190,2,320));

				} 
			} else if(!boss) wavesCounter++;
		
			for(var i = 0, l = currentEnemyPawn.length; i < l; i++){
				currentEnemyPawn[i].y += 3.5;
				if(currentEnemyPawn[i].y > 580 && player.health > 0 && currentEnemyPawn[i].health > 0){  //enemigo paso el borde
					var lux = player.x + 40;
					var luy = player.y + 40;
					player.health = 0;
					currentEnemyPawn[i].health = 0;
					actorExplota(lux,luy);
					restart();
					currentEnemyPawn.splice(i--,1);
					l--;
				}
			}
			if(boss){
				currentBossPawn[0].y += 0.3;
				if(currentBossPawn[0].x == 400) dir = -1;
				if(currentBossPawn[0].x == 2) dir = 1;
				currentBossPawn[0].x += dir;
				if(currentBossPawn[0].y > 580 && player.health > 0 && currentBossPawn[0].health > 0){
					var lux = player.x + 40;
					var luy = player.y + 40;
					player.health = 0;
					actorExplota(lux,luy);
					restart();
					
				}
			}
		}




	}//fin function actividad

})();