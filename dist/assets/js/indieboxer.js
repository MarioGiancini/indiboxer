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
        var h = addZero(new Date(lastTime).getHours() - new Date(startTime).getHours());
        var m = addZero(new Date(lastTime - startTime).getMinutes());
        var s = addZero(new Date(lastTime - startTime).getSeconds());
        var x = document.getElementById("timer");
        x.innerHTML = '<span id="hours">' + h + '<span class="time-colon">:</span>' +
                      '<span id="minutes">' + m + '<span class="time-colon">:</span>' +
                      '<span id="seconds">' + s + '</span>';
        gameMinutes = m;
        gameSeconds = s;
        gameHours = h;
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
  this.enemies = [];
  this.speed = 0;
  this.hasItem = false;
}

var GoalLane = function() {
  this.goals = [];
}

var StartLane = function() {
  this.starts = [];
}

var boardLanes = [new GoalLane, new EnemyLane(), new EnemyLane(), new EnemyLane(), new StartLane(), new StartLane()];

// Enemies our player must avoid
var Enemy = function(speed, respawn) {

    // image url
    this.sprite = 'assets/img/enemy-bug.png';

    // Integer for how fast the enemy travels, max speed 3
    this.speed = speed;

    // Respawn X value so enemies spawn on each other
    this.respawn = respawn;

    // Start the enemy randomly off the board a ways
    this.x = -getRandomInt(1, 8);

    // Select a random row between the second and forth
    this.y = getRandomInt(1, 4);

    // set when the enemy is visable
    this.visable = false;

    // set when the enemy runs over an item
    this.hitBox = false;

    this.laneOrder = 0;

};

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // Move the enemy across the row
    this.x = this.x + dt * this.speed;

    // If the enemy x is greater than zero it's visable
    if(this.x > 0 && this.visable === false) {
      this.visable = true;
    } else if(this.x >= 5 && this.visable === true) {
      // If the enemy x is greater than 5 is not visable on the board
      // Redraw enemy off canvas and set visable to false
      this.visable = false;
      this.x = this.respawn;
      this.y = getRandomInt(1, 4);
      this.speed = getRandomInt(1, 4);
      this.hitBox = false;
    } else {
      // Have enemies stop right behind an enemy if they are going faster than
      // the one ahead of them.
      var enemyX = this.x;
      var enemyY = this.y;
      var enemySpeed = this.speed;
      var newSpeed = 0;

      allEnemies.forEach(function(enemy) {
        if(enemy.y === enemyY) {
          if(enemyX <= (enemy.x + 1) && enemy.speed < enemySpeed) {
            newSpeed = enemy.speed;
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
var allEnemies = [ new Enemy(1, -1), new Enemy(2, -2), new Enemy(2, -3), new Enemy(4, -4), new Enemy(4, -5)],
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc291cmNlcy5qcyIsImVuZ2luZS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiaW5kaWVib3hlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIFJlc291cmNlcy5qc1xuICogVGhpcyBpcyBzaW1wbHkgYW4gaW1hZ2UgbG9hZGluZyB1dGlsaXR5LiBJdCBlYXNlcyB0aGUgcHJvY2VzcyBvZiBsb2FkaW5nXG4gKiBpbWFnZSBmaWxlcyBzbyB0aGF0IHRoZXkgY2FuIGJlIHVzZWQgd2l0aGluIHlvdXIgZ2FtZS4gSXQgYWxzbyBpbmNsdWRlc1xuICogYSBzaW1wbGUgXCJjYWNoaW5nXCIgbGF5ZXIgc28gaXQgd2lsbCByZXVzZSBjYWNoZWQgaW1hZ2VzIGlmIHlvdSBhdHRlbXB0XG4gKiB0byBsb2FkIHRoZSBzYW1lIGltYWdlIG11bHRpcGxlIHRpbWVzLiBcbiAqL1xuKGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNvdXJjZUNhY2hlID0ge307XG4gICAgdmFyIGxvYWRpbmcgPSBbXTtcbiAgICB2YXIgcmVhZHlDYWxsYmFja3MgPSBbXTtcblxuICAgIC8qIFRoaXMgaXMgdGhlIHB1YmxpY2x5IGFjY2Vzc2libGUgaW1hZ2UgbG9hZGluZyBmdW5jdGlvbi4gSXQgYWNjZXB0c1xuICAgICAqIGFuIGFycmF5IG9mIHN0cmluZ3MgcG9pbnRpbmcgdG8gaW1hZ2UgZmlsZXMgb3IgYSBzdHJpbmcgZm9yIGEgc2luZ2xlXG4gICAgICogaW1hZ2UuIEl0IHdpbGwgdGhlbiBjYWxsIG91ciBwcml2YXRlIGltYWdlIGxvYWRpbmcgZnVuY3Rpb24gYWNjb3JkaW5nbHkuXG4gICAgICovXG4gICAgZnVuY3Rpb24gbG9hZCh1cmxPckFycikge1xuICAgICAgICBpZih1cmxPckFyciBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAvKiBJZiB0aGUgZGV2ZWxvcGVyIHBhc3NlZCBpbiBhbiBhcnJheSBvZiBpbWFnZXNcbiAgICAgICAgICAgICAqIGxvb3AgdGhyb3VnaCBlYWNoIHZhbHVlIGFuZCBjYWxsIG91ciBpbWFnZVxuICAgICAgICAgICAgICogbG9hZGVyIG9uIHRoYXQgaW1hZ2UgZmlsZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB1cmxPckFyci5mb3JFYWNoKGZ1bmN0aW9uKHVybCkge1xuICAgICAgICAgICAgICAgIF9sb2FkKHVybCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8qIFRoZSBkZXZlbG9wZXIgZGlkIG5vdCBwYXNzIGFuIGFycmF5IHRvIHRoaXMgZnVuY3Rpb24sXG4gICAgICAgICAgICAgKiBhc3N1bWUgdGhlIHZhbHVlIGlzIGEgc3RyaW5nIGFuZCBjYWxsIG91ciBpbWFnZSBsb2FkZXJcbiAgICAgICAgICAgICAqIGRpcmVjdGx5LlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBfbG9hZCh1cmxPckFycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBUaGlzIGlzIG91ciBwcml2YXRlIGltYWdlIGxvYWRlciBmdW5jdGlvbiwgaXQgaXNcbiAgICAgKiBjYWxsZWQgYnkgdGhlIHB1YmxpYyBpbWFnZSBsb2FkZXIgZnVuY3Rpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gX2xvYWQodXJsKSB7XG4gICAgICAgIGlmKHJlc291cmNlQ2FjaGVbdXJsXSkge1xuICAgICAgICAgICAgLyogSWYgdGhpcyBVUkwgaGFzIGJlZW4gcHJldmlvdXNseSBsb2FkZWQgaXQgd2lsbCBleGlzdCB3aXRoaW5cbiAgICAgICAgICAgICAqIG91ciByZXNvdXJjZUNhY2hlIGFycmF5LiBKdXN0IHJldHVybiB0aGF0IGltYWdlIHJhdGhlclxuICAgICAgICAgICAgICogcmUtbG9hZGluZyB0aGUgaW1hZ2UuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiByZXNvdXJjZUNhY2hlW3VybF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvKiBUaGlzIFVSTCBoYXMgbm90IGJlZW4gcHJldmlvdXNseSBsb2FkZWQgYW5kIGlzIG5vdCBwcmVzZW50XG4gICAgICAgICAgICAgKiB3aXRoaW4gb3VyIGNhY2hlOyB3ZSdsbCBuZWVkIHRvIGxvYWQgdGhpcyBpbWFnZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIC8qIE9uY2Ugb3VyIGltYWdlIGhhcyBwcm9wZXJseSBsb2FkZWQsIGFkZCBpdCB0byBvdXIgY2FjaGVcbiAgICAgICAgICAgICAgICAgKiBzbyB0aGF0IHdlIGNhbiBzaW1wbHkgcmV0dXJuIHRoaXMgaW1hZ2UgaWYgdGhlIGRldmVsb3BlclxuICAgICAgICAgICAgICAgICAqIGF0dGVtcHRzIHRvIGxvYWQgdGhpcyBmaWxlIGluIHRoZSBmdXR1cmUuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VDYWNoZVt1cmxdID0gaW1nO1xuXG4gICAgICAgICAgICAgICAgLyogT25jZSB0aGUgaW1hZ2UgaXMgYWN0dWFsbHkgbG9hZGVkIGFuZCBwcm9wZXJseSBjYWNoZWQsXG4gICAgICAgICAgICAgICAgICogY2FsbCBhbGwgb2YgdGhlIG9uUmVhZHkoKSBjYWxsYmFja3Mgd2UgaGF2ZSBkZWZpbmVkLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmKGlzUmVhZHkoKSkge1xuICAgICAgICAgICAgICAgICAgICByZWFkeUNhbGxiYWNrcy5mb3JFYWNoKGZ1bmN0aW9uKGZ1bmMpIHsgZnVuYygpOyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvKiBTZXQgdGhlIGluaXRpYWwgY2FjaGUgdmFsdWUgdG8gZmFsc2UsIHRoaXMgd2lsbCBjaGFuZ2Ugd2hlblxuICAgICAgICAgICAgICogdGhlIGltYWdlJ3Mgb25sb2FkIGV2ZW50IGhhbmRsZXIgaXMgY2FsbGVkLiBGaW5hbGx5LCBwb2ludFxuICAgICAgICAgICAgICogdGhlIGltYWdlJ3Mgc3JjIGF0dHJpYnV0ZSB0byB0aGUgcGFzc2VkIGluIFVSTC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmVzb3VyY2VDYWNoZVt1cmxdID0gZmFsc2U7XG4gICAgICAgICAgICBpbWcuc3JjID0gdXJsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogVGhpcyBpcyB1c2VkIGJ5IGRldmVsb3BlcnMgdG8gZ3JhYiByZWZlcmVuY2VzIHRvIGltYWdlcyB0aGV5IGtub3dcbiAgICAgKiBoYXZlIGJlZW4gcHJldmlvdXNseSBsb2FkZWQuIElmIGFuIGltYWdlIGlzIGNhY2hlZCwgdGhpcyBmdW5jdGlvbnNcbiAgICAgKiB0aGUgc2FtZSBhcyBjYWxsaW5nIGxvYWQoKSBvbiB0aGF0IFVSTC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXQodXJsKSB7XG4gICAgICAgIHJldHVybiByZXNvdXJjZUNhY2hlW3VybF07XG4gICAgfVxuXG4gICAgLyogVGhpcyBmdW5jdGlvbiBkZXRlcm1pbmVzIGlmIGFsbCBvZiB0aGUgaW1hZ2VzIHRoYXQgaGF2ZSBiZWVuIHJlcXVlc3RlZFxuICAgICAqIGZvciBsb2FkaW5nIGhhdmUgaW4gZmFjdCBiZWVuIHByb3Blcmx5IGxvYWRlZC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc1JlYWR5KCkge1xuICAgICAgICB2YXIgcmVhZHkgPSB0cnVlO1xuICAgICAgICBmb3IodmFyIGsgaW4gcmVzb3VyY2VDYWNoZSkge1xuICAgICAgICAgICAgaWYocmVzb3VyY2VDYWNoZS5oYXNPd25Qcm9wZXJ0eShrKSAmJlxuICAgICAgICAgICAgICAgIXJlc291cmNlQ2FjaGVba10pIHtcbiAgICAgICAgICAgICAgICByZWFkeSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWFkeTtcbiAgICB9XG5cbiAgICAvKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYWRkIGEgZnVuY3Rpb24gdG8gdGhlIGNhbGxiYWNrIHN0YWNrIHRoYXQgaXMgY2FsbGVkXG4gICAgICogd2hlbiBhbGwgcmVxdWVzdGVkIGltYWdlcyBhcmUgcHJvcGVybHkgbG9hZGVkLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG9uUmVhZHkoZnVuYykge1xuICAgICAgICByZWFkeUNhbGxiYWNrcy5wdXNoKGZ1bmMpO1xuICAgIH1cblxuICAgIC8qIFRoaXMgb2JqZWN0IGRlZmluZXMgdGhlIHB1YmxpY2x5IGFjY2Vzc2libGUgZnVuY3Rpb25zIGF2YWlsYWJsZSB0b1xuICAgICAqIGRldmVsb3BlcnMgYnkgY3JlYXRpbmcgYSBnbG9iYWwgUmVzb3VyY2VzIG9iamVjdC5cbiAgICAgKi9cbiAgICB3aW5kb3cuUmVzb3VyY2VzID0ge1xuICAgICAgICBsb2FkOiBsb2FkLFxuICAgICAgICBnZXQ6IGdldCxcbiAgICAgICAgb25SZWFkeTogb25SZWFkeSxcbiAgICAgICAgaXNSZWFkeTogaXNSZWFkeVxuICAgIH07XG59KSgpO1xuXG4vLyBSZXR1cm4gYSByYW5kb20gSW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4XG5mdW5jdGlvbiBnZXRSYW5kb21JbnQobWluLCBtYXgpIHtcbiAgbWluID0gTWF0aC5jZWlsKG1pbik7XG4gIG1heCA9IE1hdGguZmxvb3IobWF4KTtcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbjtcbn1cblxuLy8gUmV0dXJucyBhIHJhbmRvbSBpbnRlZ2VyIGJldHdlZW4gbWluIChpbmNsdWRlZCkgYW5kIG1heCAoaW5jbHVkZWQpXG5mdW5jdGlvbiBnZXRSYW5kb21JbnRJbmNsdXNpdmUobWluLCBtYXgpIHtcbiAgbWluID0gTWF0aC5jZWlsKG1pbik7XG4gIG1heCA9IE1hdGguZmxvb3IobWF4KTtcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG59XG5cbi8vIFJldHVybnMgYSByYW5kb20gaW50ZWdlciBleGNsdWRpbmcgYSBwYXNzZWQgbnVtYmVyXG5mdW5jdGlvbiBnZXRSYW5kb21JbnRFeGNsdWRlKG1pbiwgbWF4LCBleGNsdWRlKSB7XG4gIG1pbiA9IE1hdGguY2VpbChtaW4pO1xuICBtYXggPSBNYXRoLmZsb29yKG1heCk7XG4gIHZhciByYW5kb20gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XG4gIC8vIElmIHRoZSByYW5kb20gbnVtYmVyIGVxdWFscyBleGNsdWRlIGFkZCBvciBzdWJ0cmFjdCB0byBpdCBiYXNlZCBvbiBtaW5cbiAgaWYocmFuZG9tID09PSBleGNsdWRlKSB7XG4gICAgaWYocmFuZG9tID4gbWluICkge1xuICAgICAgcmFuZG9tIC09IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJhbmRvbSArPSAxO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmFuZG9tO1xufVxuIiwiLypcbiAqIFRoaXMgcHJvdmlkZXMgdGhlIGdhbWUgbG9vcCBmdW5jdGlvbmFsaXR5ICh1cGRhdGUgZW50aXRpZXMgYW5kIHJlbmRlciksXG4gKiBkcmF3cyB0aGUgaW5pdGlhbCBnYW1lIGJvYXJkIG9uIHRoZSBzY3JlZW4sIGFuZCB0aGVuIGNhbGxzIHRoZSB1cGRhdGUgYW5kXG4gKiByZW5kZXIgbWV0aG9kcyBvbiB5b3VyIHBsYXllciBhbmQgZW5lbXkgb2JqZWN0cyAoZGVmaW5lZCBpbiB5b3VyIGFwcC5qcykuXG4gKlxuICogQSBnYW1lIGVuZ2luZSB3b3JrcyBieSBkcmF3aW5nIHRoZSBlbnRpcmUgZ2FtZSBzY3JlZW4gb3ZlciBhbmQgb3Zlciwga2luZCBvZlxuICogbGlrZSBhIGZsaXBib29rIHlvdSBtYXkgaGF2ZSBjcmVhdGVkIGFzIGEga2lkLiBXaGVuIHlvdXIgcGxheWVyIG1vdmVzIGFjcm9zc1xuICogdGhlIHNjcmVlbiwgaXQgbWF5IGxvb2sgbGlrZSBqdXN0IHRoYXQgaW1hZ2UvY2hhcmFjdGVyIGlzIG1vdmluZyBvciBiZWluZ1xuICogZHJhd24gYnV0IHRoYXQgaXMgbm90IHRoZSBjYXNlLiBXaGF0J3MgcmVhbGx5IGhhcHBlbmluZyBpcyB0aGUgZW50aXJlIFwic2NlbmVcIlxuICogaXMgYmVpbmcgZHJhd24gb3ZlciBhbmQgb3ZlciwgcHJlc2VudGluZyB0aGUgaWxsdXNpb24gb2YgYW5pbWF0aW9uLlxuICpcbiAqIFRoaXMgZW5naW5lIGlzIGF2YWlsYWJsZSBnbG9iYWxseSB2aWEgdGhlIEVuZ2luZSB2YXJpYWJsZSBhbmQgaXQgYWxzbyBtYWtlc1xuICogdGhlIGNhbnZhcycgY29udGV4dCAoY3R4KSBvYmplY3QgZ2xvYmFsbHkgYXZhaWxhYmxlIHRvIG1ha2Ugd3JpdGluZyBhcHAuanNcbiAqIGEgbGl0dGxlIHNpbXBsZXIgdG8gd29yayB3aXRoLlxuICovXG5cbnZhciBFbmdpbmUgPSAoZnVuY3Rpb24oKSB7XG4gICAgLyogUHJlZGVmaW5lIHRoZSB2YXJpYWJsZXMgd2UnbGwgYmUgdXNpbmcgd2l0aGluIHRoaXMgc2NvcGUsXG4gICAgICogY3JlYXRlIHRoZSBjYW52YXMgZWxlbWVudCwgZ3JhYiB0aGUgMkQgY29udGV4dCBmb3IgdGhhdCBjYW52YXNcbiAgICAgKiBzZXQgdGhlIGNhbnZhcyBlbGVtZW50cyBoZWlnaHQvd2lkdGggYW5kIGFkZCBpdCB0byB0aGUgRE9NLlxuICAgICAqL1xuICAgIHZhciAkZG9jID0gJChkb2N1bWVudCksXG4gICAgICAgICR3aW4gPSAkKHdpbmRvdyksXG4gICAgICAgICRjYW52YXMgPSAkKCc8Y2FudmFzIHdpZHRoPVwiNTA1XCIgaGVpZ2h0PVwiNjA2XCI+PC9jYW52YXM+JyksXG4gICAgICAgIGN0eCA9ICRjYW52YXNbMF0uZ2V0Q29udGV4dCgnMmQnKSxcbiAgICAgICAgc3RhcnQgPSBmYWxzZSxcbiAgICAgICAgbGFzdFRpbWU7XG5cbiAgICAkY2FudmFzLndpZHRoID0gNTA1O1xuICAgICRjYW52YXMuaGVpZ2h0ID0gNjA2O1xuICAgICQoJyNjYW52YXNfY29udGFpbmVyJykuYXBwZW5kKCRjYW52YXMpO1xuXG4gICAgLyogVGhpcyBmdW5jdGlvbiBzZXJ2ZXMgYXMgdGhlIGtpY2tvZmYgcG9pbnQgZm9yIHRoZSBnYW1lIGxvb3AgaXRzZWxmXG4gICAgICogYW5kIGhhbmRsZXMgcHJvcGVybHkgY2FsbGluZyB0aGUgdXBkYXRlIGFuZCByZW5kZXIgbWV0aG9kcy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtYWluKCkge1xuICAgICAgICAvKiBHZXQgb3VyIHRpbWUgZGVsdGEgaW5mb3JtYXRpb24gd2hpY2ggaXMgcmVxdWlyZWQgaWYgeW91ciBnYW1lXG4gICAgICAgICAqIHJlcXVpcmVzIHNtb290aCBhbmltYXRpb24uIEJlY2F1c2UgZXZlcnlvbmUncyBjb21wdXRlciBwcm9jZXNzZXNcbiAgICAgICAgICogaW5zdHJ1Y3Rpb25zIGF0IGRpZmZlcmVudCBzcGVlZHMgd2UgbmVlZCBhIGNvbnN0YW50IHZhbHVlIHRoYXRcbiAgICAgICAgICogd291bGQgYmUgdGhlIHNhbWUgZm9yIGV2ZXJ5b25lIChyZWdhcmRsZXNzIG9mIGhvdyBmYXN0IHRoZWlyXG4gICAgICAgICAqIGNvbXB1dGVyIGlzKSAtIGh1cnJheSB0aW1lIVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCksXG4gICAgICAgICAgICBkdCA9IChub3cgLSBsYXN0VGltZSkgLyAxMDAwLjA7XG5cbiAgICAgICAgLyogQ2FsbCBvdXIgdXBkYXRlL3JlbmRlciBmdW5jdGlvbnMsIHBhc3MgYWxvbmcgdGhlIHRpbWUgZGVsdGEgdG9cbiAgICAgICAgICogb3VyIHVwZGF0ZSBmdW5jdGlvbiBzaW5jZSBpdCBtYXkgYmUgdXNlZCBmb3Igc21vb3RoIGFuaW1hdGlvbi5cbiAgICAgICAgICovXG4gICAgICAgIGlmKHN0YXJ0KSB7XG4gICAgICAgICAgdXBkYXRlKGR0KTtcbiAgICAgICAgICByZW5kZXIoKTtcblxuICAgICAgICAgIC8qIFNldCBvdXIgbGFzdFRpbWUgdmFyaWFibGUgd2hpY2ggaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIHRpbWUgZGVsdGFcbiAgICAgICAgICAgKiBmb3IgdGhlIG5leHQgdGltZSB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZC5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICBsYXN0VGltZSA9IG5vdztcbiAgICAgICAgICB1cGRhdGVUaW1lcihsYXN0VGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZihnYW1lT3Zlcikge1xuICAgICAgICAgIHJlc2V0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBVc2UgdGhlIGJyb3dzZXIncyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgZnVuY3Rpb24gdG8gY2FsbCB0aGlzXG4gICAgICAgICAqIGZ1bmN0aW9uIGFnYWluIGFzIHNvb24gYXMgdGhlIGJyb3dzZXIgaXMgYWJsZSB0byBkcmF3IGFub3RoZXIgZnJhbWUuXG4gICAgICAgICAqL1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1haW4pO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgdGltZSBlbGFwc2VkXG4gICAgZnVuY3Rpb24gdXBkYXRlVGltZXIobGFzdFRpbWUpIHtcbiAgICAgICAgdmFyIGggPSBhZGRaZXJvKG5ldyBEYXRlKGxhc3RUaW1lKS5nZXRIb3VycygpIC0gbmV3IERhdGUoc3RhcnRUaW1lKS5nZXRIb3VycygpKTtcbiAgICAgICAgdmFyIG0gPSBhZGRaZXJvKG5ldyBEYXRlKGxhc3RUaW1lIC0gc3RhcnRUaW1lKS5nZXRNaW51dGVzKCkpO1xuICAgICAgICB2YXIgcyA9IGFkZFplcm8obmV3IERhdGUobGFzdFRpbWUgLSBzdGFydFRpbWUpLmdldFNlY29uZHMoKSk7XG4gICAgICAgIHZhciB4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aW1lclwiKTtcbiAgICAgICAgeC5pbm5lckhUTUwgPSAnPHNwYW4gaWQ9XCJob3Vyc1wiPicgKyBoICsgJzxzcGFuIGNsYXNzPVwidGltZS1jb2xvblwiPjo8L3NwYW4+JyArXG4gICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGlkPVwibWludXRlc1wiPicgKyBtICsgJzxzcGFuIGNsYXNzPVwidGltZS1jb2xvblwiPjo8L3NwYW4+JyArXG4gICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGlkPVwic2Vjb25kc1wiPicgKyBzICsgJzwvc3Bhbj4nO1xuICAgICAgICBnYW1lTWludXRlcyA9IG07XG4gICAgICAgIGdhbWVTZWNvbmRzID0gcztcbiAgICAgICAgZ2FtZUhvdXJzID0gaDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRaZXJvKGkpIHtcbiAgICAgIGlmIChpIDwgMTApIHtcbiAgICAgICAgICBpID0gXCIwXCIgKyBpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuXG4gICAgLyogVGhpcyBmdW5jdGlvbiBkb2VzIHNvbWUgaW5pdGlhbCBzZXR1cCB0aGF0IHNob3VsZCBvbmx5IG9jY3VyIG9uY2UsXG4gICAgICogcGFydGljdWxhcmx5IHNldHRpbmcgdGhlIGxhc3RUaW1lIHZhcmlhYmxlIHRoYXQgaXMgcmVxdWlyZWQgZm9yIHRoZVxuICAgICAqIGdhbWUgbG9vcC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICByZXNldCgpO1xuICAgICAgICBsYXN0VGltZSA9IERhdGUubm93KCk7XG4gICAgICAgIG1haW4oKTtcbiAgICB9XG5cbiAgICAvKiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBieSBtYWluIChvdXIgZ2FtZSBsb29wKSBhbmQgaXRzZWxmIGNhbGxzIGFsbFxuICAgICAqIG9mIHRoZSBmdW5jdGlvbnMgd2hpY2ggbWF5IG5lZWQgdG8gdXBkYXRlIGVudGl0eSdzIGRhdGEuIEJhc2VkIG9uIGhvd1xuICAgICAqIHlvdSBpbXBsZW1lbnQgeW91ciBjb2xsaXNpb24gZGV0ZWN0aW9uICh3aGVuIHR3byBlbnRpdGllcyBvY2N1cHkgdGhlXG4gICAgICogc2FtZSBzcGFjZSwgZm9yIGluc3RhbmNlIHdoZW4geW91ciBjaGFyYWN0ZXIgc2hvdWxkIGRpZSksIHlvdSBtYXkgZmluZFxuICAgICAqIHRoZSBuZWVkIHRvIGFkZCBhbiBhZGRpdGlvbmFsIGZ1bmN0aW9uIGNhbGwgaGVyZS4gRm9yIG5vdywgd2UndmUgbGVmdFxuICAgICAqIGl0IGNvbW1lbnRlZCBvdXQgLSB5b3UgbWF5IG9yIG1heSBub3Qgd2FudCB0byBpbXBsZW1lbnQgdGhpc1xuICAgICAqIGZ1bmN0aW9uYWxpdHkgdGhpcyB3YXkgKHlvdSBjb3VsZCBqdXN0IGltcGxlbWVudCBjb2xsaXNpb24gZGV0ZWN0aW9uXG4gICAgICogb24gdGhlIGVudGl0aWVzIHRoZW1zZWx2ZXMgd2l0aGluIHlvdXIgYXBwLmpzIGZpbGUpLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgaWYoIWdhbWVPdmVyKSB7XG4gICAgICAgIHVwZGF0ZUVudGl0aWVzKGR0KTtcbiAgICAgICAgLy8gY2hlY2tDb2xsaXNpb25zKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogVGhpcyBpcyBjYWxsZWQgYnkgdGhlIHVwZGF0ZSBmdW5jdGlvbiBhbmQgbG9vcHMgdGhyb3VnaCBhbGwgb2YgdGhlXG4gICAgICogb2JqZWN0cyB3aXRoaW4geW91ciBhbGxFbmVtaWVzIGFycmF5IGFzIGRlZmluZWQgaW4gYXBwLmpzIGFuZCBjYWxsc1xuICAgICAqIHRoZWlyIHVwZGF0ZSgpIG1ldGhvZHMuIEl0IHdpbGwgdGhlbiBjYWxsIHRoZSB1cGRhdGUgZnVuY3Rpb24gZm9yIHlvdXJcbiAgICAgKiBwbGF5ZXIgb2JqZWN0LiBUaGVzZSB1cGRhdGUgbWV0aG9kcyBzaG91bGQgZm9jdXMgcHVyZWx5IG9uIHVwZGF0aW5nXG4gICAgICogdGhlIGRhdGEvcHJvcGVydGllcyByZWxhdGVkIHRvIHRoZSBvYmplY3QuIERvIHlvdXIgZHJhd2luZyBpbiB5b3VyXG4gICAgICogcmVuZGVyIG1ldGhvZHMuXG4gICAgICovXG4gICAgZnVuY3Rpb24gdXBkYXRlRW50aXRpZXMoZHQpIHtcbiAgICAgIHBsYXllci51cGRhdGUoZHQpO1xuICAgICAgYWxsRW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uKGVuZW15KSB7XG4gICAgICAgICAgZW5lbXkudXBkYXRlKGR0KTtcbiAgICAgIH0pO1xuICAgICAgYm94LnVwZGF0ZSgpO1xuICAgICAgZ29hbC51cGRhdGUoKTtcbiAgICAgIGhlYXJ0LnVwZGF0ZSgpO1xuICAgIH1cblxuICAgIC8qIFRoaXMgZnVuY3Rpb24gaW5pdGlhbGx5IGRyYXdzIHRoZSBcImdhbWUgbGV2ZWxcIiwgaXQgd2lsbCB0aGVuIGNhbGxcbiAgICAgKiB0aGUgcmVuZGVyRW50aXRpZXMgZnVuY3Rpb24uIFJlbWVtYmVyLCB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBldmVyeVxuICAgICAqIGdhbWUgdGljayAob3IgbG9vcCBvZiB0aGUgZ2FtZSBlbmdpbmUpIGJlY2F1c2UgdGhhdCdzIGhvdyBnYW1lcyB3b3JrIC1cbiAgICAgKiB0aGV5IGFyZSBmbGlwYm9va3MgY3JlYXRpbmcgdGhlIGlsbHVzaW9uIG9mIGFuaW1hdGlvbiBidXQgaW4gcmVhbGl0eVxuICAgICAqIHRoZXkgYXJlIGp1c3QgZHJhd2luZyB0aGUgZW50aXJlIHNjcmVlbiBvdmVyIGFuZCBvdmVyLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgLyogVGhpcyBhcnJheSBob2xkcyB0aGUgcmVsYXRpdmUgVVJMIHRvIHRoZSBpbWFnZSB1c2VkXG4gICAgICAgICAqIGZvciB0aGF0IHBhcnRpY3VsYXIgcm93IG9mIHRoZSBnYW1lIGxldmVsLlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHJvd0ltYWdlcyA9IFtcbiAgICAgICAgICAgICAgICAnYXNzZXRzL2ltZy93YXRlci1ibG9jay5wbmcnLCAgIC8vIFRvcCByb3cgaXMgd2F0ZXJcbiAgICAgICAgICAgICAgICAnYXNzZXRzL2ltZy9zdG9uZS1ibG9jay5wbmcnLCAgIC8vIFJvdyAxIG9mIDMgb2Ygc3RvbmVcbiAgICAgICAgICAgICAgICAnYXNzZXRzL2ltZy9zdG9uZS1ibG9jay5wbmcnLCAgIC8vIFJvdyAyIG9mIDMgb2Ygc3RvbmVcbiAgICAgICAgICAgICAgICAnYXNzZXRzL2ltZy9zdG9uZS1ibG9jay5wbmcnLCAgIC8vIFJvdyAzIG9mIDMgb2Ygc3RvbmVcbiAgICAgICAgICAgICAgICAnYXNzZXRzL2ltZy9ncmFzcy1ibG9jay5wbmcnLCAgIC8vIFJvdyAxIG9mIDIgb2YgZ3Jhc3NcbiAgICAgICAgICAgICAgICAnYXNzZXRzL2ltZy9ncmFzcy1ibG9jay5wbmcnICAgIC8vIFJvdyAyIG9mIDIgb2YgZ3Jhc3NcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBudW1Sb3dzID0gNixcbiAgICAgICAgICAgIG51bUNvbHMgPSA1LFxuICAgICAgICAgICAgcm93LCBjb2w7XG5cbiAgICAgICAgLyogTG9vcCB0aHJvdWdoIHRoZSBudW1iZXIgb2Ygcm93cyBhbmQgY29sdW1ucyB3ZSd2ZSBkZWZpbmVkIGFib3ZlXG4gICAgICAgICAqIGFuZCwgdXNpbmcgdGhlIHJvd0ltYWdlcyBhcnJheSwgZHJhdyB0aGUgY29ycmVjdCBpbWFnZSBmb3IgdGhhdFxuICAgICAgICAgKiBwb3J0aW9uIG9mIHRoZSBcImdyaWRcIlxuICAgICAgICAgKi9cbiAgICAgICAgZm9yIChyb3cgPSAwOyByb3cgPCBudW1Sb3dzOyByb3crKykge1xuICAgICAgICAgICAgZm9yIChjb2wgPSAwOyBjb2wgPCBudW1Db2xzOyBjb2wrKykge1xuICAgICAgICAgICAgICAgIC8qIFRoZSBkcmF3SW1hZ2UgZnVuY3Rpb24gb2YgdGhlIGNhbnZhcycgY29udGV4dCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICogcmVxdWlyZXMgMyBwYXJhbWV0ZXJzOiB0aGUgaW1hZ2UgdG8gZHJhdywgdGhlIHggY29vcmRpbmF0ZVxuICAgICAgICAgICAgICAgICAqIHRvIHN0YXJ0IGRyYXdpbmcgYW5kIHRoZSB5IGNvb3JkaW5hdGUgdG8gc3RhcnQgZHJhd2luZy5cbiAgICAgICAgICAgICAgICAgKiBXZSdyZSB1c2luZyBvdXIgUmVzb3VyY2VzIGhlbHBlcnMgdG8gcmVmZXIgdG8gb3VyIGltYWdlc1xuICAgICAgICAgICAgICAgICAqIHNvIHRoYXQgd2UgZ2V0IHRoZSBiZW5lZml0cyBvZiBjYWNoaW5nIHRoZXNlIGltYWdlcywgc2luY2VcbiAgICAgICAgICAgICAgICAgKiB3ZSdyZSB1c2luZyB0aGVtIG92ZXIgYW5kIG92ZXIuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShSZXNvdXJjZXMuZ2V0KHJvd0ltYWdlc1tyb3ddKSwgY29sICogY29sV2lkdGgsIHJvdyAqIHJvd0hlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZW5kZXJFbnRpdGllcygpO1xuICAgIH1cblxuICAgIC8qIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGJ5IHRoZSByZW5kZXIgZnVuY3Rpb24gYW5kIGlzIGNhbGxlZCBvbiBlYWNoIGdhbWVcbiAgICAgKiB0aWNrLiBJdHMgcHVycG9zZSBpcyB0byB0aGVuIGNhbGwgdGhlIHJlbmRlciBmdW5jdGlvbnMgeW91IGhhdmUgZGVmaW5lZFxuICAgICAqIG9uIHlvdXIgZW5lbXkgYW5kIHBsYXllciBlbnRpdGllcyB3aXRoaW4gYXBwLmpzXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVuZGVyRW50aXRpZXMoKSB7XG4gICAgICAgIC8vIFJlbmRlciBhbGwgZ2FtZSBvYmplY3RzLiBPcmRlciBpcyBpbXBvcnRhbnQgc28ga2VlcCBwbGF5ZXIgbGFzdC5cbiAgICAgICAgZ29hbC5yZW5kZXIoKTtcbiAgICAgICAgYm94LnJlbmRlcigpO1xuICAgICAgICBoZWFydC5yZW5kZXIoKTtcbiAgICAgICAgYWxsRW5lbWllcy5mb3JFYWNoKGZ1bmN0aW9uKGVuZW15KSB7XG4gICAgICAgICAgICBlbmVteS5yZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGFsbFJvY2tzLmZvckVhY2goZnVuY3Rpb24ocm9jaykge1xuICAgICAgICAgICAgcm9jay5yZW5kZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHBsYXllci5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICAvKiBUaGlzIGZ1bmN0aW9uIGRvZXMgbm90aGluZyBidXQgaXQgY291bGQgaGF2ZSBiZWVuIGEgZ29vZCBwbGFjZSB0b1xuICAgICAqIGhhbmRsZSBnYW1lIHJlc2V0IHN0YXRlcyAtIG1heWJlIGEgbmV3IGdhbWUgbWVudSBvciBhIGdhbWUgb3ZlciBzY3JlZW5cbiAgICAgKiB0aG9zZSBzb3J0cyBvZiB0aGluZ3MuIEl0J3Mgb25seSBjYWxsZWQgb25jZSBieSB0aGUgaW5pdCgpIG1ldGhvZC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgLy8gSWYgdGhlIGdhbWUgaXMgb3ZlciwgcmVzdGFydCB0aGUgdGltZSBhbmQgYm94ZXMgbG9zdCBhcnJheS5cbiAgICAgICAgaWYoZ2FtZU92ZXIpIHtcbiAgICAgICAgICBnYW1lT3ZlciA9ICFjb25maXJtKCdHQU1FIE9WRVIhIFRyeSBBZ2Fpbj8nKTtcbiAgICAgICAgICBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgIGJveGVzTG9zdCA9IFtdO1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm94ZXNfbG9zdFwiKS5pbm5lckhUTUwgPSBib3hlc0xvc3QubGVuZ3RoO1xuICAgICAgICAgIHBsYXllciA9IG5ldyBQbGF5ZXIoJ2Fzc2V0cy9pbWcvY2hhci1ib3kucG5nJyk7XG4gICAgICAgICAgYm94ID0gbmV3IEl0ZW0oJ2Fzc2V0cy9pbWcvZ2VtLWJsdWUucG5nJywgJ2luZGllYm94JyksXG4gICAgICAgICAgcG9pbnRzID0gMDtcbiAgICAgICAgICBib3guY29sbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb2ludHNcIikuaW5uZXJIVE1MID0gcG9pbnRzO1xuICAgICAgICAgIHVwZGF0ZVRpbWVyKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RhcnQgPSBjb25maXJtKCdTdGFydCBnYW1lPycpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogR28gYWhlYWQgYW5kIGxvYWQgYWxsIG9mIHRoZSBpbWFnZXMgd2Uga25vdyB3ZSdyZSBnb2luZyB0byBuZWVkIHRvXG4gICAgICogZHJhdyBvdXIgZ2FtZSBsZXZlbC4gVGhlbiBzZXQgaW5pdCBhcyB0aGUgY2FsbGJhY2sgbWV0aG9kLCBzbyB0aGF0IHdoZW5cbiAgICAgKiBhbGwgb2YgdGhlc2UgaW1hZ2VzIGFyZSBwcm9wZXJseSBsb2FkZWQgb3VyIGdhbWUgd2lsbCBzdGFydC5cbiAgICAgKi9cbiAgICB3aW5kb3cuUmVzb3VyY2VzLmxvYWQoW1xuICAgICAgJ2Fzc2V0cy9pbWcvc3RvbmUtYmxvY2sucG5nJyxcbiAgICAgICdhc3NldHMvaW1nL3dhdGVyLWJsb2NrLnBuZycsXG4gICAgICAnYXNzZXRzL2ltZy9ncmFzcy1ibG9jay5wbmcnLFxuICAgICAgJ2Fzc2V0cy9pbWcvZW5lbXktYnVnLnBuZycsXG4gICAgICAnYXNzZXRzL2ltZy9jaGFyLWJveS5wbmcnLFxuICAgICAgJ2Fzc2V0cy9pbWcvZ2VtLWJsdWUucG5nJyxcbiAgICAgICdhc3NldHMvaW1nL2dlbS1ncmVlbi5wbmcnLFxuICAgICAgJ2Fzc2V0cy9pbWcvZ2VtLW9yYW5nZS5wbmcnLFxuICAgICAgJ2Fzc2V0cy9pbWcvaGVhcnQucG5nJyxcbiAgICAgICdhc3NldHMvaW1nL3JvY2sucG5nJyxcbiAgICAgICdhc3NldHMvaW1nL3N0YXIucG5nJyxcbiAgICAgICdhc3NldHMvaW1nL3NlbGVjdG9yLnBuZydcbiAgICBdKTtcbiAgICBcbiAgICB3aW5kb3cuUmVzb3VyY2VzLm9uUmVhZHkoaW5pdCk7XG5cbn0pKHRoaXMpO1xuIiwiLy8gU2V0IHVwIGdsb2JhbCB2YXJzXG52YXIgY3R4ID0gJCgnY2FudmFzJylbMF0uZ2V0Q29udGV4dCgnMmQnKSxcbiAgICBjb2xXaWR0aCA9IDEwMSxcbiAgICByb3dIZWlnaHQgPSA4MCxcbiAgICBvZmZzZXRZID0gMjUsXG4gICAgaGl0ID0gZmFsc2UsXG4gICAgZ29hbFJlYWNoZWQgPSBmYWxzZSxcbiAgICBib3hlc0xvc3QgPSBbXSxcbiAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLFxuICAgIGhlYXJ0WCxcbiAgICBoZWFydFksXG4gICAgcG9pbnRzID0gMCxcbiAgICBnYW1lSG91cnMgPSAwLFxuICAgIGdhbWVNaW51dGVzID0gMCxcbiAgICBnYW1lU2Vjb25kcyA9IDAsXG4gICAgZ2FtZU92ZXIgPSBmYWxzZTtcblxuXG52YXIgRW5lbXlMYW5lID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZW5lbWllcyA9IFtdO1xuICB0aGlzLnNwZWVkID0gMDtcbiAgdGhpcy5oYXNJdGVtID0gZmFsc2U7XG59XG5cbnZhciBHb2FsTGFuZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmdvYWxzID0gW107XG59XG5cbnZhciBTdGFydExhbmUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zdGFydHMgPSBbXTtcbn1cblxudmFyIGJvYXJkTGFuZXMgPSBbbmV3IEdvYWxMYW5lLCBuZXcgRW5lbXlMYW5lKCksIG5ldyBFbmVteUxhbmUoKSwgbmV3IEVuZW15TGFuZSgpLCBuZXcgU3RhcnRMYW5lKCksIG5ldyBTdGFydExhbmUoKV07XG5cbi8vIEVuZW1pZXMgb3VyIHBsYXllciBtdXN0IGF2b2lkXG52YXIgRW5lbXkgPSBmdW5jdGlvbihzcGVlZCwgcmVzcGF3bikge1xuXG4gICAgLy8gaW1hZ2UgdXJsXG4gICAgdGhpcy5zcHJpdGUgPSAnYXNzZXRzL2ltZy9lbmVteS1idWcucG5nJztcblxuICAgIC8vIEludGVnZXIgZm9yIGhvdyBmYXN0IHRoZSBlbmVteSB0cmF2ZWxzLCBtYXggc3BlZWQgM1xuICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcblxuICAgIC8vIFJlc3Bhd24gWCB2YWx1ZSBzbyBlbmVtaWVzIHNwYXduIG9uIGVhY2ggb3RoZXJcbiAgICB0aGlzLnJlc3Bhd24gPSByZXNwYXduO1xuXG4gICAgLy8gU3RhcnQgdGhlIGVuZW15IHJhbmRvbWx5IG9mZiB0aGUgYm9hcmQgYSB3YXlzXG4gICAgdGhpcy54ID0gLWdldFJhbmRvbUludCgxLCA4KTtcblxuICAgIC8vIFNlbGVjdCBhIHJhbmRvbSByb3cgYmV0d2VlbiB0aGUgc2Vjb25kIGFuZCBmb3J0aFxuICAgIHRoaXMueSA9IGdldFJhbmRvbUludCgxLCA0KTtcblxuICAgIC8vIHNldCB3aGVuIHRoZSBlbmVteSBpcyB2aXNhYmxlXG4gICAgdGhpcy52aXNhYmxlID0gZmFsc2U7XG5cbiAgICAvLyBzZXQgd2hlbiB0aGUgZW5lbXkgcnVucyBvdmVyIGFuIGl0ZW1cbiAgICB0aGlzLmhpdEJveCA9IGZhbHNlO1xuXG4gICAgdGhpcy5sYW5lT3JkZXIgPSAwO1xuXG59O1xuXG4vLyBVcGRhdGUgdGhlIGVuZW15J3MgcG9zaXRpb25cbi8vIFBhcmFtZXRlcjogZHQsIGEgdGltZSBkZWx0YSBiZXR3ZWVuIHRpY2tzXG5FbmVteS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcbiAgICAvLyBNb3ZlIHRoZSBlbmVteSBhY3Jvc3MgdGhlIHJvd1xuICAgIHRoaXMueCA9IHRoaXMueCArIGR0ICogdGhpcy5zcGVlZDtcblxuICAgIC8vIElmIHRoZSBlbmVteSB4IGlzIGdyZWF0ZXIgdGhhbiB6ZXJvIGl0J3MgdmlzYWJsZVxuICAgIGlmKHRoaXMueCA+IDAgJiYgdGhpcy52aXNhYmxlID09PSBmYWxzZSkge1xuICAgICAgdGhpcy52aXNhYmxlID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYodGhpcy54ID49IDUgJiYgdGhpcy52aXNhYmxlID09PSB0cnVlKSB7XG4gICAgICAvLyBJZiB0aGUgZW5lbXkgeCBpcyBncmVhdGVyIHRoYW4gNSBpcyBub3QgdmlzYWJsZSBvbiB0aGUgYm9hcmRcbiAgICAgIC8vIFJlZHJhdyBlbmVteSBvZmYgY2FudmFzIGFuZCBzZXQgdmlzYWJsZSB0byBmYWxzZVxuICAgICAgdGhpcy52aXNhYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLnggPSB0aGlzLnJlc3Bhd247XG4gICAgICB0aGlzLnkgPSBnZXRSYW5kb21JbnQoMSwgNCk7XG4gICAgICB0aGlzLnNwZWVkID0gZ2V0UmFuZG9tSW50KDEsIDQpO1xuICAgICAgdGhpcy5oaXRCb3ggPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSGF2ZSBlbmVtaWVzIHN0b3AgcmlnaHQgYmVoaW5kIGFuIGVuZW15IGlmIHRoZXkgYXJlIGdvaW5nIGZhc3RlciB0aGFuXG4gICAgICAvLyB0aGUgb25lIGFoZWFkIG9mIHRoZW0uXG4gICAgICB2YXIgZW5lbXlYID0gdGhpcy54O1xuICAgICAgdmFyIGVuZW15WSA9IHRoaXMueTtcbiAgICAgIHZhciBlbmVteVNwZWVkID0gdGhpcy5zcGVlZDtcbiAgICAgIHZhciBuZXdTcGVlZCA9IDA7XG5cbiAgICAgIGFsbEVuZW1pZXMuZm9yRWFjaChmdW5jdGlvbihlbmVteSkge1xuICAgICAgICBpZihlbmVteS55ID09PSBlbmVteVkpIHtcbiAgICAgICAgICBpZihlbmVteVggPD0gKGVuZW15LnggKyAxKSAmJiBlbmVteS5zcGVlZCA8IGVuZW15U3BlZWQpIHtcbiAgICAgICAgICAgIG5ld1NwZWVkID0gZW5lbXkuc3BlZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYobmV3U3BlZWQgPiAwKSB7XG4gICAgICAgIHRoaXMuc3BlZWQgPSBuZXdTcGVlZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgLy8gSWYgYW4gZW5lbXkgaGl0cyB0aGUgcGxheWVyLCBzZXQgdGhlbSBiYWNrIGFuZCByZWR1Y2UgbGl2ZXNcbiAgaWYocGxheWVyLmludGVyc2VjdHModGhpcykpe1xuICAgIGhpdCA9IHRydWU7XG4gIH1cblxuICAvLyBJZiBhbiBlbmVteSBoaXRzIGEgYm94LCBpbmNyZW1lbnQgaG93IG1hbnkgdGltZXMgaXQgd2FzIGhpdFxuICBpZih0aGlzLnkgPT09IGJveC55ICYmIHRoaXMuaGl0Qm94ID09PSBmYWxzZSkge1xuICAgIGlmKCB0aGlzLnggPiAoYm94LnggLSAuNSkgJiYgdGhpcy54IDwgKGJveC54ICsgLjUpICkge1xuICAgICAgdGhpcy5oaXRCb3ggPSB0cnVlO1xuICAgICAgYm94LnJhbk92ZXIgKz0gMTtcbiAgICAgIGNvbnNvbGUubG9nKCdCb3ggcmFuIG92ZXIhJyk7XG4gICAgfVxuICB9XG59O1xuXG4vLyBEcmF3cyBhbiBlbmVteSBvbiB0aGUgc2NyZWVuXG5FbmVteS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIGN0eC5kcmF3SW1hZ2UoUmVzb3VyY2VzLmdldCh0aGlzLnNwcml0ZSksIHRoaXMueCAqIGNvbFdpZHRoLCB0aGlzLnkgKiByb3dIZWlnaHQgLSBvZmZzZXRZKTtcbn07XG5cbnZhciBJdGVtID0gZnVuY3Rpb24oaW1hZ2UsIHR5cGUpIHtcbiAgdGhpcy5zcHJpdGUgPSBpbWFnZTtcbiAgdGhpcy50eXBlID0gdHlwZTtcbiAgdGhpcy5jb2xsZWN0ZWQgPSBmYWxzZTtcbiAgLy8gSWYgdGhlIGl0ZW0gaXMgYW4gaW5kaWVib3gsIHN0YXJ0IGl0IGluIHRoZSBjYW52YXMgbGFuZXMuXG4gIC8vIElmIGl0J3MgaGVhcnQsIHN0YXJ0IGl0IG9mZiBjYW52YXMuXG4gIGlmKHR5cGUgPT09ICdpbmRpZWJveCcpIHtcbiAgICB0aGlzLnggPSBnZXRSYW5kb21JbnQoMCwgNSk7XG4gICAgdGhpcy55ID0gZ2V0UmFuZG9tSW50KDEsIDQpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMueCA9IDEwMDtcbiAgICB0aGlzLnkgPSAxMDA7XG4gIH1cblxuICB0aGlzLmggPSAxMTc7IC8vIGhlaWdodCBvZiBpdGVtXG4gIHRoaXMudyA9IDEwMTsgLy8gd2lkdGggb2YgaXRlbVxuICB0aGlzLnJhbk92ZXIgPSAwOyAvLyBpZiB0aGUgaXRlbSBnZXRzIGhpdCBieSBhbiBlbmVteVxufVxuXG4vLyBEcmF3cyBhbiBJdGVtIG9uIHRoZSBzY3JlZW5cbkl0ZW0ucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICBjdHguZHJhd0ltYWdlKFJlc291cmNlcy5nZXQodGhpcy5zcHJpdGUpLCB0aGlzLnggKiBjb2xXaWR0aCwgdGhpcy55ICogcm93SGVpZ2h0IC0gb2Zmc2V0WSk7XG59XG5cbi8vIFVwZGF0ZSB0aGUgaXRlbSdzIHBvc3Rpb24gYmFzZWQgb24gcGxheWVyJ3MgbW92ZW1lbnRzXG5JdGVtLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHByZXZYID0gdGhpcy54O1xuICB2YXIgcHJldlkgPSB0aGlzLnk7XG5cbiAgLy8gSWYgdGhlIHBsYXllciBpcyBoaXQgd2hpbGUgaW5kaWVib3ggaXRlbSBpcyBjb2xsZWN0ZWRcbiAgLy8gc2V0IHRoZSBpdGVtIGJhY2sgb24gYSByYW5kb20gbG9jYXRpb24uXG4gIGlmKGhpdCAmJiB0aGlzLmNvbGxlY3RlZCAmJiB0aGlzLnR5cGUgPT09ICdpbmRpZWJveCcpIHtcbiAgICB0aGlzLmNvbGxlY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMueCA9IGdldFJhbmRvbUludCgwLCA1KTtcbiAgICB0aGlzLnkgPSBnZXRSYW5kb21JbnQoMSwgNCk7XG4gIH1cblxuICBpZihwbGF5ZXIuY29sbGVjdHModGhpcykpIHtcbiAgICB0aGlzLmNvbGxlY3RlZCA9IHRydWU7XG4gIH1cblxuICBpZih0aGlzLmNvbGxlY3RlZCkge1xuXG4gICAgc3dpdGNoKHRoaXMudHlwZSkge1xuICAgICAgY2FzZSAnaW5kaWVib3gnOlxuICAgICAgICAvLyBCb3ggY29sbGVjdGVkLCBzbyBmb2xsb3cgdGhlIHBsYXllcnMgbW92ZW1lbnRzXG4gICAgICAgIHRoaXMueCA9IHBsYXllci54O1xuICAgICAgICB0aGlzLnkgPSBwbGF5ZXIueTtcbiAgICAgICAgLy8gSWYgdGhlIGl0ZW0gZ2V0cyB0byB0aGUgZ29hbCBpdCdzIGRlbGl2ZXJlZCBzbyByZXNldCBpdC5cbiAgICAgICAgaWYocGxheWVyLnJlYWNoZXNHb2FsKHRoaXMpKSB7XG4gICAgICAgICAgcGxheWVyLmRlbGl2ZXJpZXMucHVzaCh7XG4gICAgICAgICAgICAndGltZScgOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgJ3gnIDogdGhpcy54LFxuICAgICAgICAgICAgJ3knIDogdGhpcy55XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgc3dpdGNoICh0aGlzLnJhbk92ZXIpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgcG9pbnRzICs9IDEwMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgIHBvaW50cyArPSA1MDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgIHBvaW50cyArPSAyNTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb2ludHNcIikuaW5uZXJIVE1MID0gcG9pbnRzO1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm94ZXNfc2F2ZWRcIikuaW5uZXJIVE1MID0gcGxheWVyLmRlbGl2ZXJpZXMubGVuZ3RoO1xuICAgICAgICAgIHRoaXMuY29sbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgZ29hbFJlYWNoZWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMucmFuT3ZlciA9IDA7XG4gICAgICAgICAgdGhpcy54ID0gZ2V0UmFuZG9tSW50KDAsIDUpO1xuICAgICAgICAgIHRoaXMueSA9IGdldFJhbmRvbUludCgxLCA0KTtcblxuICAgICAgICAgIC8vIE1vdmUgdGhlIG9ic3RpY2xlIHRvIGEgbmV3IGxvY2F0aW9uXG4gICAgICAgICAgYWxsUm9ja3MuZm9yRWFjaChmdW5jdGlvbihyb2NrKSB7XG4gICAgICAgICAgICByb2NrLnggPSBnZXRSYW5kb21JbnQoMCwgNSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2hlYXJ0JzpcbiAgICAgICAgLy8gR2FpbiBhIGxpZmUgYW5kIHJlbW92ZSBoZWFydCBmcm9tIGNhbnZhc1xuICAgICAgICB0aGlzLmNvbGxlY3RlZCA9IGZhbHNlO1xuICAgICAgICBwbGF5ZXIubGl2ZXMgKz0gMTtcbiAgICAgICAgcG9pbnRzICs9IDUwO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpdmVzXCIpLmlubmVySFRNTCA9IHBsYXllci5saXZlcztcbiAgICAgICAgdGhpcy54ID0gMTAwO1xuICAgICAgICB0aGlzLnkgPSAxMDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYodGhpcy50eXBlID09PSAnaW5kaWVib3gnKSB7XG4gICAgc3dpdGNoKHRoaXMucmFuT3Zlcikge1xuICAgICAgY2FzZSAxOlxuICAgICAgICAvLyBmaXJzdCBoaXRcbiAgICAgICAgdGhpcy5zcHJpdGUgPSAnYXNzZXRzL2ltZy9nZW0tZ3JlZW4ucG5nJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIC8vIHNlY29uZCBoaXRcbiAgICAgICAgdGhpcy5zcHJpdGUgPSAnYXNzZXRzL2ltZy9nZW0tb3JhbmdlLnBuZyc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICAvLyBUaGlyZCBoaXQsIGRlc3Ryb3kgaXQgYW5kIGxvZyBpdC5cbiAgICAgICAgYm94ZXNMb3N0LnB1c2goe1xuICAgICAgICAgICd0aW1lJyA6IERhdGUubm93KCksXG4gICAgICAgICAgJ3gnIDogdGhpcy54LFxuICAgICAgICAgICd5JyA6IHRoaXMueVxuICAgICAgICB9KTtcbiAgICAgICAgcG9pbnRzIC09IDUwO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBvaW50c1wiKS5pbm5lckhUTUwgPSBwb2ludHM7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm94ZXNfbG9zdFwiKS5pbm5lckhUTUwgPSBib3hlc0xvc3QubGVuZ3RoO1xuICAgICAgICB0aGlzLnNwcml0ZSA9ICdhc3NldHMvaW1nL2dlbS1ibHVlLnBuZyc7XG4gICAgICAgIHRoaXMueCA9IGdldFJhbmRvbUludCgwLCA1KTtcbiAgICAgICAgdGhpcy55ID0gZ2V0UmFuZG9tSW50KDEsIDQpO1xuICAgICAgICB0aGlzLnJhbk92ZXIgPSAwO1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICBhbGxFbmVtaWVzLmZvckVhY2goZnVuY3Rpb24oZW5lbXkpIHtcbiAgICAgICAgICBlbmVteS5oaXRCb3ggPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5zcHJpdGUgPSAnYXNzZXRzL2ltZy9nZW0tYmx1ZS5wbmcnO1xuICAgIH1cbiAgfVxuXG4gIGlmKHRoaXMudHlwZSA9PT0gJ2hlYXJ0JyAmJiBnYW1lU2Vjb25kcyAlIDMwID09PSAwKSB7XG4gICAgdGhpcy54ID0gaGVhcnRYO1xuICAgIHRoaXMueSA9IGhlYXJ0WTtcbiAgfVxuICBpZih0aGlzLnR5cGUgPT09ICdoZWFydCcgJiYgZ2FtZVNlY29uZHMgJSA5ID09PSAwKSB7XG4gICAgdGhpcy54ID0gMTAwO1xuICAgIHRoaXMueSA9IDEwMDtcbiAgICBoZWFydFg9IGdldFJhbmRvbUludCgwLCA1KTtcbiAgICBoZWFydFkgPSBnZXRSYW5kb21JbnRFeGNsdWRlKDEsIDUsIDQpO1xuICB9XG59XG5cbnZhciBHb2FsID0gZnVuY3Rpb24oaW1hZ2UpIHtcbiAgdGhpcy5zcHJpdGUgPSBpbWFnZTtcbiAgdGhpcy54ID0gZ2V0UmFuZG9tSW50KDAsIDUpO1xuICB0aGlzLnkgPSAwOyAvLyBhbHdheXMgdGhlIHRvcCBsYW5lXG59XG5cbkdvYWwucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICBpZihnb2FsUmVhY2hlZCkge1xuICAgIGNvbnNvbGUubG9nKCdCb3ggRGVsaXZlcmVkIScpO1xuICAgIGdvYWxSZWFjaGVkID0gZmFsc2U7XG4gICAgdGhpcy54ID0gZ2V0UmFuZG9tSW50KDAsIDUpO1xuICB9XG59XG5cbkdvYWwucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICBjdHguZHJhd0ltYWdlKFJlc291cmNlcy5nZXQodGhpcy5zcHJpdGUpLCB0aGlzLnggKiBjb2xXaWR0aCwgdGhpcy55ICogcm93SGVpZ2h0IC0gb2Zmc2V0WSk7XG59XG5cbi8vIENyZWF0ZSBwbGF5ZXIgY2xhc3NcbnZhciBQbGF5ZXIgPSBmdW5jdGlvbihpbWFnZSkge1xuICAvLyBTZXR1cCB1cmwgZm9yIHBsYXllciBzcHJpdFxuICB0aGlzLnNwcml0ZSA9IGltYWdlO1xuICB0aGlzLnggPSAyO1xuICB0aGlzLnkgPSA1O1xuICB0aGlzLm1vdmVYID0gMjsgLy8gdGhlIG5leHQgWCBtb3ZlbWVudFxuICB0aGlzLm1vdmVZID0gNTsgLy8gdGhlIG5leHQgWSBtb3ZlbWVudFxuICB0aGlzLm1vdmVEaXJlY3Rpb24gPSAnJzsgLy8gdGhlIG1vdmVtZW50IGRpcmVjdGlvbiBmcm9tIHVzZXIgaW5wdXRcbiAgdGhpcy5oID0gMTE3OyAvLyBoZWlnaHQgb2YgcGxheWVyXG4gIHRoaXMudyA9IDEwMTsgLy8gd2lkdGggb2YgcGxheWVyXG4gIHRoaXMubW92ZVNwZWVkID0gNTsgLy8gZWRpdCB0aGlzIHRvIG1ha2UgY2hhcmFjdGVyIG1vdmUgZmFzdGVyLCBtYXggc3BlZWQgaXMgMTAuXG4gIHRoaXMubW92aW5nID0gZmFsc2U7XG4gIHRoaXMubW92ZW1lbnRzID0gW107XG4gIHRoaXMuZGVsaXZlcmllcyA9IFtdO1xuICB0aGlzLmxpdmVzID0gMztcbiAgdGhpcy5sZXZlbCA9IDE7XG59XG5cblBsYXllci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZHQpIHtcbiAgLy8gQ2hlY2sgZGlmZmVyZW5jZSBvZiBtb3ZlIGRlc3RpbmF0aW9uIGFuZCBlbnN1cmUgZGlyZWN0aW9uIG1heCBiZWZvcmUgY2hhbmdpbmdcbiAgLy8gYm9hcmQgY29vcmRpbmF0ZXMgdG8gYXZvaWQgZ2l0dGVyIGluIG1vdmVtZW50LlxuICBpZih0aGlzLm1vdmluZyAmJiAhaGl0KSB7XG4gICAgLy8gTW92aW5nIGxlZnRcbiAgICBpZih0aGlzLnggPiB0aGlzLm1vdmVYICYmIHRoaXMubW92ZURpcmVjdGlvbiA9PT0gJ2xlZnQnKSB7XG4gICAgICB2YXIgbmV3WCA9IHRoaXMueCAtIChkdCAqIHRoaXMubW92ZVNwZWVkKTtcbiAgICAgIHRoaXMueCA9IG5ld1ggPCB0aGlzLm1vdmVYID8gdGhpcy5tb3ZlWCA6IG5ld1g7XG4gICAgLy8gTW92aW5nIHJpZ2h0XG4gICAgfSBlbHNlIGlmKHRoaXMueCA8IHRoaXMubW92ZVggJiYgdGhpcy5tb3ZlRGlyZWN0aW9uID09PSAncmlnaHQnKSB7XG4gICAgICB2YXIgbmV3WCA9IHRoaXMueCArIChkdCAqIHRoaXMubW92ZVNwZWVkKTtcbiAgICAgIHRoaXMueCA9IG5ld1ggPiB0aGlzLm1vdmVYID8gdGhpcy5tb3ZlWCA6IG5ld1g7XG4gICAgLy8gTW92aW5nIHVwXG4gICAgfSBlbHNlIGlmKHRoaXMueSA+IHRoaXMubW92ZVkgJiYgdGhpcy5tb3ZlRGlyZWN0aW9uID09PSAndXAnKSB7XG4gICAgICB2YXIgbmV3WSA9IHRoaXMueSAtIChkdCAqIHRoaXMubW92ZVNwZWVkKTtcbiAgICAgIHRoaXMueSA9IG5ld1kgPCB0aGlzLm1vdmVZID8gdGhpcy5tb3ZlWSA6IG5ld1k7XG4gICAgLy8gTW92aW5nIGRvd25cbiAgICB9IGVsc2UgaWYodGhpcy55IDwgdGhpcy5tb3ZlWSAmJiB0aGlzLm1vdmVEaXJlY3Rpb24gPT09ICdkb3duJykge1xuICAgICAgdmFyIG5ld1kgPSB0aGlzLnkgKyAoZHQgKiB0aGlzLm1vdmVTcGVlZCk7XG4gICAgICB0aGlzLnkgPSBuZXdZID4gdGhpcy5tb3ZlWSA/IHRoaXMubW92ZVkgOiBuZXdZO1xuICAgIC8vIE5vdCBtb3ZpbmdcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tb3ZpbmcgPSBmYWxzZTtcbiAgICAgIC8vIEluc3VyZSBpbnRlZ2VyIHZhbHVlc1xuICAgICAgdGhpcy54ID0gTWF0aC5yb3VuZCh0aGlzLngpO1xuICAgICAgdGhpcy55ID0gTWF0aC5yb3VuZCh0aGlzLnkpO1xuICAgICAgY29uc29sZS5sb2coJ1BsYXllciBYOiAnLCB0aGlzLngsICdQbGF5ZXIgWTogJywgdGhpcy55LCAnRGlyZWN0aW9uOiAnLCB0aGlzLm1vdmVEaXJlY3Rpb24pO1xuICAgIH1cblxuICB9XG4gIGlmKGhpdCl7XG4gICAgLy8gUmVkdWNlIGEgbGlmZSBpZiBwbGF5ZXIgaGFzIGFueSBsZWZ0IG9yIGdhbWVvdmVyXG4gICAgaWYodGhpcy5saXZlcyA+IDEpIHtcbiAgICAgIHRoaXMubGl2ZXMgLT0gMTtcbiAgICAgIHRoaXMueCA9IGdldFJhbmRvbUludCgxLCA0KTtcbiAgICAgIHRoaXMueSA9IDU7XG4gICAgICB0aGlzLm1vdmVYID0gdGhpcy54O1xuICAgICAgdGhpcy5tb3ZlWSA9IHRoaXMueTtcbiAgICAgIGhpdCA9IGZhbHNlO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsaXZlc1wiKS5pbm5lckhUTUwgPSBwbGF5ZXIubGl2ZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhpdCA9IGZhbHNlO1xuICAgICAgdGhpcy54ID0gMjtcbiAgICAgIHRoaXMueSA9IDU7XG4gICAgICB0aGlzLm1vdmVYID0gdGhpcy54O1xuICAgICAgdGhpcy5tb3ZlWSA9IHRoaXMueTtcbiAgICAgIGNvbnNvbGUubG9nKCdHQU1FIE9WRVInKTtcbiAgICAgIHRoaXMubGl2ZXMgPSAzO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsaXZlc1wiKS5pbm5lckhUTUwgPSBwbGF5ZXIubGl2ZXM7XG4gICAgICBnYW1lT3ZlciA9IHRydWU7XG4gICAgICAvLyBkbyBhIHJlc2V0IGhlcmUuXG4gICAgICBib3gucmFuT3ZlciA9IDA7XG4gICAgICBib3gueCA9IGdldFJhbmRvbUludCgwLCA1KTtcbiAgICAgIGJveC55ID0gZ2V0UmFuZG9tSW50KDEsIDQpO1xuICAgIH1cbiAgfVxuICB0aGlzLmNoZWNrTGV2ZWwoKTtcbn1cblxuUGxheWVyLnByb3RvdHlwZS5jaGVja0xldmVsID0gZnVuY3Rpb24oKSB7XG5cbiAgaWYgKHBvaW50cyA8IDEwMDApIHtcbiAgICB0aGlzLmxldmVsID0gMTtcbiAgfSBlbHNlIGlmIChwb2ludHMgPCAyMDAwKSB7XG4gICAgdGhpcy5sZXZlbCA9IDI7XG4gICAgdGhpcy5tb3ZlU3BlZWQgPSA2O1xuICB9IGVsc2UgaWYgKHBvaW50cyA8IDMwMDApIHtcbiAgICB0aGlzLmxldmVsID0gMztcbiAgICB0aGlzLm1vdmVTcGVlZCA9IDc7XG4gIH0gZWxzZSBpZiAocG9pbnRzIDwgNDAwMCkge1xuICAgIHRoaXMubGV2ZWwgPSA0O1xuICAgIHRoaXMubW92ZVNwZWVkID0gODtcbiAgfSBlbHNlIGlmIChwb2ludHMgPCA1MDAwKSB7XG4gICAgdGhpcy5sZXZlbCA9IDU7XG4gICAgdGhpcy5tb3ZlU3BlZWQgPSA5O1xuICB9IGVsc2UgaWYgKHBvaW50cyA8IDYwMDApIHtcbiAgICB0aGlzLmxldmVsID0gNjtcbiAgICB0aGlzLm1vdmVTcGVlZCA9IDEwO1xuICB9IGVsc2UgaWYgKHBvaW50cyA8IDcwMDApIHtcbiAgICB0aGlzLmxldmVsID0gNztcbiAgICB0aGlzLm1vdmVTcGVlZCA9IDExO1xuICB9IGVsc2UgaWYgKHBvaW50cyA8IDgwMDApIHtcbiAgICB0aGlzLmxldmVsID0gODtcbiAgICB0aGlzLm1vdmVTcGVlZCA9IDEyO1xuICB9IGVsc2UgaWYgKHBvaW50cyA8IDkwMDApIHtcbiAgICB0aGlzLmxldmVsID0gOTtcbiAgICB0aGlzLm1vdmVTcGVlZCA9IDEzO1xuICB9IGVsc2UgaWYgKHBvaW50cyA8IDEwMDAwKSB7XG4gICAgdGhpcy5sZXZlbCA9IDEwO1xuICAgIHRoaXMubW92ZVNwZWVkID0gMTQ7XG4gIH1cblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxldmVsXCIpLmlubmVySFRNTCA9IHRoaXMubGV2ZWw7XG59XG5cbi8vIERyYXcgdGhlIHBsYXllciBvbiB0aGUgY2FudmFzXG5QbGF5ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICBjdHguZHJhd0ltYWdlKFJlc291cmNlcy5nZXQodGhpcy5zcHJpdGUpLCB0aGlzLnggKiBjb2xXaWR0aCwgdGhpcy55ICogcm93SGVpZ2h0IC0gb2Zmc2V0WSk7XG59XG5cbi8vIENoZWNrcyB0byBzZWUgYW4gZW5lbXkgaW50ZXJzZWN0IHdpdGggdGhlIHBsYXllclxuUGxheWVyLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24oZW5lbXkpIHtcbiAgICB2YXIgaW50ZXJzZWN0cyA9IGZhbHNlO1xuICAgIGlmKGVuZW15LnkgPT09IHRoaXMueSApe1xuICAgICAgaWYoIGVuZW15LnggPiAodGhpcy54IC0gLjUpICYmIGVuZW15LnggPCAodGhpcy54ICsgLjUpICkge1xuICAgICAgICBpbnRlcnNlY3RzID0gdHJ1ZTtcbiAgICAgICAgY29uc29sZS5sb2coJ0hJVCEgRW5lbXkgWDogJyArIGVuZW15LngpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW50ZXJzZWN0cztcbn1cblxuLy8gQ2hlY2sgdG8gc2VlIGlmIHRoZSBwbGF5ZXIgaW50ZXJzZWN0cyB3aXRoIGFuIGl0ZW1cblBsYXllci5wcm90b3R5cGUuY29sbGVjdHMgPSBmdW5jdGlvbihpdGVtKSB7XG4gIGlmKGl0ZW0ueCA9PT0gdGhpcy54ICYmIGl0ZW0ueSA9PT0gdGhpcy55KXtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLy8gQ2hlY2sgaWYgdGhlIHBsYXllciBkZWxpdmVycyBhIGJveFxuUGxheWVyLnByb3RvdHlwZS5yZWFjaGVzR29hbCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgaWYoaXRlbS54ID09PSBnb2FsLnggJiYgaXRlbS55ID09PSBnb2FsLnkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLy8gSGFuZGxlIGtleWJvYXJkIGlucHV0IGZvciBwbGF5ZXIgYWN0aW9uc1xuUGxheWVyLnByb3RvdHlwZS5oYW5kbGVJbnB1dCA9IGZ1bmN0aW9uKGtleUNvZGUpIHtcbiAgdmFyIHRoaXNYID0gdGhpcy54O1xuICB2YXIgdGhpc1kgPSB0aGlzLnk7XG4gIHZhciBvYnN0cnVjdGVkID0gZmFsc2U7XG4gIHN3aXRjaCAoa2V5Q29kZSkge1xuICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgLy8gQ2hlY2sgcm9ja3MgdG8gc2VlIGlmIHRoZXkgb2JzdHJ1Y3QgcGxheWVyIG1vdmVtZW50XG4gICAgICBhbGxSb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uKHJvY2spIHtcbiAgICAgICAgaWYoIHJvY2sueSA9PT0gdGhpc1kgKSB7XG4gICAgICAgICAgaWYoIHJvY2sueCA9PT0gKHRoaXNYIC0gMSkgKXtcbiAgICAgICAgICAgIG9ic3RydWN0ZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZighb2JzdHJ1Y3RlZCAmJiB0aGlzLnggPiAwICYmICF0aGlzLm1vdmluZykge1xuICAgICAgICB0aGlzLm1vdmVEaXJlY3Rpb24gPSAnbGVmdCc7XG4gICAgICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5tb3ZlWCAtPSAxO1xuICAgICAgICAvLyBJZiBwbGF5ZXIgbW92ZWQgbG9nIGl0XG4gICAgICAgIHRoaXMubW92ZW1lbnRzLnB1c2goe1xuICAgICAgICAgICdrZXlDb2RlJzoga2V5Q29kZSxcbiAgICAgICAgICAndGltZScgOiBEYXRlLm5vdygpLFxuICAgICAgICAgICd4JyA6IHRoaXMubW92ZVgsXG4gICAgICAgICAgJ3knIDogdGhpcy55XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndXAnOlxuICAgICAgYWxsUm9ja3MuZm9yRWFjaChmdW5jdGlvbihyb2NrKSB7XG4gICAgICAgIGlmKCByb2NrLnggPT09IHRoaXNYICkge1xuICAgICAgICAgIGlmKCByb2NrLnkgPT09ICh0aGlzWSAtIDEpICl7XG4gICAgICAgICAgICBvYnN0cnVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYoIW9ic3RydWN0ZWQgJiYgdGhpcy55ID4gMCAmJiAhdGhpcy5tb3ZpbmcpIHtcbiAgICAgICAgdGhpcy5tb3ZlRGlyZWN0aW9uID0gJ3VwJztcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLm1vdmVZIC09IDE7XG4gICAgICAgIHRoaXMubW92ZW1lbnRzLnB1c2goe1xuICAgICAgICAgICdrZXlDb2RlJzoga2V5Q29kZSxcbiAgICAgICAgICAndGltZScgOiBEYXRlLm5vdygpLFxuICAgICAgICAgICd4JyA6IHRoaXMueCxcbiAgICAgICAgICAneScgOiB0aGlzLnlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICBhbGxSb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uKHJvY2spIHtcbiAgICAgICAgaWYoIHJvY2sueSA9PT0gdGhpc1kgKSB7XG4gICAgICAgICAgaWYoIHJvY2sueCA9PT0gKHRoaXNYICsgMSkgKXtcbiAgICAgICAgICAgIG9ic3RydWN0ZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZighb2JzdHJ1Y3RlZCAmJiB0aGlzLnggPCA0ICYmICF0aGlzLm1vdmluZykge1xuICAgICAgICB0aGlzLm1vdmVEaXJlY3Rpb24gPSAncmlnaHQnO1xuICAgICAgICB0aGlzLm1vdmluZyA9IHRydWU7XG4gICAgICAgIHRoaXMubW92ZVggKz0gMTtcbiAgICAgICAgdGhpcy5tb3ZlbWVudHMucHVzaCh7XG4gICAgICAgICAgJ2tleUNvZGUnOiBrZXlDb2RlLFxuICAgICAgICAgICd0aW1lJyA6IERhdGUubm93KCksXG4gICAgICAgICAgJ3gnIDogdGhpcy5tb3ZlWCxcbiAgICAgICAgICAneScgOiB0aGlzLnlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkb3duJzpcbiAgICAgIGFsbFJvY2tzLmZvckVhY2goZnVuY3Rpb24ocm9jaykge1xuICAgICAgICBpZiggcm9jay54ID09PSB0aGlzWCApIHtcbiAgICAgICAgICBpZiggcm9jay55ID09PSAodGhpc1kgKyAxKSApe1xuICAgICAgICAgICAgb2JzdHJ1Y3RlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmKCFvYnN0cnVjdGVkICYmIHRoaXMueSA8IDUgJiYgIXRoaXMubW92aW5nKSB7XG4gICAgICAgIHRoaXMubW92ZURpcmVjdGlvbiA9ICdkb3duJztcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLm1vdmVZICs9IDE7XG4gICAgICAgIHRoaXMubW92ZW1lbnRzLnB1c2goe1xuICAgICAgICAgICdrZXlDb2RlJzoga2V5Q29kZSxcbiAgICAgICAgICAndGltZScgOiBEYXRlLm5vdygpLFxuICAgICAgICAgICd4JyA6IHRoaXMueCxcbiAgICAgICAgICAneScgOiB0aGlzLnlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgfVxufVxuXG4vLyBSb2NrIG9iamVjdCB0aGF0IGNhbid0IGJlIG1vdmVkIG9uIGJ5IHBsYXllclxudmFyIFJvY2sgPSBmdW5jdGlvbihpbWFnZSkge1xuICB0aGlzLnNwcml0ZSA9IGltYWdlO1xuICB0aGlzLnggPSBnZXRSYW5kb21JbnQoMCwgNSk7XG4gIHRoaXMueSA9IDQ7XG59XG5cblJvY2sucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICBjdHguZHJhd0ltYWdlKFJlc291cmNlcy5nZXQodGhpcy5zcHJpdGUpLCB0aGlzLnggKiBjb2xXaWR0aCwgdGhpcy55ICogcm93SGVpZ2h0IC0gb2Zmc2V0WSk7XG59XG5cbi8vIEluc3RhbnRpYXRlIGdhbWUgb2JqZWN0c1xudmFyIGFsbEVuZW1pZXMgPSBbIG5ldyBFbmVteSgxLCAtMSksIG5ldyBFbmVteSgyLCAtMiksIG5ldyBFbmVteSgyLCAtMyksIG5ldyBFbmVteSg0LCAtNCksIG5ldyBFbmVteSg0LCAtNSldLFxuICAgIGFsbFJvY2tzID0gW25ldyBSb2NrKCdhc3NldHMvaW1nL3JvY2sucG5nJyldLFxuICAgIHBsYXllciA9IG5ldyBQbGF5ZXIoJ2Fzc2V0cy9pbWcvY2hhci1ib3kucG5nJyksXG4gICAgYm94ID0gbmV3IEl0ZW0oJ2Fzc2V0cy9pbWcvZ2VtLWJsdWUucG5nJywgJ2luZGllYm94JyksXG4gICAgZ29hbCA9IG5ldyBHb2FsKCdhc3NldHMvaW1nL3N0YXIucG5nJyksXG4gICAgaGVhcnQgPSBuZXcgSXRlbSgnYXNzZXRzL2ltZy9oZWFydC5wbmcnLCAnaGVhcnQnKTtcblxuXG4vLyBMaXN0ZW4gZm9yIGtleSBwcmVzc2VzIGFuZCBzZW5kcyB0aGUga2V5cyB0byBQbGF5ZXIuaGFuZGxlSW5wdXQoKVxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGFsbG93ZWRLZXlzID0ge1xuICAgICAgICAzNzogJ2xlZnQnLFxuICAgICAgICAzODogJ3VwJyxcbiAgICAgICAgMzk6ICdyaWdodCcsXG4gICAgICAgIDQwOiAnZG93bidcbiAgICB9O1xuICAgIHBsYXllci5oYW5kbGVJbnB1dChhbGxvd2VkS2V5c1tlLmtleUNvZGVdKTtcbn0pO1xuIl19
