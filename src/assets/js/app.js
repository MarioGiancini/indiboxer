// Set up global vars
var ctx = $('canvas')[0].getContext('2d'),
    colWidth = 101,
    rowHeight = 80,
    offsetY = 25,
    hit = false,
    goalReached = false,
    boxesLost = [],
    startTime = new Date(),
    heartX,
    heartY,
    points = 0,
    gameHours = 0,
    gameMinutes = 0,
    gameSeconds = 0,
    gameOver = false;


var EnemyLane = function() {
  // Set up arry for enemies in that lane
  this.enemies = [];
}

var GoalLane = function() {
  this.goals = [];
}

var StartLane = function() {
  this.starts = [];
}

var boardLanes = [new GoalLane, new EnemyLane(), new EnemyLane(), new EnemyLane(), new StartLane(), new StartLane()];
var enemyQueueLanes = [new EnemyLane(), new EnemyLane(), new EnemyLane()];

// Enemies our player must avoid
var Enemy = function(speed, sprite) {

    // image url
    this.sprite = sprite;

    // Integer for how fast the enemy travels, max speed 3
    this.speed = speed;

    // Start the enemy randomly off the board a ways
    this.x = -getRandomInt(1, 8);

    // Select a random row between the second and forth
    this.y = getRandomInt(1, 4);

    // Marker to track lane position
    this.prevX = null;

    // set when the enemy is visable
    this.visable = false;

    // set when the enemy runs over an item
    this.hitBox = false;

    this.laneOrder = 0;

    // Setup position in enemyQueueLanes
    enemyQueueLanes[this.y - 1].enemies.splice(-this.x , 0, -this.x);

    console.log('Enemy Lane ' + this.y + ' length: ' + enemyQueueLanes[this.y - 1].enemies.length);
    // Update test viever
    $('#enemy_lane_' + this.y).text(enemyQueueLanes[this.y - 1].enemies.length);
};

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // Move the enemy across the row
    this.x = this.x + dt * this.speed;

    // If the enemy x is greater than zero it's visable
    if(this.x > 0 && this.visable === false) {
      this.visable = true;
      // remove from enemyQueueLanes
      enemyQueueLanes[this.y - 1].enemies.splice(Math.floor(this.x), 1);
      // add to boardLanes
      boardLanes[this.y].enemies.splice(this.x, 0, this.x);

      // Update test viever
      $('#enemy_lane_' + this.y).text(enemyQueueLanes[this.y - 1].enemies.length);
      console.log('Enemy Y: ', this.y);
    } else if(this.x >= 5 && this.visable === true) {
      // If the enemy x is greater than 5 is not visable on the board
      // Redraw enemy off canvas and set visable to false
      this.visable = false;
      this.y = getRandomInt(1, 4);
      // Get a new x value to start off board that isn't already taken in that lane.
      this.x = -getRandomIntExcludeMultiple(1, 5, enemyQueueLanes[this.y - 1].enemies);
      this.prevX =  this.x;
      this.speed = getRandomInt(1, 4);
      this.hitBox = false;
      // remove from boardLanes and put back into enemyQueueLanes
      boardLanes[this.y].enemies.splice(this.laneOrder, 1);
      enemyQueueLanes[this.y - 1].enemies.splice(-this.x , 0, -this.x);
      console.log('Enemy Lane ' + this.y + ' length: ' + enemyQueueLanes[this.y - 1].enemies.length);
      $('#enemy_lane_' + this.y).text(enemyQueueLanes[this.y - 1].enemies.length);
    } else {
      // Have enemies stop right behind an enemy if they are going faster than
      // the one ahead of them.
      var enemyX = this.x;
      var enemyY = this.y;
      var enemySpeed = this.speed;
      var newSpeed = 0;

      // Update enemy's position in the enemyQueueLane
      if( !this.visable && Math.floor(enemyX) > this.prevX) {
        console.log('original enemyX: ' + enemyX);
        enemyX = Math.floor(enemyX) < 0 ? -Math.floor(enemyX) : Math.floor(enemyX);
        console.log('prevX: ' + this.prevX, 'enemyX: ' + enemyX);
        enemyQueueLanes[this.y - 1].enemies.splice(this.prevX, 1); // remove previous lane postion
        enemyQueueLanes[this.y - 1].enemies.splice(Math.round(enemyX), 0, Math.round(enemyX)); // new position
        this.prevX = enemyX; // set new prevX to track position
      }
      // Loop through all enemies in a lane. If they're speed is greater than one infront of them
      // match their speeds once they are 1 space away.
      allEnemies.forEach(function(enemy) {
        if(enemy.y === enemyY) {
          if(enemyX <= (enemy.x + 1) && enemy.speed < enemySpeed) {
            newSpeed = enemy.speed;
            // console.log('Enemy at Y: ' + enemyY + ', X: ' + enemyX + ' changed speed.');
          }
        }
      });

      if(newSpeed > 0) {
        this.speed = newSpeed;
      }
    }

  // If an enemy hits the player, set them back and reduce lives
  if(player.intersects(this)){
    hit = true;
  }

  // If an enemy hits a box, increment how many times it was hit
  if(this.y === box.y && this.hitBox === false) {
    if( this.x > (box.x - .5) && this.x < (box.x + .5) ) {
      this.hitBox = true;
      box.ranOver += 1;
      console.log('Box ran over!');
    }
  }
};

