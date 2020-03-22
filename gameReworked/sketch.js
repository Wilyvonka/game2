/*
TO DO:
gravity - done?
remove friction? if, then balance with relativity
spawn things further away
import quadtree if necessary
soundeffects
give asteroids gravity and ability to merge?
let user pick window size based on specs
different map-color for newly spawned objects
teleport home button?
make game more intensive as it progresses
balance power of shots. Effect correlated to size of target?
*/


const gravity = 100
let ship;
let dots = [];
let shots = [];
let asteroids = [];
let planet;
let highscore = 0;
let egg = {
	x: 545,
	y: 300,
	r: 10
}

let fireworks = [];
let d = 0
let target;
let c = 30


p5.disableFriendlyErrors = true;

function setup() {
	rectMode(CORNERS);
	//fullscreen(true)
	//let canvas = createCanvas(windowWidth, windowHeight);
	let canvas = createCanvas(1200, 675)
	//let canvas = createCanvas(1000, 560)
	let x = (windowWidth - width) / 2;
	let y = (windowHeight - height) / 2;
	canvas.position(x, y)
	ship = new Ship();
	planet = new Planet()
	strokeWeight(10);
	stroke(0, 255, 0);
}

function draw() {
	if (highscore >= year()) {
		gameCompleted();

	} else {
		background(51);
		if (frameCount % 20 == 0) {
			highscore++;
		}
		push()
		translate(0, 0)
		textSize(16);
		fill(0, 100, 255)
		noStroke()
		text(highscore, width - 50, 50)
		planet.hpBar();
		pop()
		push()
		translate(width / 2 - ship.pos.x, height / 2 - ship.pos.y)
		planet.render()

		for (let i = 0; i < dots.length; i++) {
			dots[i].render()
		}
		for (let i = 0; i < shots.length; i++) {
			if (shots[i].strength <= 0) {
				shots.splice(i, 1);
				i--
			} else {
				shots[i].update()
				shots[i].render()
			}
		}

		for (let i = 0; i < asteroids.length; i++) {
			if (asteroids[i].dist.mag() >= 10000) {
				asteroids.splice(i, 1);
				i--
			} else if (asteroids[i].collided(planet)) {
				if (asteroids[i].asteroid) {
					planet.hp--;
					if (planet.hp <= 0) {
						planet.hpBar();
						textSize(65);
						fill(255, 50, 0)
						push()
						translate(0, 0)
						textAlign(CENTER, CENTER)
						strokeWeight(5)
						console.log("game over")
						text('Game Over', width / 2, height / 2)
						pop()
						noLoop()
					}
				} else if (planet.hp < 15) {
					planet.hp++;
				}
				asteroids.splice(i, 1)
				i--
			} else {

				asteroids[i].render();
				asteroids[i].update();

				for (let j = 0; j < shots.length; j++) {
					if (asteroids[i].collided(shots[j]) && asteroids[i].cooldown <= 0) {
						let effect = shots[j].vel.copy();
						effect.mult(shots[j].strength)
						effect.mult(0.0008)
						if (shots[j].attractor) {
							effect.mult(-1)
						}
						asteroids[i].vel.add(effect)
						asteroids[i].cooldown = 15;
					}
				}
			}
		}
		pop()
		ship.update();
		ship.render();

		if (random() < 0.001) {
			createNewAsteroid(true, random(25, 75));
		}
		if (random() < 0.0005) {
			createNewAsteroid(false, 25);
		}
	}
}

function keyReleased() {
	if (keyCode == RIGHT_ARROW || keyCode == LEFT_ARROW || keyCode == 65 || keyCode == 68) {
		ship.rotates = 0;
	}
	if (keyCode == UP_ARROW || keyCode == 87) {
		ship.boosting = false;
	}

}

