/* Resources.js
 * This is simply an image loading utility. It eases the process of loading
 * image files so that they can be used within your game. It also includes
 * a simple "caching" layer so it will reuse cached images if you attempt
 * to load the same image multiple times.
 */
(function() {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

    /* This is the publicly accessible image loading function. It accepts
     * an array of strings pointing to image files or a string for a single
     * image. It will then call our private image loading function accordingly.
     */
    function load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            /* If the developer passed in an array of images
             * loop through each value and call our image
             * loader on that image file
             */
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        } else {
            /* The developer did not pass an array to this function,
             * assume the value is a string and call our image loader
             * directly.
             */
            _load(urlOrArr);
        }
    }

    /* This is our private image loader function, it is
     * called by the public image loader function.
     */
    function _load(url) {
        if(resourceCache[url]) {
            /* If this URL has been previously loaded it will exist within
             * our resourceCache array. Just return that image rather
             * re-loading the image.
             */
            return resourceCache[url];
        } else {
            /* This URL has not been previously loaded and is not present
             * within our cache; we'll need to load this image.
             */
            var img = new Image();
            img.onload = function() {
                /* Once our image has properly loaded, add it to our cache
                 * so that we can simply return this image if the developer
                 * attempts to load this file in the future.
                 */
                resourceCache[url] = img;

                /* Once the image is actually loaded and properly cached,
                 * call all of the onReady() callbacks we have defined.
                 */
                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };

            /* Set the initial cache value to false, this will change when
             * the image's onload event handler is called. Finally, point
             * the image's src attribute to the passed in URL.
             */
            resourceCache[url] = false;
            img.src = url;
        }
    }

    /* This is used by developers to grab references to images they know
     * have been previously loaded. If an image is cached, this functions
     * the same as calling load() on that URL.
     */
    function get(url) {
        return resourceCache[url];
    }

    /* This function determines if all of the images that have been requested
     * for loading have in fact been properly loaded.
     */
    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    /* This function will add a function to the callback stack that is called
     * when all requested images are properly loaded.
     */
    function onReady(func) {
        readyCallbacks.push(func);
    }

    /* This object defines the publicly accessible functions available to
     * developers by creating a global Resources object.
     */
    window.Resources = {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };
})();

// Return a random Integer between min and max
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// Returns a random integer between min (included) and max (included)
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Returns a random integer excluding a passed number
function getRandomIntExclude(min, max, exclude) {
  min = Math.ceil(min);
  max = Math.floor(max);
  var random = Math.floor(Math.random() * (max - min)) + min;
  // If the random number equals exclude add or subtract to it based on min
  if(random === exclude) {
    if(random > min ) {
      random -= 1;
    } else {
      random += 1;
    }
  }
  return random;
}

// Returns a random integer excluding a passed number
function getRandomIntExcludeMultiple(min, max, excludeArray) {
  min = Math.ceil(min);
  max = Math.floor(max);
  var randomArray = []
  // If the random number equals a number in excludeArray add don't include in random array
  for(i = min; i <= max; i++) {
    if(excludeArray.indexOf(i) === -1){
      randomArray.push(i);
    }
  }
  return randomArray[getRandomInt(0, randomArray.length)];
}