// Draws an enemy on the screen
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x * colWidth, this.y * rowHeight - offsetY);
};

var Item = function(image, type) {
  this.sprite = image;
  this.type = type;
  this.collected = false;
  // If the item is an indiebox, start it in the canvas lanes.
  // If it's heart, start it off canvas.
  if(type === 'indiebox') {
    this.x = getRandomInt(0, 5);
    this.y = getRandomInt(1, 4);
  } else {
    this.x = 100;
    this.y = 100;
  }

  this.h = 117; // height of item
  this.w = 101; // width of item
  this.ranOver = 0; // if the item gets hit by an enemy
}

// Draws an Item on the screen
Item.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x * colWidth, this.y * rowHeight - offsetY);
}

// Update the item's postion based on player's movements
Item.prototype.update = function() {
  var prevX = this.x;
  var prevY = this.y;

  // If the player is hit while indiebox item is collected
  // set the item back on a random location.
  if(hit && this.collected && this.type === 'indiebox') {
    this.collected = false;
    this.x = getRandomInt(0, 5);
    this.y = getRandomInt(1, 4);
  }

  if(player.collects(this)) {
    this.collected = true;
  }

  if(this.collected) {

    switch(this.type) {
      case 'indiebox':
        // Box collected, so follow the players movements
        this.x = player.x;
        this.y = player.y;
        // If the item gets to the goal it's delivered so reset it.
        if(player.reachesGoal(this)) {
          player.deliveries.push({
            'time' : Date.now(),
            'x' : this.x,
            'y' : this.y
          });
          switch (this.ranOver) {
            case 0:
              points += 100;
              break;
            case 1:
              points += 50;
              break;
            case 2:
              points += 25;
              break;
            default:
              break;
          }
          document.getElementById("points").innerHTML = points;
          document.getElementById("boxes_saved").innerHTML = player.deliveries.length;
          this.collected = false;
          goalReached = true;
          this.ranOver = 0;
          this.x = getRandomInt(0, 5);
          this.y = getRandomInt(1, 4);

          // Move the obsticle to a new location
          allRocks.forEach(function(rock) {
            rock.x = getRandomInt(0, 5);
          });

        }
        break;
      case 'heart':
        // Gain a life and remove heart from canvas
        this.collected = false;
        player.lives += 1;
        points += 50;
        document.getElementById("lives").innerHTML = player.lives;
        this.x = 100;
        this.y = 100;
        break;
      default:
        break;
    }
  }

  if(this.type === 'indiebox') {
    switch(this.ranOver) {
      case 1:
        // first hit
        this.sprite = 'assets/img/gem-green.png';
        break;
      case 2:
        // second hit
        this.sprite = 'assets/img/gem-orange.png';
        break;
      case 3:
        // Third hit, destroy it and log it.
        boxesLost.push({
          'time' : Date.now(),
          'x' : this.x,
          'y' : this.y
        });
        points -= 50;
        document.getElementById("points").innerHTML = points;
        document.getElementById("boxes_lost").innerHTML = boxesLost.length;
        this.sprite = 'assets/img/gem-blue.png';
        this.x = getRandomInt(0, 5);
        this.y = getRandomInt(1, 4);
        this.ranOver = 0;
        this.render();
        allEnemies.forEach(function(enemy) {
          enemy.hitBox = false;
        });
        break;
      default:
        this.sprite = 'assets/img/gem-blue.png';
    }
  }

  if(this.type === 'heart' && gameSeconds % 30 === 0) {
    this.x = heartX;
    this.y = heartY;
  }
  if(this.type === 'heart' && gameSeconds % 9 === 0) {
    this.x = 100;
    this.y = 100;
    heartX= getRandomInt(0, 5);
    heartY = getRandomIntExclude(1, 5, 4);
  }
}