function keyPressed() {
	if (keyCode == RIGHT_ARROW || keyCode == 68) {
		ship.setRotation(0.1);
	} else if (keyCode == LEFT_ARROW || keyCode == 65) {
		ship.setRotation(-0.1);
	} else if (keyCode == UP_ARROW || keyCode == 87) {
		ship.boosting = true;
	} else if (keyCode == 32) {
		shots.push(new Shot(ship.pos, ship.rotation, false));
		//effects[0].play();
	} else if (keyCode == 90 || keyCode == 77) {
		shots.push(new Shot(ship.pos, ship.rotation, true));
		//  effects[1].play();
	} else if (keyCode == 84) {
		ship.pos.x = width / 2
		ship.pos.y = height / 2
		ship.vel.mult(0)
	}

}
/*	if (keyCode == 84) {
		var fs = fullscreen();
		fullscreen(!fs);
	}
}


function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}*/


function gameCompleted() {
	translate(0, 0)
	//planet.pos.y = 2 * height / 3;
	if (frameCount % 130 === 0) {
		//	background(51);
	} else {
		background(51, 230);
	}
	planet.render()
	if (random(0, 1) < 0.025) {
		fireworks.push(new Firework());
	}

	for (let i = fireworks.length - 1; i >= 0; i--) {
		fireworks[i].update();
		fireworks[i].show();
		if (fireworks[i].done()) {
			fireworks.splice(i, 1);
		}

	}
	textAlign(CENTER);
	textSize(120);
	fill(255, 0, 0);
	text("Well Done!", width / 2, height / 3);

	//ellipse(egg.x, egg.y, egg.r)
	d = dist(mouseX, mouseY, egg.x, egg.y)

	//var buttonX = 100 * w;
	//var buttonY = 50 * h;
	//button.position(width / 2 - buttonX / 2, height / 2 + height / 7.5 - buttonY / 2);
	//button.size(buttonX, buttonY);
	//button.style("font-size", "20pt");
}


function mousePressed() {
	if (d < egg.r) {
		for (var i = 0; i < 5; i++) {
			fireworks.push(new Firework());
		}
	}
}



function Particle(x, y, firework, angle) {
	this.pos = createVector(x, y);
	this.firework = firework;
	this.lifespan = 255;
	this.angle = angle;
	if (this.firework) {
		this.vel = createVector(0, random(-12, -10));
		this.vel.rotate(this.angle);
		this.gravity = createVector(0, 0.1);
		this.gravity.rotate(this.angle);
	} else {
		this.vel = p5.Vector.random2D();
		this.vel.mult(random(2, 6));

	}
	this.acc = createVector(0, 0);

	this.applyForce = function (force) {
		this.acc.add(force);
	}

	this.update = function () {
		if (!this.firework) {
			this.vel.mult(0.94);
			this.lifespan -= 3.5;
		}
		this.vel.add(this.acc);
		this.pos.add(this.vel);
		this.acc.mult(0);
	}
	this.done = function () {
		if (this.lifespan <= 0)
			return true;
	}


	this.show = function () {
		if (!this.firework) {
			stroke(random(255), random(255), random(255), this.lifespan);
			strokeWeight(4);
		} else {
			push();
			stroke(255, 0, 0);
			strokeWeight(5);
		}
		point(this.pos.x, this.pos.y);
		pop();
	}
}

function Firework() {
	this.firework = new Particle(planet.pos.x, planet.pos.y, true, random(-PI / 3, PI / 3));
	this.exploded = false;
	this.particles = [];

	this.done = function () {
		if (this.exploded && this.particles.length === 0) {
			return true;
		} else {
			return false;
		}
	}




	this.update = function () {
		if (!this.exploded) {
			this.firework.applyForce(this.firework.gravity);
			this.firework.update();
			if (this.firework.vel.y >= 0) {
				this.exploded = true
				this.explode();
				//effects[4].play();

			}
		}

		for (var i = this.particles.length - 1; i >= 0; i--) {
			this.particles[i].applyForce(this.firework.gravity);
			this.particles[i].update();
			if (this.particles[i].done()) {
				this.particles.splice(i, 1);
			}
		}
	}
	this.explode = function () {
		for (var i = 0; i < 150; i++) {
			var p = new Particle(this.firework.pos.x, this.firework.pos.y, false);
			this.particles.push(p);
		}
	}


	this.show = function () {
		if (!this.exploded) {
			this.firework.show();
		}

		for (var i = 0; i < this.particles.length; i++) {
			this.particles[i].show();
		}
	}
}