/*
 * This provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function() {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var $doc = $(document),
        $win = $(window),
        $canvas = $('<canvas width="505" height="606"></canvas>'),
        ctx = $canvas[0].getContext('2d'),
        start = false,
        lastTime;

    $canvas.width = 505;
    $canvas.height = 606;
    $('#canvas_container').append($canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        if(start) {
          update(dt);
          render();

          /* Set our lastTime variable which is used to determine the time delta
           * for the next time this function is called.
           */
          lastTime = now;
          updateTimer(lastTime);
        }

        if(gameOver) {
          reset();
        }

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        window.requestAnimationFrame(main);
    }

    // Set the time elapsed
    function updateTimer(lastTime) {
      var x = document.getElementById("timer");
      gameSeconds = new Date(lastTime - startTime).getSeconds();
      gameMinutes = new Date(lastTime - startTime).getMinutes();
      gameHours = gameMinutes % 60 ? gameHours : gameHours++;

      x.innerHTML = '<span id="hours">' + addZero(gameHours) + '<span class="time-colon">:</span>' +
                    '<span id="minutes">' + addZero(gameMinutes) + '<span class="time-colon">:</span>' +
                    '<span id="seconds">' + addZero(gameSeconds) + '</span>';
    }

    function addZero(i) {
      if (i < 10) {
          i = "0" + i;
      }
      return i;
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
      if(!gameOver) {
        updateEntities(dt);
        // checkCollisions();
      }
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
      player.update(dt);
      allEnemies.forEach(function(enemy) {
          enemy.update(dt);
      });
      box.update();
      goal.update();
      heart.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'assets/img/water-block.png',   // Top row is water
                'assets/img/stone-block.png',   // Row 1 of 3 of stone
                'assets/img/stone-block.png',   // Row 2 of 3 of stone
                'assets/img/stone-block.png',   // Row 3 of 3 of stone
                'assets/img/grass-block.png',   // Row 1 of 2 of grass
                'assets/img/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * colWidth, row * rowHeight);
            }
        }

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        // Render all game objects. Order is important so keep player last.
        goal.render();
        box.render();
        heart.render();
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        allRocks.forEach(function(rock) {
            rock.render();
        });
        player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // If the game is over, restart the time and boxes lost array.
        if(gameOver) {
          gameOver = !confirm('GAME OVER! Try Again?');
          startTime = Date.now();
          boxesLost = [];
          document.getElementById("boxes_lost").innerHTML = boxesLost.length;
          player = new Player('assets/img/char-boy.png');
          box = new Item('assets/img/gem-blue.png', 'indiebox'),
          points = 0;
          box.collected = false;
          document.getElementById("points").innerHTML = points;
          updateTimer();
        } else {
          start = confirm('Start game?');
        }
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    window.Resources.load([
      'assets/img/stone-block.png',
      'assets/img/water-block.png',
      'assets/img/grass-block.png',
      'assets/img/enemy-bug.png',
      'assets/img/char-boy.png',
      'assets/img/gem-blue.png',
      'assets/img/gem-green.png',
      'assets/img/gem-orange.png',
      'assets/img/heart.png',
      'assets/img/rock.png',
      'assets/img/star.png',
      'assets/img/selector.png'
    ]);

    window.Resources.onReady(init);

})(this);

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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc291cmNlcy5qcyIsImVuZ2luZS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJpbmRpZWJveGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogUmVzb3VyY2VzLmpzXG4gKiBUaGlzIGlzIHNpbXBseSBhbiBpbWFnZSBsb2FkaW5nIHV0aWxpdHkuIEl0IGVhc2VzIHRoZSBwcm9jZXNzIG9mIGxvYWRpbmdcbiAqIGltYWdlIGZpbGVzIHNvIHRoYXQgdGhleSBjYW4gYmUgdXNlZCB3aXRoaW4geW91ciBnYW1lLiBJdCBhbHNvIGluY2x1ZGVzXG4gKiBhIHNpbXBsZSBcImNhY2hpbmdcIiBsYXllciBzbyBpdCB3aWxsIHJldXNlIGNhY2hlZCBpbWFnZXMgaWYgeW91IGF0dGVtcHRcbiAqIHRvIGxvYWQgdGhlIHNhbWUgaW1hZ2UgbXVsdGlwbGUgdGltZXMuXG4gKi9cbihmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzb3VyY2VDYWNoZSA9IHt9O1xuICAgIHZhciBsb2FkaW5nID0gW107XG4gICAgdmFyIHJlYWR5Q2FsbGJhY2tzID0gW107XG5cbiAgICAvKiBUaGlzIGlzIHRoZSBwdWJsaWNseSBhY2Nlc3NpYmxlIGltYWdlIGxvYWRpbmcgZnVuY3Rpb24uIEl0IGFjY2VwdHNcbiAgICAgKiBhbiBhcnJheSBvZiBzdHJpbmdzIHBvaW50aW5nIHRvIGltYWdlIGZpbGVzIG9yIGEgc3RyaW5nIGZvciBhIHNpbmdsZVxuICAgICAqIGltYWdlLiBJdCB3aWxsIHRoZW4gY2FsbCBvdXIgcHJpdmF0ZSBpbWFnZSBsb2FkaW5nIGZ1bmN0aW9uIGFjY29yZGluZ2x5LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxvYWQodXJsT3JBcnIpIHtcbiAgICAgICAgaWYodXJsT3JBcnIgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgLyogSWYgdGhlIGRldmVsb3BlciBwYXNzZWQgaW4gYW4gYXJyYXkgb2YgaW1hZ2VzXG4gICAgICAgICAgICAgKiBsb29wIHRocm91Z2ggZWFjaCB2YWx1ZSBhbmQgY2FsbCBvdXIgaW1hZ2VcbiAgICAgICAgICAgICAqIGxvYWRlciBvbiB0aGF0IGltYWdlIGZpbGVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdXJsT3JBcnIuZm9yRWFjaChmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgICAgICAgICBfbG9hZCh1cmwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvKiBUaGUgZGV2ZWxvcGVyIGRpZCBub3QgcGFzcyBhbiBhcnJheSB0byB0aGlzIGZ1bmN0aW9uLFxuICAgICAgICAgICAgICogYXNzdW1lIHRoZSB2YWx1ZSBpcyBhIHN0cmluZyBhbmQgY2FsbCBvdXIgaW1hZ2UgbG9hZGVyXG4gICAgICAgICAgICAgKiBkaXJlY3RseS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgX2xvYWQodXJsT3JBcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogVGhpcyBpcyBvdXIgcHJpdmF0ZSBpbWFnZSBsb2FkZXIgZnVuY3Rpb24sIGl0IGlzXG4gICAgICogY2FsbGVkIGJ5IHRoZSBwdWJsaWMgaW1hZ2UgbG9hZGVyIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIF9sb2FkKHVybCkge1xuICAgICAgICBpZihyZXNvdXJjZUNhY2hlW3VybF0pIHtcbiAgICAgICAgICAgIC8qIElmIHRoaXMgVVJMIGhhcyBiZWVuIHByZXZpb3VzbHkgbG9hZGVkIGl0IHdpbGwgZXhpc3Qgd2l0aGluXG4gICAgICAgICAgICAgKiBvdXIgcmVzb3VyY2VDYWNoZSBhcnJheS4gSnVzdCByZXR1cm4gdGhhdCBpbWFnZSByYXRoZXJcbiAgICAgICAgICAgICAqIHJlLWxvYWRpbmcgdGhlIGltYWdlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gcmVzb3VyY2VDYWNoZVt1cmxdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLyogVGhpcyBVUkwgaGFzIG5vdCBiZWVuIHByZXZpb3VzbHkgbG9hZGVkIGFuZCBpcyBub3QgcHJlc2VudFxuICAgICAgICAgICAgICogd2l0aGluIG91ciBjYWNoZTsgd2UnbGwgbmVlZCB0byBsb2FkIHRoaXMgaW1hZ2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAvKiBPbmNlIG91ciBpbWFnZSBoYXMgcHJvcGVybHkgbG9hZGVkLCBhZGQgaXQgdG8gb3VyIGNhY2hlXG4gICAgICAgICAgICAgICAgICogc28gdGhhdCB3ZSBjYW4gc2ltcGx5IHJldHVybiB0aGlzIGltYWdlIGlmIHRoZSBkZXZlbG9wZXJcbiAgICAgICAgICAgICAgICAgKiBhdHRlbXB0cyB0byBsb2FkIHRoaXMgZmlsZSBpbiB0aGUgZnV0dXJlLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHJlc291cmNlQ2FjaGVbdXJsXSA9IGltZztcblxuICAgICAgICAgICAgICAgIC8qIE9uY2UgdGhlIGltYWdlIGlzIGFjdHVhbGx5IGxvYWRlZCBhbmQgcHJvcGVybHkgY2FjaGVkLFxuICAgICAgICAgICAgICAgICAqIGNhbGwgYWxsIG9mIHRoZSBvblJlYWR5KCkgY2FsbGJhY2tzIHdlIGhhdmUgZGVmaW5lZC5cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZihpc1JlYWR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVhZHlDYWxsYmFja3MuZm9yRWFjaChmdW5jdGlvbihmdW5jKSB7IGZ1bmMoKTsgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLyogU2V0IHRoZSBpbml0aWFsIGNhY2hlIHZhbHVlIHRvIGZhbHNlLCB0aGlzIHdpbGwgY2hhbmdlIHdoZW5cbiAgICAgICAgICAgICAqIHRoZSBpbWFnZSdzIG9ubG9hZCBldmVudCBoYW5kbGVyIGlzIGNhbGxlZC4gRmluYWxseSwgcG9pbnRcbiAgICAgICAgICAgICAqIHRoZSBpbWFnZSdzIHNyYyBhdHRyaWJ1dGUgdG8gdGhlIHBhc3NlZCBpbiBVUkwuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJlc291cmNlQ2FjaGVbdXJsXSA9IGZhbHNlO1xuICAgICAgICAgICAgaW1nLnNyYyA9IHVybDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIFRoaXMgaXMgdXNlZCBieSBkZXZlbG9wZXJzIHRvIGdyYWIgcmVmZXJlbmNlcyB0byBpbWFnZXMgdGhleSBrbm93XG4gICAgICogaGF2ZSBiZWVuIHByZXZpb3VzbHkgbG9hZGVkLiBJZiBhbiBpbWFnZSBpcyBjYWNoZWQsIHRoaXMgZnVuY3Rpb25zXG4gICAgICogdGhlIHNhbWUgYXMgY2FsbGluZyBsb2FkKCkgb24gdGhhdCBVUkwuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0KHVybCkge1xuICAgICAgICByZXR1cm4gcmVzb3VyY2VDYWNoZVt1cmxdO1xuICAgIH1cblxuICAgIC8qIFRoaXMgZnVuY3Rpb24gZGV0ZXJtaW5lcyBpZiBhbGwgb2YgdGhlIGltYWdlcyB0aGF0IGhhdmUgYmVlbiByZXF1ZXN0ZWRcbiAgICAgKiBmb3IgbG9hZGluZyBoYXZlIGluIGZhY3QgYmVlbiBwcm9wZXJseSBsb2FkZWQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNSZWFkeSgpIHtcbiAgICAgICAgdmFyIHJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgZm9yKHZhciBrIGluIHJlc291cmNlQ2FjaGUpIHtcbiAgICAgICAgICAgIGlmKHJlc291cmNlQ2FjaGUuaGFzT3duUHJvcGVydHkoaykgJiZcbiAgICAgICAgICAgICAgICFyZXNvdXJjZUNhY2hlW2tdKSB7XG4gICAgICAgICAgICAgICAgcmVhZHkgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVhZHk7XG4gICAgfVxuXG4gICAgLyogVGhpcyBmdW5jdGlvbiB3aWxsIGFkZCBhIGZ1bmN0aW9uIHRvIHRoZSBjYWxsYmFjayBzdGFjayB0aGF0IGlzIGNhbGxlZFxuICAgICAqIHdoZW4gYWxsIHJlcXVlc3RlZCBpbWFnZXMgYXJlIHByb3Blcmx5IGxvYWRlZC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBvblJlYWR5KGZ1bmMpIHtcbiAgICAgICAgcmVhZHlDYWxsYmFja3MucHVzaChmdW5jKTtcbiAgICB9XG5cbiAgICAvKiBUaGlzIG9iamVjdCBkZWZpbmVzIHRoZSBwdWJsaWNseSBhY2Nlc3NpYmxlIGZ1bmN0aW9ucyBhdmFpbGFibGUgdG9cbiAgICAgKiBkZXZlbG9wZXJzIGJ5IGNyZWF0aW5nIGEgZ2xvYmFsIFJlc291cmNlcyBvYmplY3QuXG4gICAgICovXG4gICAgd2luZG93LlJlc291cmNlcyA9IHtcbiAgICAgICAgbG9hZDogbG9hZCxcbiAgICAgICAgZ2V0OiBnZXQsXG4gICAgICAgIG9uUmVhZHk6IG9uUmVhZHksXG4gICAgICAgIGlzUmVhZHk6IGlzUmVhZHlcbiAgICB9O1xufSkoKTtcblxuLy8gUmV0dXJuIGEgcmFuZG9tIEludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heFxuZnVuY3Rpb24gZ2V0UmFuZG9tSW50KG1pbiwgbWF4KSB7XG4gIG1pbiA9IE1hdGguY2VpbChtaW4pO1xuICBtYXggPSBNYXRoLmZsb29yKG1heCk7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XG59XG5cbi8vIFJldHVybnMgYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiAoaW5jbHVkZWQpIGFuZCBtYXggKGluY2x1ZGVkKVxuZnVuY3Rpb24gZ2V0UmFuZG9tSW50SW5jbHVzaXZlKG1pbiwgbWF4KSB7XG4gIG1pbiA9IE1hdGguY2VpbChtaW4pO1xuICBtYXggPSBNYXRoLmZsb29yKG1heCk7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xufVxuXG4vLyBSZXR1cm5zIGEgcmFuZG9tIGludGVnZXIgZXhjbHVkaW5nIGEgcGFzc2VkIG51bWJlclxuZnVuY3Rpb24gZ2V0UmFuZG9tSW50RXhjbHVkZShtaW4sIG1heCwgZXhjbHVkZSkge1xuICBtaW4gPSBNYXRoLmNlaWwobWluKTtcbiAgbWF4ID0gTWF0aC5mbG9vcihtYXgpO1xuICB2YXIgcmFuZG9tID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xuICAvLyBJZiB0aGUgcmFuZG9tIG51bWJlciBlcXVhbHMgZXhjbHVkZSBhZGQgb3Igc3VidHJhY3QgdG8gaXQgYmFzZWQgb24gbWluXG4gIGlmKHJhbmRvbSA9PT0gZXhjbHVkZSkge1xuICAgIGlmKHJhbmRvbSA+IG1pbiApIHtcbiAgICAgIHJhbmRvbSAtPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICByYW5kb20gKz0gMTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJhbmRvbTtcbn1cblxuLy8gUmV0dXJucyBhIHJhbmRvbSBpbnRlZ2VyIGV4Y2x1ZGluZyBhIHBhc3NlZCBudW1iZXJcbmZ1bmN0aW9uIGdldFJhbmRvbUludEV4Y2x1ZGVNdWx0aXBsZShtaW4sIG1heCwgZXhjbHVkZUFycmF5KSB7XG4gIG1pbiA9IE1hdGguY2VpbChtaW4pO1xuICBtYXggPSBNYXRoLmZsb29yKG1heCk7XG4gIHZhciByYW5kb21BcnJheSA9IFtdXG4gIC8vIElmIHRoZSByYW5kb20gbnVtYmVyIGVxdWFscyBhIG51bWJlciBpbiBleGNsdWRlQXJyYXkgYWRkIGRvbid0IGluY2x1ZGUgaW4gcmFuZG9tIGFycmF5XG4gIGZvcihpID0gbWluOyBpIDw9IG1heDsgaSsrKSB7XG4gICAgaWYoZXhjbHVkZUFycmF5LmluZGV4T2YoaSkgPT09IC0xKXtcbiAgICAgIHJhbmRvbUFycmF5LnB1c2goaSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByYW5kb21BcnJheVtnZXRSYW5kb21JbnQoMCwgcmFuZG9tQXJyYXkubGVuZ3RoKV07XG59XG4iLCIvKlxuICogVGhpcyBwcm92aWRlcyB0aGUgZ2FtZSBsb29wIGZ1bmN0aW9uYWxpdHkgKHVwZGF0ZSBlbnRpdGllcyBhbmQgcmVuZGVyKSxcbiAqIGRyYXdzIHRoZSBpbml0aWFsIGdhbWUgYm9hcmQgb24gdGhlIHNjcmVlbiwgYW5kIHRoZW4gY2FsbHMgdGhlIHVwZGF0ZSBhbmRcbiAqIHJlbmRlciBtZXRob2RzIG9uIHlvdXIgcGxheWVyIGFuZCBlbmVteSBvYmplY3RzIChkZWZpbmVkIGluIHlvdXIgYXBwLmpzKS5cbiAqXG4gKiBBIGdhbWUgZW5naW5lIHdvcmtzIGJ5IGRyYXdpbmcgdGhlIGVudGlyZSBnYW1lIHNjcmVlbiBvdmVyIGFuZCBvdmVyLCBraW5kIG9mXG4gKiBsaWtlIGEgZmxpcGJvb2sgeW91IG1heSBoYXZlIGNyZWF0ZWQgYXMgYSBraWQuIFdoZW4geW91ciBwbGF5ZXIgbW92ZXMgYWNyb3NzXG4gKiB0aGUgc2NyZWVuLCBpdCBtYXkgbG9vayBsaWtlIGp1c3QgdGhhdCBpbWFnZS9jaGFyYWN0ZXIgaXMgbW92aW5nIG9yIGJlaW5nXG4gKiBkcmF3biBidXQgdGhhdCBpcyBub3QgdGhlIGNhc2UuIFdoYXQncyByZWFsbHkgaGFwcGVuaW5nIGlzIHRoZSBlbnRpcmUgXCJzY2VuZVwiXG4gKiBpcyBiZWluZyBkcmF3biBvdmVyIGFuZCBvdmVyLCBwcmVzZW50aW5nIHRoZSBpbGx1c2lvbiBvZiBhbmltYXRpb24uXG4gKlxuICogVGhpcyBlbmdpbmUgaXMgYXZhaWxhYmxlIGdsb2JhbGx5IHZpYSB0aGUgRW5naW5lIHZhcmlhYmxlIGFuZCBpdCBhbHNvIG1ha2VzXG4gKiB0aGUgY2FudmFzJyBjb250ZXh0IChjdHgpIG9iamVjdCBnbG9iYWxseSBhdmFpbGFibGUgdG8gbWFrZSB3cml0aW5nIGFwcC5qc1xuICogYSBsaXR0bGUgc2ltcGxlciB0byB3b3JrIHdpdGguXG4gKi9cblxudmFyIEVuZ2luZSA9IChmdW5jdGlvbigpIHtcbiAgICAvKiBQcmVkZWZpbmUgdGhlIHZhcmlhYmxlcyB3ZSdsbCBiZSB1c2luZyB3aXRoaW4gdGhpcyBzY29wZSxcbiAgICAgKiBjcmVhdGUgdGhlIGNhbnZhcyBlbGVtZW50LCBncmFiIHRoZSAyRCBjb250ZXh0IGZvciB0aGF0IGNhbnZhc1xuICAgICAqIHNldCB0aGUgY2FudmFzIGVsZW1lbnRzIGhlaWdodC93aWR0aCBhbmQgYWRkIGl0IHRvIHRoZSBET00uXG4gICAgICovXG4gICAgdmFyICRkb2MgPSAkKGRvY3VtZW50KSxcbiAgICAgICAgJHdpbiA9ICQod2luZG93KSxcbiAgICAgICAgJGNhbnZhcyA9ICQoJzxjYW52YXMgd2lkdGg9XCI1MDVcIiBoZWlnaHQ9XCI2MDZcIj48L2NhbnZhcz4nKSxcbiAgICAgICAgY3R4ID0gJGNhbnZhc1swXS5nZXRDb250ZXh0KCcyZCcpLFxuICAgICAgICBzdGFydCA9IGZhbHNlLFxuICAgICAgICBsYXN0VGltZTtcblxuICAgICRjYW52YXMud2lkdGggPSA1MDU7XG4gICAgJGNhbnZhcy5oZWlnaHQgPSA2MDY7XG4gICAgJCgnI2NhbnZhc19jb250YWluZXInKS5hcHBlbmQoJGNhbnZhcyk7XG5cbiAgICAvKiBUaGlzIGZ1bmN0aW9uIHNlcnZlcyBhcyB0aGUga2lja29mZiBwb2ludCBmb3IgdGhlIGdhbWUgbG9vcCBpdHNlbGZcbiAgICAgKiBhbmQgaGFuZGxlcyBwcm9wZXJseSBjYWxsaW5nIHRoZSB1cGRhdGUgYW5kIHJlbmRlciBtZXRob2RzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1haW4oKSB7XG4gICAgICAgIC8qIEdldCBvdXIgdGltZSBkZWx0YSBpbmZvcm1hdGlvbiB3aGljaCBpcyByZXF1aXJlZCBpZiB5b3VyIGdhbWVcbiAgICAgICAgICogcmVxdWlyZXMgc21vb3RoIGFuaW1hdGlvbi4gQmVjYXVzZSBldmVyeW9uZSdzIGNvbXB1dGVyIHByb2Nlc3Nlc1xuICAgICAgICAgKiBpbnN0cnVjdGlvbnMgYXQgZGlmZmVyZW50IHNwZWVkcyB3ZSBuZWVkIGEgY29uc3RhbnQgdmFsdWUgdGhhdFxuICAgICAgICAgKiB3b3VsZCBiZSB0aGUgc2FtZSBmb3IgZXZlcnlvbmUgKHJlZ2FyZGxlc3Mgb2YgaG93IGZhc3QgdGhlaXJcbiAgICAgICAgICogY29tcHV0ZXIgaXMpIC0gaHVycmF5IHRpbWUhXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIGR0ID0gKG5vdyAtIGxhc3RUaW1lKSAvIDEwMDAuMDtcblxuICAgICAgICAvKiBDYWxsIG91ciB1cGRhdGUvcmVuZGVyIGZ1bmN0aW9ucywgcGFzcyBhbG9uZyB0aGUgdGltZSBkZWx0YSB0b1xuICAgICAgICAgKiBvdXIgdXBkYXRlIGZ1bmN0aW9uIHNpbmNlIGl0IG1heSBiZSB1c2VkIGZvciBzbW9vdGggYW5pbWF0aW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgaWYoc3RhcnQpIHtcbiAgICAgICAgICB1cGRhdGUoZHQpO1xuICAgICAgICAgIHJlbmRlcigpO1xuXG4gICAgICAgICAgLyogU2V0IG91ciBsYXN0VGltZSB2YXJpYWJsZSB3aGljaCBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgdGltZSBkZWx0YVxuICAgICAgICAgICAqIGZvciB0aGUgbmV4dCB0aW1lIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICAgICAgICAgICAqL1xuICAgICAgICAgIGxhc3RUaW1lID0gbm93O1xuICAgICAgICAgIHVwZGF0ZVRpbWVyKGxhc3RUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGdhbWVPdmVyKSB7XG4gICAgICAgICAgcmVzZXQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFVzZSB0aGUgYnJvd3NlcidzIHJlcXVlc3RBbmltYXRpb25GcmFtZSBmdW5jdGlvbiB0byBjYWxsIHRoaXNcbiAgICAgICAgICogZnVuY3Rpb24gYWdhaW4gYXMgc29vbiBhcyB0aGUgYnJvd3NlciBpcyBhYmxlIHRvIGRyYXcgYW5vdGhlciBmcmFtZS5cbiAgICAgICAgICovXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobWFpbik7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSB0aW1lIGVsYXBzZWRcbiAgICBmdW5jdGlvbiB1cGRhdGVUaW1lcihsYXN0VGltZSkge1xuICAgICAgdmFyIHggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpbWVyXCIpO1xuICAgICAgZ2FtZVNlY29uZHMgPSBuZXcgRGF0ZShsYXN0VGltZSAtIHN0YXJ0VGltZSkuZ2V0U2Vjb25kcygpO1xuICAgICAgZ2FtZU1pbnV0ZXMgPSBuZXcgRGF0ZShsYXN0VGltZSAtIHN0YXJ0VGltZSkuZ2V0TWludXRlcygpO1xuICAgICAgZ2FtZUhvdXJzID0gZ2FtZU1pbnV0ZXMgJSA2MCA/IGdhbWVIb3VycyA6IGdhbWVIb3VycysrO1xuXG4gICAgICB4LmlubmVySFRNTCA9ICc8c3BhbiBpZD1cImhvdXJzXCI+JyArIGFkZFplcm8oZ2FtZUhvdXJzKSArICc8c3BhbiBjbGFzcz1cInRpbWUtY29sb25cIj46PC9zcGFuPicgK1xuICAgICAgICAgICAgICAgICAgICAnPHNwYW4gaWQ9XCJtaW51dGVzXCI+JyArIGFkZFplcm8oZ2FtZU1pbnV0ZXMpICsgJzxzcGFuIGNsYXNzPVwidGltZS1jb2xvblwiPjo8L3NwYW4+JyArXG4gICAgICAgICAgICAgICAgICAgICc8c3BhbiBpZD1cInNlY29uZHNcIj4nICsgYWRkWmVybyhnYW1lU2Vjb25kcykgKyAnPC9zcGFuPic7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkWmVybyhpKSB7XG4gICAgICBpZiAoaSA8IDEwKSB7XG4gICAgICAgICAgaSA9IFwiMFwiICsgaTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpO1xuICAgIH1cblxuICAgIC8qIFRoaXMgZnVuY3Rpb24gZG9lcyBzb21lIGluaXRpYWwgc2V0dXAgdGhhdCBzaG91bGQgb25seSBvY2N1ciBvbmNlLFxuICAgICAqIHBhcnRpY3VsYXJseSBzZXR0aW5nIHRoZSBsYXN0VGltZSB2YXJpYWJsZSB0aGF0IGlzIHJlcXVpcmVkIGZvciB0aGVcbiAgICAgKiBnYW1lIGxvb3AuXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgcmVzZXQoKTtcbiAgICAgICAgbGFzdFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBtYWluKCk7XG4gICAgfVxuXG4gICAgLyogVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgYnkgbWFpbiAob3VyIGdhbWUgbG9vcCkgYW5kIGl0c2VsZiBjYWxscyBhbGxcbiAgICAgKiBvZiB0aGUgZnVuY3Rpb25zIHdoaWNoIG1heSBuZWVkIHRvIHVwZGF0ZSBlbnRpdHkncyBkYXRhLiBCYXNlZCBvbiBob3dcbiAgICAgKiB5b3UgaW1wbGVtZW50IHlvdXIgY29sbGlzaW9uIGRldGVjdGlvbiAod2hlbiB0d28gZW50aXRpZXMgb2NjdXB5IHRoZVxuICAgICAqIHNhbWUgc3BhY2UsIGZvciBpbnN0YW5jZSB3aGVuIHlvdXIgY2hhcmFjdGVyIHNob3VsZCBkaWUpLCB5b3UgbWF5IGZpbmRcbiAgICAgKiB0aGUgbmVlZCB0byBhZGQgYW4gYWRkaXRpb25hbCBmdW5jdGlvbiBjYWxsIGhlcmUuIEZvciBub3csIHdlJ3ZlIGxlZnRcbiAgICAgKiBpdCBjb21tZW50ZWQgb3V0IC0geW91IG1heSBvciBtYXkgbm90IHdhbnQgdG8gaW1wbGVtZW50IHRoaXNcbiAgICAgKiBmdW5jdGlvbmFsaXR5IHRoaXMgd2F5ICh5b3UgY291bGQganVzdCBpbXBsZW1lbnQgY29sbGlzaW9uIGRldGVjdGlvblxuICAgICAqIG9uIHRoZSBlbnRpdGllcyB0aGVtc2VsdmVzIHdpdGhpbiB5b3VyIGFwcC5qcyBmaWxlKS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1cGRhdGUoZHQpIHtcbiAgICAgIGlmKCFnYW1lT3Zlcikge1xuICAgICAgICB1cGRhdGVFbnRpdGllcyhkdCk7XG4gICAgICAgIC8vIGNoZWNrQ29sbGlzaW9ucygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qIFRoaXMgaXMgY2FsbGVkIGJ5IHRoZSB1cGRhdGUgZnVuY3Rpb24gYW5kIGxvb3BzIHRocm91Z2ggYWxsIG9mIHRoZVxuICAgICAqIG9iamVjdHMgd2l0aGluIHlvdXIgYWxsRW5lbWllcyBhcnJheSBhcyBkZWZpbmVkIGluIGFwcC5qcyBhbmQgY2FsbHNcbiAgICAgKiB0aGVpciB1cGRhdGUoKSBtZXRob2RzLiBJdCB3aWxsIHRoZW4gY2FsbCB0aGUgdXBkYXRlIGZ1bmN0aW9uIGZvciB5b3VyXG4gICAgICogcGxheWVyIG9iamVjdC4gVGhlc2UgdXBkYXRlIG1ldGhvZHMgc2hvdWxkIGZvY3VzIHB1cmVseSBvbiB1cGRhdGluZ1xuICAgICAqIHRoZSBkYXRhL3Byb3BlcnRpZXMgcmVsYXRlZCB0byB0aGUgb2JqZWN0LiBEbyB5b3VyIGRyYXdpbmcgaW4geW91clxuICAgICAqIHJlbmRlciBtZXRob2RzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHVwZGF0ZUVudGl0aWVzKGR0KSB7XG4gICAgICBwbGF5ZXIudXBkYXRlKGR0KTtcbiAgICAgIGFsbEVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbihlbmVteSkge1xuICAgICAgICAgIGVuZW15LnVwZGF0ZShkdCk7XG4gICAgICB9KTtcbiAgICAgIGJveC51cGRhdGUoKTtcbiAgICAgIGdvYWwudXBkYXRlKCk7XG4gICAgICBoZWFydC51cGRhdGUoKTtcbiAgICB9XG5cbiAgICAvKiBUaGlzIGZ1bmN0aW9uIGluaXRpYWxseSBkcmF3cyB0aGUgXCJnYW1lIGxldmVsXCIsIGl0IHdpbGwgdGhlbiBjYWxsXG4gICAgICogdGhlIHJlbmRlckVudGl0aWVzIGZ1bmN0aW9uLiBSZW1lbWJlciwgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgZXZlcnlcbiAgICAgKiBnYW1lIHRpY2sgKG9yIGxvb3Agb2YgdGhlIGdhbWUgZW5naW5lKSBiZWNhdXNlIHRoYXQncyBob3cgZ2FtZXMgd29yayAtXG4gICAgICogdGhleSBhcmUgZmxpcGJvb2tzIGNyZWF0aW5nIHRoZSBpbGx1c2lvbiBvZiBhbmltYXRpb24gYnV0IGluIHJlYWxpdHlcbiAgICAgKiB0aGV5IGFyZSBqdXN0IGRyYXdpbmcgdGhlIGVudGlyZSBzY3JlZW4gb3ZlciBhbmQgb3Zlci5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIC8qIFRoaXMgYXJyYXkgaG9sZHMgdGhlIHJlbGF0aXZlIFVSTCB0byB0aGUgaW1hZ2UgdXNlZFxuICAgICAgICAgKiBmb3IgdGhhdCBwYXJ0aWN1bGFyIHJvdyBvZiB0aGUgZ2FtZSBsZXZlbC5cbiAgICAgICAgICovXG4gICAgICAgIHZhciByb3dJbWFnZXMgPSBbXG4gICAgICAgICAgICAgICAgJ2Fzc2V0cy9pbWcvd2F0ZXItYmxvY2sucG5nJywgICAvLyBUb3Agcm93IGlzIHdhdGVyXG4gICAgICAgICAgICAgICAgJ2Fzc2V0cy9pbWcvc3RvbmUtYmxvY2sucG5nJywgICAvLyBSb3cgMSBvZiAzIG9mIHN0b25lXG4gICAgICAgICAgICAgICAgJ2Fzc2V0cy9pbWcvc3RvbmUtYmxvY2sucG5nJywgICAvLyBSb3cgMiBvZiAzIG9mIHN0b25lXG4gICAgICAgICAgICAgICAgJ2Fzc2V0cy9pbWcvc3RvbmUtYmxvY2sucG5nJywgICAvLyBSb3cgMyBvZiAzIG9mIHN0b25lXG4gICAgICAgICAgICAgICAgJ2Fzc2V0cy9pbWcvZ3Jhc3MtYmxvY2sucG5nJywgICAvLyBSb3cgMSBvZiAyIG9mIGdyYXNzXG4gICAgICAgICAgICAgICAgJ2Fzc2V0cy9pbWcvZ3Jhc3MtYmxvY2sucG5nJyAgICAvLyBSb3cgMiBvZiAyIG9mIGdyYXNzXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgbnVtUm93cyA9IDYsXG4gICAgICAgICAgICBudW1Db2xzID0gNSxcbiAgICAgICAgICAgIHJvdywgY29sO1xuXG4gICAgICAgIC8qIExvb3AgdGhyb3VnaCB0aGUgbnVtYmVyIG9mIHJvd3MgYW5kIGNvbHVtbnMgd2UndmUgZGVmaW5lZCBhYm92ZVxuICAgICAgICAgKiBhbmQsIHVzaW5nIHRoZSByb3dJbWFnZXMgYXJyYXksIGRyYXcgdGhlIGNvcnJlY3QgaW1hZ2UgZm9yIHRoYXRcbiAgICAgICAgICogcG9ydGlvbiBvZiB0aGUgXCJncmlkXCJcbiAgICAgICAgICovXG4gICAgICAgIGZvciAocm93ID0gMDsgcm93IDwgbnVtUm93czsgcm93KyspIHtcbiAgICAgICAgICAgIGZvciAoY29sID0gMDsgY29sIDwgbnVtQ29sczsgY29sKyspIHtcbiAgICAgICAgICAgICAgICAvKiBUaGUgZHJhd0ltYWdlIGZ1bmN0aW9uIG9mIHRoZSBjYW52YXMnIGNvbnRleHQgZWxlbWVudFxuICAgICAgICAgICAgICAgICAqIHJlcXVpcmVzIDMgcGFyYW1ldGVyczogdGhlIGltYWdlIHRvIGRyYXcsIHRoZSB4IGNvb3JkaW5hdGVcbiAgICAgICAgICAgICAgICAgKiB0byBzdGFydCBkcmF3aW5nIGFuZCB0aGUgeSBjb29yZGluYXRlIHRvIHN0YXJ0IGRyYXdpbmcuXG4gICAgICAgICAgICAgICAgICogV2UncmUgdXNpbmcgb3VyIFJlc291cmNlcyBoZWxwZXJzIHRvIHJlZmVyIHRvIG91ciBpbWFnZXNcbiAgICAgICAgICAgICAgICAgKiBzbyB0aGF0IHdlIGdldCB0aGUgYmVuZWZpdHMgb2YgY2FjaGluZyB0aGVzZSBpbWFnZXMsIHNpbmNlXG4gICAgICAgICAgICAgICAgICogd2UncmUgdXNpbmcgdGhlbSBvdmVyIGFuZCBvdmVyLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoUmVzb3VyY2VzLmdldChyb3dJbWFnZXNbcm93XSksIGNvbCAqIGNvbFdpZHRoLCByb3cgKiByb3dIZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVuZGVyRW50aXRpZXMoKTtcbiAgICB9XG5cbiAgICAvKiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBieSB0aGUgcmVuZGVyIGZ1bmN0aW9uIGFuZCBpcyBjYWxsZWQgb24gZWFjaCBnYW1lXG4gICAgICogdGljay4gSXRzIHB1cnBvc2UgaXMgdG8gdGhlbiBjYWxsIHRoZSByZW5kZXIgZnVuY3Rpb25zIHlvdSBoYXZlIGRlZmluZWRcbiAgICAgKiBvbiB5b3VyIGVuZW15IGFuZCBwbGF5ZXIgZW50aXRpZXMgd2l0aGluIGFwcC5qc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlbmRlckVudGl0aWVzKCkge1xuICAgICAgICAvLyBSZW5kZXIgYWxsIGdhbWUgb2JqZWN0cy4gT3JkZXIgaXMgaW1wb3J0YW50IHNvIGtlZXAgcGxheWVyIGxhc3QuXG4gICAgICAgIGdvYWwucmVuZGVyKCk7XG4gICAgICAgIGJveC5yZW5kZXIoKTtcbiAgICAgICAgaGVhcnQucmVuZGVyKCk7XG4gICAgICAgIGFsbEVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbihlbmVteSkge1xuICAgICAgICAgICAgZW5lbXkucmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBhbGxSb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uKHJvY2spIHtcbiAgICAgICAgICAgIHJvY2sucmVuZGVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBwbGF5ZXIucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgLyogVGhpcyBmdW5jdGlvbiBkb2VzIG5vdGhpbmcgYnV0IGl0IGNvdWxkIGhhdmUgYmVlbiBhIGdvb2QgcGxhY2UgdG9cbiAgICAgKiBoYW5kbGUgZ2FtZSByZXNldCBzdGF0ZXMgLSBtYXliZSBhIG5ldyBnYW1lIG1lbnUgb3IgYSBnYW1lIG92ZXIgc2NyZWVuXG4gICAgICogdGhvc2Ugc29ydHMgb2YgdGhpbmdzLiBJdCdzIG9ubHkgY2FsbGVkIG9uY2UgYnkgdGhlIGluaXQoKSBtZXRob2QuXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgIC8vIElmIHRoZSBnYW1lIGlzIG92ZXIsIHJlc3RhcnQgdGhlIHRpbWUgYW5kIGJveGVzIGxvc3QgYXJyYXkuXG4gICAgICAgIGlmKGdhbWVPdmVyKSB7XG4gICAgICAgICAgZ2FtZU92ZXIgPSAhY29uZmlybSgnR0FNRSBPVkVSISBUcnkgQWdhaW4/Jyk7XG4gICAgICAgICAgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICBib3hlc0xvc3QgPSBbXTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJveGVzX2xvc3RcIikuaW5uZXJIVE1MID0gYm94ZXNMb3N0Lmxlbmd0aDtcbiAgICAgICAgICBwbGF5ZXIgPSBuZXcgUGxheWVyKCdhc3NldHMvaW1nL2NoYXItYm95LnBuZycpO1xuICAgICAgICAgIGJveCA9IG5ldyBJdGVtKCdhc3NldHMvaW1nL2dlbS1ibHVlLnBuZycsICdpbmRpZWJveCcpLFxuICAgICAgICAgIHBvaW50cyA9IDA7XG4gICAgICAgICAgYm94LmNvbGxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9pbnRzXCIpLmlubmVySFRNTCA9IHBvaW50cztcbiAgICAgICAgICB1cGRhdGVUaW1lcigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0YXJ0ID0gY29uZmlybSgnU3RhcnQgZ2FtZT8nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIEdvIGFoZWFkIGFuZCBsb2FkIGFsbCBvZiB0aGUgaW1hZ2VzIHdlIGtub3cgd2UncmUgZ29pbmcgdG8gbmVlZCB0b1xuICAgICAqIGRyYXcgb3VyIGdhbWUgbGV2ZWwuIFRoZW4gc2V0IGluaXQgYXMgdGhlIGNhbGxiYWNrIG1ldGhvZCwgc28gdGhhdCB3aGVuXG4gICAgICogYWxsIG9mIHRoZXNlIGltYWdlcyBhcmUgcHJvcGVybHkgbG9hZGVkIG91ciBnYW1lIHdpbGwgc3RhcnQuXG4gICAgICovXG4gICAgd2luZG93LlJlc291cmNlcy5sb2FkKFtcbiAgICAgICdhc3NldHMvaW1nL3N0b25lLWJsb2NrLnBuZycsXG4gICAgICAnYXNzZXRzL2ltZy93YXRlci1ibG9jay5wbmcnLFxuICAgICAgJ2Fzc2V0cy9pbWcvZ3Jhc3MtYmxvY2sucG5nJyxcbiAgICAgICdhc3NldHMvaW1nL2VuZW15LWJ1Zy5wbmcnLFxuICAgICAgJ2Fzc2V0cy9pbWcvY2hhci1ib3kucG5nJyxcbiAgICAgICdhc3NldHMvaW1nL2dlbS1ibHVlLnBuZycsXG4gICAgICAnYXNzZXRzL2ltZy9nZW0tZ3JlZW4ucG5nJyxcbiAgICAgICdhc3NldHMvaW1nL2dlbS1vcmFuZ2UucG5nJyxcbiAgICAgICdhc3NldHMvaW1nL2hlYXJ0LnBuZycsXG4gICAgICAnYXNzZXRzL2ltZy9yb2NrLnBuZycsXG4gICAgICAnYXNzZXRzL2ltZy9zdGFyLnBuZycsXG4gICAgICAnYXNzZXRzL2ltZy9zZWxlY3Rvci5wbmcnXG4gICAgXSk7XG5cbiAgICB3aW5kb3cuUmVzb3VyY2VzLm9uUmVhZHkoaW5pdCk7XG5cbn0pKHRoaXMpO1xuIiwiLy8gU2V0IHVwIGdsb2JhbCB2YXJzXG52YXIgY3R4ID0gJCgnY2FudmFzJylbMF0uZ2V0Q29udGV4dCgnMmQnKSxcbiAgICBjb2xXaWR0aCA9IDEwMSxcbiAgICByb3dIZWlnaHQgPSA4MCxcbiAgICBvZmZzZXRZID0gMjUsXG4gICAgaGl0ID0gZmFsc2UsXG4gICAgZ29hbFJlYWNoZWQgPSBmYWxzZSxcbiAgICBib3hlc0xvc3QgPSBbXSxcbiAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLFxuICAgIGhlYXJ0WCxcbiAgICBoZWFydFksXG4gICAgcG9pbnRzID0gMCxcbiAgICBnYW1lSG91cnMgPSAwLFxuICAgIGdhbWVNaW51dGVzID0gMCxcbiAgICBnYW1lU2Vjb25kcyA9IDAsXG4gICAgZ2FtZU92ZXIgPSBmYWxzZTtcblxuXG52YXIgRW5lbXlMYW5lID0gZnVuY3Rpb24oKSB7XG4gIC8vIFNldCB1cCBhcnJ5IGZvciBlbmVtaWVzIGluIHRoYXQgbGFuZVxuICB0aGlzLmVuZW1pZXMgPSBbXTtcbn1cblxudmFyIEdvYWxMYW5lID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZ29hbHMgPSBbXTtcbn1cblxudmFyIFN0YXJ0TGFuZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnN0YXJ0cyA9IFtdO1xufVxuXG52YXIgYm9hcmRMYW5lcyA9IFtuZXcgR29hbExhbmUsIG5ldyBFbmVteUxhbmUoKSwgbmV3IEVuZW15TGFuZSgpLCBuZXcgRW5lbXlMYW5lKCksIG5ldyBTdGFydExhbmUoKSwgbmV3IFN0YXJ0TGFuZSgpXTtcbnZhciBlbmVteVF1ZXVlTGFuZXMgPSBbbmV3IEVuZW15TGFuZSgpLCBuZXcgRW5lbXlMYW5lKCksIG5ldyBFbmVteUxhbmUoKV07XG5cbi8vIEVuZW1pZXMgb3VyIHBsYXllciBtdXN0IGF2b2lkXG52YXIgRW5lbXkgPSBmdW5jdGlvbihzcGVlZCwgc3ByaXRlKSB7XG5cbiAgICAvLyBpbWFnZSB1cmxcbiAgICB0aGlzLnNwcml0ZSA9IHNwcml0ZTtcblxuICAgIC8vIEludGVnZXIgZm9yIGhvdyBmYXN0IHRoZSBlbmVteSB0cmF2ZWxzLCBtYXggc3BlZWQgM1xuICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcblxuICAgIC8vIFN0YXJ0IHRoZSBlbmVteSByYW5kb21seSBvZmYgdGhlIGJvYXJkIGEgd2F5c1xuICAgIHRoaXMueCA9IC1nZXRSYW5kb21JbnQoMSwgOCk7XG5cbiAgICAvLyBTZWxlY3QgYSByYW5kb20gcm93IGJldHdlZW4gdGhlIHNlY29uZCBhbmQgZm9ydGhcbiAgICB0aGlzLnkgPSBnZXRSYW5kb21JbnQoMSwgNCk7XG5cbiAgICAvLyBNYXJrZXIgdG8gdHJhY2sgbGFuZSBwb3NpdGlvblxuICAgIHRoaXMucHJldlggPSBudWxsO1xuXG4gICAgLy8gc2V0IHdoZW4gdGhlIGVuZW15IGlzIHZpc2FibGVcbiAgICB0aGlzLnZpc2FibGUgPSBmYWxzZTtcblxuICAgIC8vIHNldCB3aGVuIHRoZSBlbmVteSBydW5zIG92ZXIgYW4gaXRlbVxuICAgIHRoaXMuaGl0Qm94ID0gZmFsc2U7XG5cbiAgICB0aGlzLmxhbmVPcmRlciA9IDA7XG5cbiAgICAvLyBTZXR1cCBwb3NpdGlvbiBpbiBlbmVteVF1ZXVlTGFuZXNcbiAgICBlbmVteVF1ZXVlTGFuZXNbdGhpcy55IC0gMV0uZW5lbWllcy5zcGxpY2UoLXRoaXMueCAsIDAsIC10aGlzLngpO1xuXG4gICAgY29uc29sZS5sb2coJ0VuZW15IExhbmUgJyArIHRoaXMueSArICcgbGVuZ3RoOiAnICsgZW5lbXlRdWV1ZUxhbmVzW3RoaXMueSAtIDFdLmVuZW1pZXMubGVuZ3RoKTtcbiAgICAvLyBVcGRhdGUgdGVzdCB2aWV2ZXJcbiAgICAkKCcjZW5lbXlfbGFuZV8nICsgdGhpcy55KS50ZXh0KGVuZW15UXVldWVMYW5lc1t0aGlzLnkgLSAxXS5lbmVtaWVzLmxlbmd0aCk7XG59O1xuXG4vLyBVcGRhdGUgdGhlIGVuZW15J3MgcG9zaXRpb25cbi8vIFBhcmFtZXRlcjogZHQsIGEgdGltZSBkZWx0YSBiZXR3ZWVuIHRpY2tzXG5FbmVteS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcbiAgICAvLyBNb3ZlIHRoZSBlbmVteSBhY3Jvc3MgdGhlIHJvd1xuICAgIHRoaXMueCA9IHRoaXMueCArIGR0ICogdGhpcy5zcGVlZDtcblxuICAgIC8vIElmIHRoZSBlbmVteSB4IGlzIGdyZWF0ZXIgdGhhbiB6ZXJvIGl0J3MgdmlzYWJsZVxuICAgIGlmKHRoaXMueCA+IDAgJiYgdGhpcy52aXNhYmxlID09PSBmYWxzZSkge1xuICAgICAgdGhpcy52aXNhYmxlID0gdHJ1ZTtcbiAgICAgIC8vIHJlbW92ZSBmcm9tIGVuZW15UXVldWVMYW5lc1xuICAgICAgZW5lbXlRdWV1ZUxhbmVzW3RoaXMueSAtIDFdLmVuZW1pZXMuc3BsaWNlKE1hdGguZmxvb3IodGhpcy54KSwgMSk7XG4gICAgICAvLyBhZGQgdG8gYm9hcmRMYW5lc1xuICAgICAgYm9hcmRMYW5lc1t0aGlzLnldLmVuZW1pZXMuc3BsaWNlKHRoaXMueCwgMCwgdGhpcy54KTtcblxuICAgICAgLy8gVXBkYXRlIHRlc3QgdmlldmVyXG4gICAgICAkKCcjZW5lbXlfbGFuZV8nICsgdGhpcy55KS50ZXh0KGVuZW15UXVldWVMYW5lc1t0aGlzLnkgLSAxXS5lbmVtaWVzLmxlbmd0aCk7XG4gICAgICBjb25zb2xlLmxvZygnRW5lbXkgWTogJywgdGhpcy55KTtcbiAgICB9IGVsc2UgaWYodGhpcy54ID49IDUgJiYgdGhpcy52aXNhYmxlID09PSB0cnVlKSB7XG4gICAgICAvLyBJZiB0aGUgZW5lbXkgeCBpcyBncmVhdGVyIHRoYW4gNSBpcyBub3QgdmlzYWJsZSBvbiB0aGUgYm9hcmRcbiAgICAgIC8vIFJlZHJhdyBlbmVteSBvZmYgY2FudmFzIGFuZCBzZXQgdmlzYWJsZSB0byBmYWxzZVxuICAgICAgdGhpcy52aXNhYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLnkgPSBnZXRSYW5kb21JbnQoMSwgNCk7XG4gICAgICAvLyBHZXQgYSBuZXcgeCB2YWx1ZSB0byBzdGFydCBvZmYgYm9hcmQgdGhhdCBpc24ndCBhbHJlYWR5IHRha2VuIGluIHRoYXQgbGFuZS5cbiAgICAgIHRoaXMueCA9IC1nZXRSYW5kb21JbnRFeGNsdWRlTXVsdGlwbGUoMSwgNSwgZW5lbXlRdWV1ZUxhbmVzW3RoaXMueSAtIDFdLmVuZW1pZXMpO1xuICAgICAgdGhpcy5wcmV2WCA9ICB0aGlzLng7XG4gICAgICB0aGlzLnNwZWVkID0gZ2V0UmFuZG9tSW50KDEsIDQpO1xuICAgICAgdGhpcy5oaXRCb3ggPSBmYWxzZTtcbiAgICAgIC8vIHJlbW92ZSBmcm9tIGJvYXJkTGFuZXMgYW5kIHB1dCBiYWNrIGludG8gZW5lbXlRdWV1ZUxhbmVzXG4gICAgICBib2FyZExhbmVzW3RoaXMueV0uZW5lbWllcy5zcGxpY2UodGhpcy5sYW5lT3JkZXIsIDEpO1xuICAgICAgZW5lbXlRdWV1ZUxhbmVzW3RoaXMueSAtIDFdLmVuZW1pZXMuc3BsaWNlKC10aGlzLnggLCAwLCAtdGhpcy54KTtcbiAgICAgIGNvbnNvbGUubG9nKCdFbmVteSBMYW5lICcgKyB0aGlzLnkgKyAnIGxlbmd0aDogJyArIGVuZW15UXVldWVMYW5lc1t0aGlzLnkgLSAxXS5lbmVtaWVzLmxlbmd0aCk7XG4gICAgICAkKCcjZW5lbXlfbGFuZV8nICsgdGhpcy55KS50ZXh0KGVuZW15UXVldWVMYW5lc1t0aGlzLnkgLSAxXS5lbmVtaWVzLmxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEhhdmUgZW5lbWllcyBzdG9wIHJpZ2h0IGJlaGluZCBhbiBlbmVteSBpZiB0aGV5IGFyZSBnb2luZyBmYXN0ZXIgdGhhblxuICAgICAgLy8gdGhlIG9uZSBhaGVhZCBvZiB0aGVtLlxuICAgICAgdmFyIGVuZW15WCA9IHRoaXMueDtcbiAgICAgIHZhciBlbmVteVkgPSB0aGlzLnk7XG4gICAgICB2YXIgZW5lbXlTcGVlZCA9IHRoaXMuc3BlZWQ7XG4gICAgICB2YXIgbmV3U3BlZWQgPSAwO1xuXG4gICAgICAvLyBVcGRhdGUgZW5lbXkncyBwb3NpdGlvbiBpbiB0aGUgZW5lbXlRdWV1ZUxhbmVcbiAgICAgIGlmKCAhdGhpcy52aXNhYmxlICYmIE1hdGguZmxvb3IoZW5lbXlYKSA+IHRoaXMucHJldlgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ29yaWdpbmFsIGVuZW15WDogJyArIGVuZW15WCk7XG4gICAgICAgIGVuZW15WCA9IE1hdGguZmxvb3IoZW5lbXlYKSA8IDAgPyAtTWF0aC5mbG9vcihlbmVteVgpIDogTWF0aC5mbG9vcihlbmVteVgpO1xuICAgICAgICBjb25zb2xlLmxvZygncHJldlg6ICcgKyB0aGlzLnByZXZYLCAnZW5lbXlYOiAnICsgZW5lbXlYKTtcbiAgICAgICAgZW5lbXlRdWV1ZUxhbmVzW3RoaXMueSAtIDFdLmVuZW1pZXMuc3BsaWNlKHRoaXMucHJldlgsIDEpOyAvLyByZW1vdmUgcHJldmlvdXMgbGFuZSBwb3N0aW9uXG4gICAgICAgIGVuZW15UXVldWVMYW5lc1t0aGlzLnkgLSAxXS5lbmVtaWVzLnNwbGljZShNYXRoLnJvdW5kKGVuZW15WCksIDAsIE1hdGgucm91bmQoZW5lbXlYKSk7IC8vIG5ldyBwb3NpdGlvblxuICAgICAgICB0aGlzLnByZXZYID0gZW5lbXlYOyAvLyBzZXQgbmV3IHByZXZYIHRvIHRyYWNrIHBvc2l0aW9uXG4gICAgICB9XG4gICAgICAvLyBMb29wIHRocm91Z2ggYWxsIGVuZW1pZXMgaW4gYSBsYW5lLiBJZiB0aGV5J3JlIHNwZWVkIGlzIGdyZWF0ZXIgdGhhbiBvbmUgaW5mcm9udCBvZiB0aGVtXG4gICAgICAvLyBtYXRjaCB0aGVpciBzcGVlZHMgb25jZSB0aGV5IGFyZSAxIHNwYWNlIGF3YXkuXG4gICAgICBhbGxFbmVtaWVzLmZvckVhY2goZnVuY3Rpb24oZW5lbXkpIHtcbiAgICAgICAgaWYoZW5lbXkueSA9PT0gZW5lbXlZKSB7XG4gICAgICAgICAgaWYoZW5lbXlYIDw9IChlbmVteS54ICsgMSkgJiYgZW5lbXkuc3BlZWQgPCBlbmVteVNwZWVkKSB7XG4gICAgICAgICAgICBuZXdTcGVlZCA9IGVuZW15LnNwZWVkO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0VuZW15IGF0IFk6ICcgKyBlbmVteVkgKyAnLCBYOiAnICsgZW5lbXlYICsgJyBjaGFuZ2VkIHNwZWVkLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmKG5ld1NwZWVkID4gMCkge1xuICAgICAgICB0aGlzLnNwZWVkID0gbmV3U3BlZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gIC8vIElmIGFuIGVuZW15IGhpdHMgdGhlIHBsYXllciwgc2V0IHRoZW0gYmFjayBhbmQgcmVkdWNlIGxpdmVzXG4gIGlmKHBsYXllci5pbnRlcnNlY3RzKHRoaXMpKXtcbiAgICBoaXQgPSB0cnVlO1xuICB9XG5cbiAgLy8gSWYgYW4gZW5lbXkgaGl0cyBhIGJveCwgaW5jcmVtZW50IGhvdyBtYW55IHRpbWVzIGl0IHdhcyBoaXRcbiAgaWYodGhpcy55ID09PSBib3gueSAmJiB0aGlzLmhpdEJveCA9PT0gZmFsc2UpIHtcbiAgICBpZiggdGhpcy54ID4gKGJveC54IC0gLjUpICYmIHRoaXMueCA8IChib3gueCArIC41KSApIHtcbiAgICAgIHRoaXMuaGl0Qm94ID0gdHJ1ZTtcbiAgICAgIGJveC5yYW5PdmVyICs9IDE7XG4gICAgICBjb25zb2xlLmxvZygnQm94IHJhbiBvdmVyIScpO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRHJhd3MgYW4gZW5lbXkgb24gdGhlIHNjcmVlblxuRW5lbXkucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICBjdHguZHJhd0ltYWdlKFJlc291cmNlcy5nZXQodGhpcy5zcHJpdGUpLCB0aGlzLnggKiBjb2xXaWR0aCwgdGhpcy55ICogcm93SGVpZ2h0IC0gb2Zmc2V0WSk7XG59O1xuXG52YXIgSXRlbSA9IGZ1bmN0aW9uKGltYWdlLCB0eXBlKSB7XG4gIHRoaXMuc3ByaXRlID0gaW1hZ2U7XG4gIHRoaXMudHlwZSA9IHR5cGU7XG4gIHRoaXMuY29sbGVjdGVkID0gZmFsc2U7XG4gIC8vIElmIHRoZSBpdGVtIGlzIGFuIGluZGllYm94LCBzdGFydCBpdCBpbiB0aGUgY2FudmFzIGxhbmVzLlxuICAvLyBJZiBpdCdzIGhlYXJ0LCBzdGFydCBpdCBvZmYgY2FudmFzLlxuICBpZih0eXBlID09PSAnaW5kaWVib3gnKSB7XG4gICAgdGhpcy54ID0gZ2V0UmFuZG9tSW50KDAsIDUpO1xuICAgIHRoaXMueSA9IGdldFJhbmRvbUludCgxLCA0KTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnggPSAxMDA7XG4gICAgdGhpcy55ID0gMTAwO1xuICB9XG5cbiAgdGhpcy5oID0gMTE3OyAvLyBoZWlnaHQgb2YgaXRlbVxuICB0aGlzLncgPSAxMDE7IC8vIHdpZHRoIG9mIGl0ZW1cbiAgdGhpcy5yYW5PdmVyID0gMDsgLy8gaWYgdGhlIGl0ZW0gZ2V0cyBoaXQgYnkgYW4gZW5lbXlcbn1cblxuLy8gRHJhd3MgYW4gSXRlbSBvbiB0aGUgc2NyZWVuXG5JdGVtLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgY3R4LmRyYXdJbWFnZShSZXNvdXJjZXMuZ2V0KHRoaXMuc3ByaXRlKSwgdGhpcy54ICogY29sV2lkdGgsIHRoaXMueSAqIHJvd0hlaWdodCAtIG9mZnNldFkpO1xufVxuXG4vLyBVcGRhdGUgdGhlIGl0ZW0ncyBwb3N0aW9uIGJhc2VkIG9uIHBsYXllcidzIG1vdmVtZW50c1xuSXRlbS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwcmV2WCA9IHRoaXMueDtcbiAgdmFyIHByZXZZID0gdGhpcy55O1xuXG4gIC8vIElmIHRoZSBwbGF5ZXIgaXMgaGl0IHdoaWxlIGluZGllYm94IGl0ZW0gaXMgY29sbGVjdGVkXG4gIC8vIHNldCB0aGUgaXRlbSBiYWNrIG9uIGEgcmFuZG9tIGxvY2F0aW9uLlxuICBpZihoaXQgJiYgdGhpcy5jb2xsZWN0ZWQgJiYgdGhpcy50eXBlID09PSAnaW5kaWVib3gnKSB7XG4gICAgdGhpcy5jb2xsZWN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnggPSBnZXRSYW5kb21JbnQoMCwgNSk7XG4gICAgdGhpcy55ID0gZ2V0UmFuZG9tSW50KDEsIDQpO1xuICB9XG5cbiAgaWYocGxheWVyLmNvbGxlY3RzKHRoaXMpKSB7XG4gICAgdGhpcy5jb2xsZWN0ZWQgPSB0cnVlO1xuICB9XG5cbiAgaWYodGhpcy5jb2xsZWN0ZWQpIHtcblxuICAgIHN3aXRjaCh0aGlzLnR5cGUpIHtcbiAgICAgIGNhc2UgJ2luZGllYm94JzpcbiAgICAgICAgLy8gQm94IGNvbGxlY3RlZCwgc28gZm9sbG93IHRoZSBwbGF5ZXJzIG1vdmVtZW50c1xuICAgICAgICB0aGlzLnggPSBwbGF5ZXIueDtcbiAgICAgICAgdGhpcy55ID0gcGxheWVyLnk7XG4gICAgICAgIC8vIElmIHRoZSBpdGVtIGdldHMgdG8gdGhlIGdvYWwgaXQncyBkZWxpdmVyZWQgc28gcmVzZXQgaXQuXG4gICAgICAgIGlmKHBsYXllci5yZWFjaGVzR29hbCh0aGlzKSkge1xuICAgICAgICAgIHBsYXllci5kZWxpdmVyaWVzLnB1c2goe1xuICAgICAgICAgICAgJ3RpbWUnIDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICd4JyA6IHRoaXMueCxcbiAgICAgICAgICAgICd5JyA6IHRoaXMueVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHN3aXRjaCAodGhpcy5yYW5PdmVyKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIHBvaW50cyArPSAxMDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICBwb2ludHMgKz0gNTA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICBwb2ludHMgKz0gMjU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9pbnRzXCIpLmlubmVySFRNTCA9IHBvaW50cztcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJveGVzX3NhdmVkXCIpLmlubmVySFRNTCA9IHBsYXllci5kZWxpdmVyaWVzLmxlbmd0aDtcbiAgICAgICAgICB0aGlzLmNvbGxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgIGdvYWxSZWFjaGVkID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLnJhbk92ZXIgPSAwO1xuICAgICAgICAgIHRoaXMueCA9IGdldFJhbmRvbUludCgwLCA1KTtcbiAgICAgICAgICB0aGlzLnkgPSBnZXRSYW5kb21JbnQoMSwgNCk7XG5cbiAgICAgICAgICAvLyBNb3ZlIHRoZSBvYnN0aWNsZSB0byBhIG5ldyBsb2NhdGlvblxuICAgICAgICAgIGFsbFJvY2tzLmZvckVhY2goZnVuY3Rpb24ocm9jaykge1xuICAgICAgICAgICAgcm9jay54ID0gZ2V0UmFuZG9tSW50KDAsIDUpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdoZWFydCc6XG4gICAgICAgIC8vIEdhaW4gYSBsaWZlIGFuZCByZW1vdmUgaGVhcnQgZnJvbSBjYW52YXNcbiAgICAgICAgdGhpcy5jb2xsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgcGxheWVyLmxpdmVzICs9IDE7XG4gICAgICAgIHBvaW50cyArPSA1MDtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsaXZlc1wiKS5pbm5lckhUTUwgPSBwbGF5ZXIubGl2ZXM7XG4gICAgICAgIHRoaXMueCA9IDEwMDtcbiAgICAgICAgdGhpcy55ID0gMTAwO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmKHRoaXMudHlwZSA9PT0gJ2luZGllYm94Jykge1xuICAgIHN3aXRjaCh0aGlzLnJhbk92ZXIpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgLy8gZmlyc3QgaGl0XG4gICAgICAgIHRoaXMuc3ByaXRlID0gJ2Fzc2V0cy9pbWcvZ2VtLWdyZWVuLnBuZyc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICAvLyBzZWNvbmQgaGl0XG4gICAgICAgIHRoaXMuc3ByaXRlID0gJ2Fzc2V0cy9pbWcvZ2VtLW9yYW5nZS5wbmcnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgLy8gVGhpcmQgaGl0LCBkZXN0cm95IGl0IGFuZCBsb2cgaXQuXG4gICAgICAgIGJveGVzTG9zdC5wdXNoKHtcbiAgICAgICAgICAndGltZScgOiBEYXRlLm5vdygpLFxuICAgICAgICAgICd4JyA6IHRoaXMueCxcbiAgICAgICAgICAneScgOiB0aGlzLnlcbiAgICAgICAgfSk7XG4gICAgICAgIHBvaW50cyAtPSA1MDtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb2ludHNcIikuaW5uZXJIVE1MID0gcG9pbnRzO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJveGVzX2xvc3RcIikuaW5uZXJIVE1MID0gYm94ZXNMb3N0Lmxlbmd0aDtcbiAgICAgICAgdGhpcy5zcHJpdGUgPSAnYXNzZXRzL2ltZy9nZW0tYmx1ZS5wbmcnO1xuICAgICAgICB0aGlzLnggPSBnZXRSYW5kb21JbnQoMCwgNSk7XG4gICAgICAgIHRoaXMueSA9IGdldFJhbmRvbUludCgxLCA0KTtcbiAgICAgICAgdGhpcy5yYW5PdmVyID0gMDtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgYWxsRW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uKGVuZW15KSB7XG4gICAgICAgICAgZW5lbXkuaGl0Qm94ID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRoaXMuc3ByaXRlID0gJ2Fzc2V0cy9pbWcvZ2VtLWJsdWUucG5nJztcbiAgICB9XG4gIH1cblxuICBpZih0aGlzLnR5cGUgPT09ICdoZWFydCcgJiYgZ2FtZVNlY29uZHMgJSAzMCA9PT0gMCkge1xuICAgIHRoaXMueCA9IGhlYXJ0WDtcbiAgICB0aGlzLnkgPSBoZWFydFk7XG4gIH1cbiAgaWYodGhpcy50eXBlID09PSAnaGVhcnQnICYmIGdhbWVTZWNvbmRzICUgOSA9PT0gMCkge1xuICAgIHRoaXMueCA9IDEwMDtcbiAgICB0aGlzLnkgPSAxMDA7XG4gICAgaGVhcnRYPSBnZXRSYW5kb21JbnQoMCwgNSk7XG4gICAgaGVhcnRZID0gZ2V0UmFuZG9tSW50RXhjbHVkZSgxLCA1LCA0KTtcbiAgfVxufVxuXG52YXIgR29hbCA9IGZ1bmN0aW9uKGltYWdlKSB7XG4gIHRoaXMuc3ByaXRlID0gaW1hZ2U7XG4gIHRoaXMueCA9IGdldFJhbmRvbUludCgwLCA1KTtcbiAgdGhpcy55ID0gMDsgLy8gYWx3YXlzIHRoZSB0b3AgbGFuZVxufVxuXG5Hb2FsLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgaWYoZ29hbFJlYWNoZWQpIHtcbiAgICBjb25zb2xlLmxvZygnQm94IERlbGl2ZXJlZCEnKTtcbiAgICBnb2FsUmVhY2hlZCA9IGZhbHNlO1xuICAgIHRoaXMueCA9IGdldFJhbmRvbUludCgwLCA1KTtcbiAgfVxufVxuXG5Hb2FsLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgY3R4LmRyYXdJbWFnZShSZXNvdXJjZXMuZ2V0KHRoaXMuc3ByaXRlKSwgdGhpcy54ICogY29sV2lkdGgsIHRoaXMueSAqIHJvd0hlaWdodCAtIG9mZnNldFkpO1xufVxuXG4vLyBDcmVhdGUgcGxheWVyIGNsYXNzXG52YXIgUGxheWVyID0gZnVuY3Rpb24oaW1hZ2UpIHtcbiAgLy8gU2V0dXAgdXJsIGZvciBwbGF5ZXIgc3ByaXRcbiAgdGhpcy5zcHJpdGUgPSBpbWFnZTtcbiAgdGhpcy54ID0gMjtcbiAgdGhpcy55ID0gNTtcbiAgdGhpcy5tb3ZlWCA9IDI7IC8vIHRoZSBuZXh0IFggbW92ZW1lbnRcbiAgdGhpcy5tb3ZlWSA9IDU7IC8vIHRoZSBuZXh0IFkgbW92ZW1lbnRcbiAgdGhpcy5tb3ZlRGlyZWN0aW9uID0gJyc7IC8vIHRoZSBtb3ZlbWVudCBkaXJlY3Rpb24gZnJvbSB1c2VyIGlucHV0XG4gIHRoaXMuaCA9IDExNzsgLy8gaGVpZ2h0IG9mIHBsYXllclxuICB0aGlzLncgPSAxMDE7IC8vIHdpZHRoIG9mIHBsYXllclxuICB0aGlzLm1vdmVTcGVlZCA9IDU7IC8vIGVkaXQgdGhpcyB0byBtYWtlIGNoYXJhY3RlciBtb3ZlIGZhc3RlciwgbWF4IHNwZWVkIGlzIDEwLlxuICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICB0aGlzLm1vdmVtZW50cyA9IFtdO1xuICB0aGlzLmRlbGl2ZXJpZXMgPSBbXTtcbiAgdGhpcy5saXZlcyA9IDM7XG4gIHRoaXMubGV2ZWwgPSAxO1xufVxuXG5QbGF5ZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGR0KSB7XG4gIC8vIENoZWNrIGRpZmZlcmVuY2Ugb2YgbW92ZSBkZXN0aW5hdGlvbiBhbmQgZW5zdXJlIGRpcmVjdGlvbiBtYXggYmVmb3JlIGNoYW5naW5nXG4gIC8vIGJvYXJkIGNvb3JkaW5hdGVzIHRvIGF2b2lkIGdpdHRlciBpbiBtb3ZlbWVudC5cbiAgaWYodGhpcy5tb3ZpbmcgJiYgIWhpdCkge1xuICAgIC8vIE1vdmluZyBsZWZ0XG4gICAgaWYodGhpcy54ID4gdGhpcy5tb3ZlWCAmJiB0aGlzLm1vdmVEaXJlY3Rpb24gPT09ICdsZWZ0Jykge1xuICAgICAgdmFyIG5ld1ggPSB0aGlzLnggLSAoZHQgKiB0aGlzLm1vdmVTcGVlZCk7XG4gICAgICB0aGlzLnggPSBuZXdYIDwgdGhpcy5tb3ZlWCA/IHRoaXMubW92ZVggOiBuZXdYO1xuICAgIC8vIE1vdmluZyByaWdodFxuICAgIH0gZWxzZSBpZih0aGlzLnggPCB0aGlzLm1vdmVYICYmIHRoaXMubW92ZURpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xuICAgICAgdmFyIG5ld1ggPSB0aGlzLnggKyAoZHQgKiB0aGlzLm1vdmVTcGVlZCk7XG4gICAgICB0aGlzLnggPSBuZXdYID4gdGhpcy5tb3ZlWCA/IHRoaXMubW92ZVggOiBuZXdYO1xuICAgIC8vIE1vdmluZyB1cFxuICAgIH0gZWxzZSBpZih0aGlzLnkgPiB0aGlzLm1vdmVZICYmIHRoaXMubW92ZURpcmVjdGlvbiA9PT0gJ3VwJykge1xuICAgICAgdmFyIG5ld1kgPSB0aGlzLnkgLSAoZHQgKiB0aGlzLm1vdmVTcGVlZCk7XG4gICAgICB0aGlzLnkgPSBuZXdZIDwgdGhpcy5tb3ZlWSA/IHRoaXMubW92ZVkgOiBuZXdZO1xuICAgIC8vIE1vdmluZyBkb3duXG4gICAgfSBlbHNlIGlmKHRoaXMueSA8IHRoaXMubW92ZVkgJiYgdGhpcy5tb3ZlRGlyZWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgIHZhciBuZXdZID0gdGhpcy55ICsgKGR0ICogdGhpcy5tb3ZlU3BlZWQpO1xuICAgICAgdGhpcy55ID0gbmV3WSA+IHRoaXMubW92ZVkgPyB0aGlzLm1vdmVZIDogbmV3WTtcbiAgICAvLyBOb3QgbW92aW5nXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgICAvLyBJbnN1cmUgaW50ZWdlciB2YWx1ZXNcbiAgICAgIHRoaXMueCA9IE1hdGgucm91bmQodGhpcy54KTtcbiAgICAgIHRoaXMueSA9IE1hdGgucm91bmQodGhpcy55KTtcbiAgICAgIGNvbnNvbGUubG9nKCdQbGF5ZXIgWDogJywgdGhpcy54LCAnUGxheWVyIFk6ICcsIHRoaXMueSwgJ0RpcmVjdGlvbjogJywgdGhpcy5tb3ZlRGlyZWN0aW9uKTtcbiAgICB9XG5cbiAgfVxuICBpZihoaXQpe1xuICAgIC8vIFJlZHVjZSBhIGxpZmUgaWYgcGxheWVyIGhhcyBhbnkgbGVmdCBvciBnYW1lb3ZlclxuICAgIGlmKHRoaXMubGl2ZXMgPiAxKSB7XG4gICAgICB0aGlzLmxpdmVzIC09IDE7XG4gICAgICB0aGlzLnggPSBnZXRSYW5kb21JbnQoMSwgNCk7XG4gICAgICB0aGlzLnkgPSA1O1xuICAgICAgdGhpcy5tb3ZlWCA9IHRoaXMueDtcbiAgICAgIHRoaXMubW92ZVkgPSB0aGlzLnk7XG4gICAgICBoaXQgPSBmYWxzZTtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGl2ZXNcIikuaW5uZXJIVE1MID0gcGxheWVyLmxpdmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBoaXQgPSBmYWxzZTtcbiAgICAgIHRoaXMueCA9IDI7XG4gICAgICB0aGlzLnkgPSA1O1xuICAgICAgdGhpcy5tb3ZlWCA9IHRoaXMueDtcbiAgICAgIHRoaXMubW92ZVkgPSB0aGlzLnk7XG4gICAgICBjb25zb2xlLmxvZygnR0FNRSBPVkVSJyk7XG4gICAgICB0aGlzLmxpdmVzID0gMztcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGl2ZXNcIikuaW5uZXJIVE1MID0gcGxheWVyLmxpdmVzO1xuICAgICAgZ2FtZU92ZXIgPSB0cnVlO1xuICAgICAgLy8gZG8gYSByZXNldCBoZXJlLlxuICAgICAgYm94LnJhbk92ZXIgPSAwO1xuICAgICAgYm94LnggPSBnZXRSYW5kb21JbnQoMCwgNSk7XG4gICAgICBib3gueSA9IGdldFJhbmRvbUludCgxLCA0KTtcbiAgICB9XG4gIH1cbiAgdGhpcy5jaGVja0xldmVsKCk7XG59XG5cblBsYXllci5wcm90b3R5cGUuY2hlY2tMZXZlbCA9IGZ1bmN0aW9uKCkge1xuXG4gIGlmIChwb2ludHMgPCAxMDAwKSB7XG4gICAgdGhpcy5sZXZlbCA9IDE7XG4gIH0gZWxzZSBpZiAocG9pbnRzIDwgMjAwMCkge1xuICAgIHRoaXMubGV2ZWwgPSAyO1xuICAgIHRoaXMubW92ZVNwZWVkID0gNjtcbiAgfSBlbHNlIGlmIChwb2ludHMgPCAzMDAwKSB7XG4gICAgdGhpcy5sZXZlbCA9IDM7XG4gICAgdGhpcy5tb3ZlU3BlZWQgPSA3O1xuICB9IGVsc2UgaWYgKHBvaW50cyA8IDQwMDApIHtcbiAgICB0aGlzLmxldmVsID0gNDtcbiAgICB0aGlzLm1vdmVTcGVlZCA9IDg7XG4gIH0gZWxzZSBpZiAocG9pbnRzIDwgNTAwMCkge1xuICAgIHRoaXMubGV2ZWwgPSA1O1xuICAgIHRoaXMubW92ZVNwZWVkID0gOTtcbiAgfSBlbHNlIGlmIChwb2ludHMgPCA2MDAwKSB7XG4gICAgdGhpcy5sZXZlbCA9IDY7XG4gICAgdGhpcy5tb3ZlU3BlZWQgPSAxMDtcbiAgfSBlbHNlIGlmIChwb2ludHMgPCA3MDAwKSB7XG4gICAgdGhpcy5sZXZlbCA9IDc7XG4gICAgdGhpcy5tb3ZlU3BlZWQgPSAxMTtcbiAgfSBlbHNlIGlmIChwb2ludHMgPCA4MDAwKSB7XG4gICAgdGhpcy5sZXZlbCA9IDg7XG4gICAgdGhpcy5tb3ZlU3BlZWQgPSAxMjtcbiAgfSBlbHNlIGlmIChwb2ludHMgPCA5MDAwKSB7XG4gICAgdGhpcy5sZXZlbCA9IDk7XG4gICAgdGhpcy5tb3ZlU3BlZWQgPSAxMztcbiAgfSBlbHNlIGlmIChwb2ludHMgPCAxMDAwMCkge1xuICAgIHRoaXMubGV2ZWwgPSAxMDtcbiAgICB0aGlzLm1vdmVTcGVlZCA9IDE0O1xuICB9XG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZXZlbFwiKS5pbm5lckhUTUwgPSB0aGlzLmxldmVsO1xufVxuXG4vLyBEcmF3IHRoZSBwbGF5ZXIgb24gdGhlIGNhbnZhc1xuUGxheWVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgY3R4LmRyYXdJbWFnZShSZXNvdXJjZXMuZ2V0KHRoaXMuc3ByaXRlKSwgdGhpcy54ICogY29sV2lkdGgsIHRoaXMueSAqIHJvd0hlaWdodCAtIG9mZnNldFkpO1xufVxuXG4vLyBDaGVja3MgdG8gc2VlIGFuIGVuZW15IGludGVyc2VjdCB3aXRoIHRoZSBwbGF5ZXJcblBsYXllci5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGVuZW15KSB7XG4gICAgdmFyIGludGVyc2VjdHMgPSBmYWxzZTtcbiAgICBpZihlbmVteS55ID09PSB0aGlzLnkgKXtcbiAgICAgIGlmKCBlbmVteS54ID4gKHRoaXMueCAtIC41KSAmJiBlbmVteS54IDwgKHRoaXMueCArIC41KSApIHtcbiAgICAgICAgaW50ZXJzZWN0cyA9IHRydWU7XG4gICAgICAgIGNvbnNvbGUubG9nKCdISVQhIEVuZW15IFg6ICcgKyBlbmVteS54KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGludGVyc2VjdHM7XG59XG5cbi8vIENoZWNrIHRvIHNlZSBpZiB0aGUgcGxheWVyIGludGVyc2VjdHMgd2l0aCBhbiBpdGVtXG5QbGF5ZXIucHJvdG90eXBlLmNvbGxlY3RzID0gZnVuY3Rpb24oaXRlbSkge1xuICBpZihpdGVtLnggPT09IHRoaXMueCAmJiBpdGVtLnkgPT09IHRoaXMueSl7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8vIENoZWNrIGlmIHRoZSBwbGF5ZXIgZGVsaXZlcnMgYSBib3hcblBsYXllci5wcm90b3R5cGUucmVhY2hlc0dvYWwgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGlmKGl0ZW0ueCA9PT0gZ29hbC54ICYmIGl0ZW0ueSA9PT0gZ29hbC55KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8vIEhhbmRsZSBrZXlib2FyZCBpbnB1dCBmb3IgcGxheWVyIGFjdGlvbnNcblBsYXllci5wcm90b3R5cGUuaGFuZGxlSW5wdXQgPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gIHZhciB0aGlzWCA9IHRoaXMueDtcbiAgdmFyIHRoaXNZID0gdGhpcy55O1xuICB2YXIgb2JzdHJ1Y3RlZCA9IGZhbHNlO1xuICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIC8vIENoZWNrIHJvY2tzIHRvIHNlZSBpZiB0aGV5IG9ic3RydWN0IHBsYXllciBtb3ZlbWVudFxuICAgICAgYWxsUm9ja3MuZm9yRWFjaChmdW5jdGlvbihyb2NrKSB7XG4gICAgICAgIGlmKCByb2NrLnkgPT09IHRoaXNZICkge1xuICAgICAgICAgIGlmKCByb2NrLnggPT09ICh0aGlzWCAtIDEpICl7XG4gICAgICAgICAgICBvYnN0cnVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYoIW9ic3RydWN0ZWQgJiYgdGhpcy54ID4gMCAmJiAhdGhpcy5tb3ZpbmcpIHtcbiAgICAgICAgdGhpcy5tb3ZlRGlyZWN0aW9uID0gJ2xlZnQnO1xuICAgICAgICB0aGlzLm1vdmluZyA9IHRydWU7XG4gICAgICAgIHRoaXMubW92ZVggLT0gMTtcbiAgICAgICAgLy8gSWYgcGxheWVyIG1vdmVkIGxvZyBpdFxuICAgICAgICB0aGlzLm1vdmVtZW50cy5wdXNoKHtcbiAgICAgICAgICAna2V5Q29kZSc6IGtleUNvZGUsXG4gICAgICAgICAgJ3RpbWUnIDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAneCcgOiB0aGlzLm1vdmVYLFxuICAgICAgICAgICd5JyA6IHRoaXMueVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3VwJzpcbiAgICAgIGFsbFJvY2tzLmZvckVhY2goZnVuY3Rpb24ocm9jaykge1xuICAgICAgICBpZiggcm9jay54ID09PSB0aGlzWCApIHtcbiAgICAgICAgICBpZiggcm9jay55ID09PSAodGhpc1kgLSAxKSApe1xuICAgICAgICAgICAgb2JzdHJ1Y3RlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmKCFvYnN0cnVjdGVkICYmIHRoaXMueSA+IDAgJiYgIXRoaXMubW92aW5nKSB7XG4gICAgICAgIHRoaXMubW92ZURpcmVjdGlvbiA9ICd1cCc7XG4gICAgICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5tb3ZlWSAtPSAxO1xuICAgICAgICB0aGlzLm1vdmVtZW50cy5wdXNoKHtcbiAgICAgICAgICAna2V5Q29kZSc6IGtleUNvZGUsXG4gICAgICAgICAgJ3RpbWUnIDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAneCcgOiB0aGlzLngsXG4gICAgICAgICAgJ3knIDogdGhpcy55XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgYWxsUm9ja3MuZm9yRWFjaChmdW5jdGlvbihyb2NrKSB7XG4gICAgICAgIGlmKCByb2NrLnkgPT09IHRoaXNZICkge1xuICAgICAgICAgIGlmKCByb2NrLnggPT09ICh0aGlzWCArIDEpICl7XG4gICAgICAgICAgICBvYnN0cnVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYoIW9ic3RydWN0ZWQgJiYgdGhpcy54IDwgNCAmJiAhdGhpcy5tb3ZpbmcpIHtcbiAgICAgICAgdGhpcy5tb3ZlRGlyZWN0aW9uID0gJ3JpZ2h0JztcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLm1vdmVYICs9IDE7XG4gICAgICAgIHRoaXMubW92ZW1lbnRzLnB1c2goe1xuICAgICAgICAgICdrZXlDb2RlJzoga2V5Q29kZSxcbiAgICAgICAgICAndGltZScgOiBEYXRlLm5vdygpLFxuICAgICAgICAgICd4JyA6IHRoaXMubW92ZVgsXG4gICAgICAgICAgJ3knIDogdGhpcy55XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZG93bic6XG4gICAgICBhbGxSb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uKHJvY2spIHtcbiAgICAgICAgaWYoIHJvY2sueCA9PT0gdGhpc1ggKSB7XG4gICAgICAgICAgaWYoIHJvY2sueSA9PT0gKHRoaXNZICsgMSkgKXtcbiAgICAgICAgICAgIG9ic3RydWN0ZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZighb2JzdHJ1Y3RlZCAmJiB0aGlzLnkgPCA1ICYmICF0aGlzLm1vdmluZykge1xuICAgICAgICB0aGlzLm1vdmVEaXJlY3Rpb24gPSAnZG93bic7XG4gICAgICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5tb3ZlWSArPSAxO1xuICAgICAgICB0aGlzLm1vdmVtZW50cy5wdXNoKHtcbiAgICAgICAgICAna2V5Q29kZSc6IGtleUNvZGUsXG4gICAgICAgICAgJ3RpbWUnIDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAneCcgOiB0aGlzLngsXG4gICAgICAgICAgJ3knIDogdGhpcy55XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuLy8gUm9jayBvYmplY3QgdGhhdCBjYW4ndCBiZSBtb3ZlZCBvbiBieSBwbGF5ZXJcbnZhciBSb2NrID0gZnVuY3Rpb24oaW1hZ2UpIHtcbiAgdGhpcy5zcHJpdGUgPSBpbWFnZTtcbiAgdGhpcy54ID0gZ2V0UmFuZG9tSW50KDAsIDUpO1xuICB0aGlzLnkgPSA0O1xufVxuXG5Sb2NrLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgY3R4LmRyYXdJbWFnZShSZXNvdXJjZXMuZ2V0KHRoaXMuc3ByaXRlKSwgdGhpcy54ICogY29sV2lkdGgsIHRoaXMueSAqIHJvd0hlaWdodCAtIG9mZnNldFkpO1xufVxuXG4vLyBJbnN0YW50aWF0ZSBnYW1lIG9iamVjdHNcbnZhciBhbGxFbmVtaWVzID0gWyBuZXcgRW5lbXkoMSwgJ2Fzc2V0cy9pbWcvZW5lbXktYnVnLnBuZycpLFxuICAgICAgICAgICAgICAgIG5ldyBFbmVteSgyLCAnYXNzZXRzL2ltZy9lbmVteS1idWcucG5nJyksXG4gICAgICAgICAgICAgICAgbmV3IEVuZW15KDIsICdhc3NldHMvaW1nL2VuZW15LWJ1Zy5wbmcnKSxcbiAgICAgICAgICAgICAgICBuZXcgRW5lbXkoNCwgJ2Fzc2V0cy9pbWcvZW5lbXktYnVnLnBuZycpLFxuICAgICAgICAgICAgICAgIG5ldyBFbmVteSg0LCAnYXNzZXRzL2ltZy9lbmVteS1idWcucG5nJyldLFxuICAgIGFsbFJvY2tzID0gW25ldyBSb2NrKCdhc3NldHMvaW1nL3JvY2sucG5nJyldLFxuICAgIHBsYXllciA9IG5ldyBQbGF5ZXIoJ2Fzc2V0cy9pbWcvY2hhci1ib3kucG5nJyksXG4gICAgYm94ID0gbmV3IEl0ZW0oJ2Fzc2V0cy9pbWcvZ2VtLWJsdWUucG5nJywgJ2luZGllYm94JyksXG4gICAgZ29hbCA9IG5ldyBHb2FsKCdhc3NldHMvaW1nL3N0YXIucG5nJyksXG4gICAgaGVhcnQgPSBuZXcgSXRlbSgnYXNzZXRzL2ltZy9oZWFydC5wbmcnLCAnaGVhcnQnKTtcblxuXG4vLyBMaXN0ZW4gZm9yIGtleSBwcmVzc2VzIGFuZCBzZW5kcyB0aGUga2V5cyB0byBQbGF5ZXIuaGFuZGxlSW5wdXQoKVxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGFsbG93ZWRLZXlzID0ge1xuICAgICAgICAzNzogJ2xlZnQnLFxuICAgICAgICAzODogJ3VwJyxcbiAgICAgICAgMzk6ICdyaWdodCcsXG4gICAgICAgIDQwOiAnZG93bidcbiAgICB9O1xuICAgIHBsYXllci5oYW5kbGVJbnB1dChhbGxvd2VkS2V5c1tlLmtleUNvZGVdKTtcbn0pO1xuIl19