var Goal = function(image) {
  this.sprite = image;
  this.x = getRandomInt(0, 5);
  this.y = 0; // always the top lane
}

Goal.prototype.update = function() {
  if(goalReached) {
    console.log('Box Delivered!');
    goalReached = false;
    this.x = getRandomInt(0, 5);
  }
}

Goal.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x * colWidth, this.y * rowHeight - offsetY);
}

// Create player class
var Player = function(image) {
  // Setup url for player sprit
  this.sprite = image;
  this.x = 2;
  this.y = 5;
  this.moveX = 2; // the next X movement
  this.moveY = 5; // the next Y movement
  this.moveDirection = ''; // the movement direction from user input
  this.h = 117; // height of player
  this.w = 101; // width of player
  this.moveSpeed = 5; // edit this to make character move faster, max speed is 10.
  this.moving = false;
  this.movements = [];
  this.deliveries = [];
  this.lives = 3;
  this.level = 1;
}

Player.prototype.update = function(dt) {
  // Check difference of move destination and ensure direction max before changing
  // board coordinates to avoid gitter in movement.
  if(this.moving && !hit) {
    // Moving left
    if(this.x > this.moveX && this.moveDirection === 'left') {
      var newX = this.x - (dt * this.moveSpeed);
      this.x = newX < this.moveX ? this.moveX : newX;
    // Moving right
    } else if(this.x < this.moveX && this.moveDirection === 'right') {
      var newX = this.x + (dt * this.moveSpeed);
      this.x = newX > this.moveX ? this.moveX : newX;
    // Moving up
    } else if(this.y > this.moveY && this.moveDirection === 'up') {
      var newY = this.y - (dt * this.moveSpeed);
      this.y = newY < this.moveY ? this.moveY : newY;
    // Moving down
    } else if(this.y < this.moveY && this.moveDirection === 'down') {
      var newY = this.y + (dt * this.moveSpeed);
      this.y = newY > this.moveY ? this.moveY : newY;
    // Not moving
    } else {
      this.moving = false;
      // Insure integer values
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      console.log('Player X: ', this.x, 'Player Y: ', this.y, 'Direction: ', this.moveDirection);
    }

  }
  if(hit){
    // Reduce a life if player has any left or gameover
    if(this.lives > 1) {
      this.lives -= 1;
      this.x = getRandomInt(1, 4);
      this.y = 5;
      this.moveX = this.x;
      this.moveY = this.y;
      hit = false;
      document.getElementById("lives").innerHTML = player.lives;
    } else {
      hit = false;
      this.x = 2;
      this.y = 5;
      this.moveX = this.x;
      this.moveY = this.y;
      console.log('GAME OVER');
      this.lives = 3;
      document.getElementById("lives").innerHTML = player.lives;
      gameOver = true;
      // do a reset here.
      box.ranOver = 0;
      box.x = getRandomInt(0, 5);
      box.y = getRandomInt(1, 4);
    }
  }
  this.checkLevel();
}

Player.prototype.checkLevel = function() {

  if (points < 1000) {
    this.level = 1;
  } else if (points < 2000) {
    this.level = 2;
    this.moveSpeed = 6;
  } else if (points < 3000) {
    this.level = 3;
    this.moveSpeed = 7;
  } else if (points < 4000) {
    this.level = 4;
    this.moveSpeed = 8;
  } else if (points < 5000) {
    this.level = 5;
    this.moveSpeed = 9;
  } else if (points < 6000) {
    this.level = 6;
    this.moveSpeed = 10;
  } else if (points < 7000) {
    this.level = 7;
    this.moveSpeed = 11;
  } else if (points < 8000) {
    this.level = 8;
    this.moveSpeed = 12;
  } else if (points < 9000) {
    this.level = 9;
    this.moveSpeed = 13;
  } else if (points < 10000) {
    this.level = 10;
    this.moveSpeed = 14;
  }

  document.getElementById("level").innerHTML = this.level;
}