class Dot {
	constructor(x, y) {
		this.x = x
		this.y = y

	}
	render() {
		point(this.x, this.y);
	}
}
class Ship {
	constructor() {
		this.pos = createVector(width / 2, height / 2);
		this.vel = createVector(0, 0);
		this.rotation = 0;
		this.posoffset = createVector(0, 0);
		this.rotates = 0;
		this.arrow = createVector(0, 0);

	}
	render() {
		let r = 15;
		push()
		noStroke();
		translate(width / 2 + this.posoffset.x, height / 2 + this.posoffset.y);
		rotate(this.rotation + PI / 2);
		let x1 = -r;
		let y1 = r;
		let x2 = r;
		let y2 = r;
		let x3 = 0;
		let y3 = -r;
		triangle(x1, y1, x2, y2, x3, y3 - 5);

		pop()
		push()
		this.arrow.set(planet.pos.x - ship.pos.x, planet.pos.y - ship.pos.y)
		this.arrow.normalize();
		this.arrow.mult(100);
		stroke(255, 0, 0, 100);
		strokeWeight(4);
		line(width / 2 + this.posoffset.x, height / 2 + this.posoffset.y, width / 2 + this.arrow.x, height / 2 + this.arrow.y);
		pop()
	}

	update() {
		this.rotation += this.rotates;
		if (this.boosting) {
			this.boost();
		}
		this.pos.add(this.vel);
		this.posoffset = this.vel.copy();
		this.posoffset.mult(5);
		//this.vel.mult(0.98);
	}


	setRotation(a) {
		ship.rotates = a;
	}


	boost() {

		let force = p5.Vector.fromAngle(this.rotation);
		force.mult(0.38);
		//force.mult(sin(ship.vel.angleBetween(force)) * (Math.sqrt(1 - ship.vel.mag() / c)));
		push()
		angleMode(RADIANS)
		if (1 - ship.vel.mag() / c * cos(ship.vel.angleBetween(force) % (PI / 2)) > 0) {
			force.mult(Math.sqrt(1 - ship.vel.mag() / c * cos(ship.vel.angleBetween(force) % (PI / 2))))
		} else if (ship.vel.mag() > 0) {
			force.mult(0)
		}
		this.vel.add(force);
		pop()
	}

}


class Shot {
	constructor(spos, dir, attractOrRepulse) {
		this.pos = spos.copy();
		this.r = 8
		this.pos.add(ship.posoffset)
		this.vel = p5.Vector.fromAngle(dir);
		this.vel.mult(20);
		this.attractor = attractOrRepulse;
		this.strength = 255;
	}
	update() {
		this.pos.add(this.vel)
		this.strength--
	}

	render() {
		push();
		if (this.attractor) {
			stroke(0, 0, 255, this.strength)
		} else {
			stroke(255, 0, 0, this.strength)
		}
		strokeWeight(this.r);
		point(this.pos.x, this.pos.y);
		pop();
	}
}

createNewAsteroid = function (asteroidOrSupply, r_, x_, y_) {
	let radius = r_ || random(25, 50)
	let angle = random(2 * PI)
	let r = random(800, 2000)
	let x = x_ || cos(angle) * r
	let y = y_ || sin(angle) * r
	x += width / 2;
	y += height / 2;
	asteroids.push(new Asteroid(asteroidOrSupply, x, y, radius))
}

