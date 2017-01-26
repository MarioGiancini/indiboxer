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