// Draw the player on the canvas
Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x * colWidth, this.y * rowHeight - offsetY);
}

// Checks to see an enemy intersect with the player
Player.prototype.intersects = function(enemy) {
    var intersects = false;
    if(enemy.y === this.y ){
      if( enemy.x > (this.x - .5) && enemy.x < (this.x + .5) ) {
        intersects = true;
        console.log('HIT! Enemy X: ' + enemy.x);
      }
    }
    return intersects;
}

// Check to see if the player intersects with an item
Player.prototype.collects = function(item) {
  if(item.x === this.x && item.y === this.y){
    return true;
  } else {
    return false;
  }
}

// Check if the player delivers a box
Player.prototype.reachesGoal = function(item) {
  if(item.x === goal.x && item.y === goal.y) {
    return true;
  } else {
    return false;
  }
}

// Handle keyboard input for player actions
Player.prototype.handleInput = function(keyCode) {
  var thisX = this.x;
  var thisY = this.y;
  var obstructed = false;
  switch (keyCode) {
    case 'left':
      // Check rocks to see if they obstruct player movement
      allRocks.forEach(function(rock) {
        if( rock.y === thisY ) {
          if( rock.x === (thisX - 1) ){
            obstructed = true;
          }
        }
      });
      if(!obstructed && this.x > 0 && !this.moving) {
        this.moveDirection = 'left';
        this.moving = true;
        this.moveX -= 1;
        // If player moved log it
        this.movements.push({
          'keyCode': keyCode,
          'time' : Date.now(),
          'x' : this.moveX,
          'y' : this.y
        });
      }
      break;
    case 'up':
      allRocks.forEach(function(rock) {
        if( rock.x === thisX ) {
          if( rock.y === (thisY - 1) ){
            obstructed = true;
          }
        }
      });
      if(!obstructed && this.y > 0 && !this.moving) {
        this.moveDirection = 'up';
        this.moving = true;
        this.moveY -= 1;
        this.movements.push({
          'keyCode': keyCode,
          'time' : Date.now(),
          'x' : this.x,
          'y' : this.y
        });
      }
      break;
    case 'right':
      allRocks.forEach(function(rock) {
        if( rock.y === thisY ) {
          if( rock.x === (thisX + 1) ){
            obstructed = true;
          }
        }
      });
      if(!obstructed && this.x < 4 && !this.moving) {
        this.moveDirection = 'right';
        this.moving = true;
        this.moveX += 1;
        this.movements.push({
          'keyCode': keyCode,
          'time' : Date.now(),
          'x' : this.moveX,
          'y' : this.y
        });
      }
      break;
    case 'down':
      allRocks.forEach(function(rock) {
        if( rock.x === thisX ) {
          if( rock.y === (thisY + 1) ){
            obstructed = true;
          }
        }
      });
      if(!obstructed && this.y < 5 && !this.moving) {
        this.moveDirection = 'down';
        this.moving = true;
        this.moveY += 1;
        this.movements.push({
          'keyCode': keyCode,
          'time' : Date.now(),
          'x' : this.x,
          'y' : this.y
        });
      }
      break;
  }
}

// Rock object that can't be moved on by player
var Rock = function(image) {
  this.sprite = image;
  this.x = getRandomInt(0, 5);
  this.y = 4;
}

Rock.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x * colWidth, this.y * rowHeight - offsetY);
}

// Instantiate game objects
var allEnemies = [ new Enemy(1, 'assets/img/enemy-bug.png'),
                new Enemy(2, 'assets/img/enemy-bug.png'),
                new Enemy(2, 'assets/img/enemy-bug.png'),
                new Enemy(4, 'assets/img/enemy-bug.png'),
                new Enemy(4, 'assets/img/enemy-bug.png')],
    allRocks = [new Rock('assets/img/rock.png')],
    player = new Player('assets/img/char-boy.png'),
    box = new Item('assets/img/gem-blue.png', 'indiebox'),
    goal = new Goal('assets/img/star.png'),
    heart = new Item('assets/img/heart.png', 'heart');


// Listen for key presses and sends the keys to Player.handleInput()
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});