class Asteroid {
	constructor(asteroidOrSupply, x, y, r_) {
		this.gforce;
		this.mapPos = createVector()
		this.r = r_
		this.cooldown = 0;
		this.pos = createVector(x, y);
		this.vel = createVector()
		this.vel = createVector(planet.pos.x - x, planet.pos.y - y);
		this.vel.normalize();
		this.vel.mult(random(2));
		this.vel.rotate(random(-8, 8));
		this.asteroid = asteroidOrSupply;
		this.acc = createVector(0, 0);
		this.dist = createVector(0, 0)
		this.offset = [];
		this.numOfVertex = random(5, 10);
		for (let i = 0; i < this.numOfVertex; i++) {
			this.offset[i] = random(-15, 15)
		}
	}


	render() {
		if (!this.asteroid) {
			push()
			fill(255, 150, 0)
			noStroke();
			ellipse(this.pos.x, this.pos.y, this.r * 2);
			pop()
			push()
			translate(ship.pos.x, ship.pos.y)
			fill(0, 255, 0, 100)
			noStroke()
			this.mapPos.set(map(this.dist.x, -5000, 5000, -250, 250), map(this.dist.y, -5000, 5000, -250, 250))
			ellipse(this.mapPos.x, this.mapPos.y, 10)
			pop()
		} else {
			push()
			fill(255)
			translate(this.pos.x, this.pos.y);
			noStroke();
			fill(200);
			beginShape();
			for (let i = 0; i < this.numOfVertex; i++) {
				let angle = map(i, 0, this.numOfVertex, 0, 2 * PI);
				let r = this.r + this.offset[i];
				let x = cos(angle) * r
				let y = sin(angle) * r
				vertex(x, y);
			}
			endShape(CLOSE);
			pop()
			push()
			noStroke()
			fill(255, 0, 100, 100)
			translate(ship.pos.x, ship.pos.y)
			this.mapPos.set(map(this.dist.x, -5000, 5000, -500, 500), map(this.dist.y, -5000, 5000, -500, 500))
			ellipse(this.mapPos.x, this.mapPos.y, 10)
			pop()
		}
	}
	update() {
		this.dist.set(this.pos.x - planet.pos.x, this.pos.y - planet.pos.y)
		push()
		translate(0, 0)
		angleMode(RADIANS)
		this.gforce = -gravity / pow((this.dist.mag()), 2)
		this.acc.set(this.gforce * cos(this.dist.heading()), this.gforce * sin(this.dist.heading()))
		if (this.acc.mag() < 0.005) {
			this.acc.setMag(0.005)
		}
		if (this.acc.mag() > 1) {
			this.acc.setMag(1)
		}
		this.vel.add(this.acc)
		this.pos.add(this.vel);
		this.acc.mult(0);
		pop()
		if (this.cooldown > 0) {
			this.cooldown--;
		}

	}

	collided(other_) {
		let other = other_
		let d = this.pos.dist(other.pos)
		if (d <= other.r + this.r) {
			return true
		}
	}
}



class Planet {
	constructor() {
		this.r = 200
		this.pos = createVector(width / 2, height + this.r / 3)
		this.hp = 8;
	}
	render() {
		push();
		strokeWeight(12)
		stroke(0, 0, 200)
		fill(0, 200, 0)
		ellipse(this.pos.x, this.pos.y, this.r * 2)
		pop();
		push()
		fill(0, 0, 255)
		noStroke()
		if (highscore < year()) {
			ellipse(ship.pos.x, ship.pos.y, 15)
		}
		pop()
	}
	hpBar() {
		push()
		//lower left corner
		let rectX = width - 50;
		let rectY = height - 100;
		let rectWidth = 20;
		let rectHeight = map(planet.hp, 0, 15, 0, 100);
		noFill()
		stroke(255, 0, 0, 100)
		strokeWeight(3)
		rect(rectX - 2, rectY, rectX + rectWidth + 1, rectY - 100)
		fill(255, 0, 0);
		noStroke()
		rect(rectX, rectY, rectX + rectWidth, rectY - rectHeight)
		pop()
	}
}
