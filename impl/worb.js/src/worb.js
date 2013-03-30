/*
 * requires yoob.Playfield
 */

/* Incomplete implementation of noit o' mnain worb w/yoob.js */

var program =
  "######################\n" +
  "#..........          #\n" +
  "#..........          #\n" +
  "#..........          #\n" +
  "#..........          #\n" +
  "#..........          #\n" +
  "#..........          #\n" +
  "#..........          #\n" +
  "#..........          #\n" +
  "#..........          #\n" +
  "#..........          #\n" +
  "######################\n";


Bobule = function() {
    this.init = function(x, y) {
        this.pressure = 1;
        this.x = x;
        this.y = y;
    };

    this.move = function(pf) {
        this.pressure++;
  
        var newX = this.x + (Math.floor(Math.random() * 3) - 1);
        var newY = this.y + (Math.floor(Math.random() * 3) - 1);
      
        //alert(this.x+','+this.y);
        var e = pf.get(newX, newY);
        if (e instanceof Bobule || e instanceof Wall) {
            return;
        }
        /*
        If e is a <>^v gate, check delta.
        */
        pf.del(this.x, this.y);
        this.pressure = 1;
        this.x = newX;
        this.y = newY;
        pf.put(this.x, this.y, this);
    };

    this.draw = function(ctx, x, y, w, h) {
        ctx.fillStyle = "rgba(0,0," + (255-this.pressure) + ",1.0)";
        ctx.fillRect(x, y, w, h);
    };
};

Wall = function() {
    this.init = function(x, y) {
    };

    this.draw = function(ctx, x, y, w, h) {
        ctx.fillStyle = "red";
        ctx.fillRect(x, y, w, h);
    };
};

/*
 * Adapter on top of yoob.Playfield
 */
WorbPlayfield = function() {
    this.worldPf = new yoob.Playfield();
    this.bobulePf = new yoob.Playfield();

    this.get = function(x, y) {
        var e = this.bobulePf.get(x, y);
        if (e === undefined) {
            e = this.worldPf.get(x, y);
        }
        return e;
    };

    this.del = function(x, y) {
        this.bobulePf.put(x, y, undefined);
    };

    this.put = function(x, y, value) {
        if (value instanceof Bobule) {
            var e = this.bobulePf.get(x, y);
            if (e === undefined) {
                this.bobulePf.put(x, y, value);
            } else {
                alert("Error! Can't overwrite bobule");
            }
        } else {
            this.worldPf.put(x, y, value);
        }
    };

    /*
     * Clear the contents of this Playfield.
     */
    this.clear = function() {
        this.bobulePf.clear();
        this.worldPf.clear();
    };
          
    /*
     * Load a string into the playfield.
     * The string may be multiline, with newline (ASCII 10)
     * characters delimiting lines.  ASCII 13 is ignored.
     */
    this.load = function(x, y, string) {
        var lx = x;
        var ly = y;
        for (var i = 0; i < string.length; i++) {
            var c = string.charAt(i);
            if (c === '\n') {
                lx = x;
                ly++;
            } else if (c === ' ') {
                this.put(lx, ly, undefined);
                lx++;
            } else if (c === '\r') {
            } else {
                if (c === '.') {
                    var b = new Bobule();
                    b.init(lx, ly);
                    this.put(lx, ly, b);
                } else if (c === '#') {
                    this.put(lx, ly, new Wall());
                }
                lx++;
            }
        }
    };

    /*
     * Iterate over every defined cell in the Playfield.
     * fun is a callback which takes three parameters:
     * x, y, and value.  If this callback returns a value,
     * it is written into the Playfield at that position.
     * This function ensures a particular order.
     */
    this.foreach = function(fun) {
        for (var y = this.worldPf.min_y; y <= this.worldPf.max_y; y++) {
            for (var x = this.worldPf.min_x; x <= this.worldPf.max_x; x++) {
                var value = this.get(x, y);
                if (value === undefined)
                    continue;
                var result = fun(x, y, value);
                if (result !== undefined) {
                    if (result === ' ') {
                        result = undefined;
                    }
                    this.put(x, y, result);
                }
            }
        }
    };

    /*
     * Draws the Playfield in a drawing context.
     * cellWidth and cellHeight are canvas units of measure for each cell.
     */
    this.drawContext = function(ctx, offsetX, offsetY, cellWidth, cellHeight) {
        var me = this;
        this.foreach(function (x, y, elem) {
            elem.draw(ctx, offsetX + x * cellWidth, offsetY + y * cellHeight,
                           cellWidth, cellHeight);
        });
    };
};


NoitOMnainWorb = function() {
    var ctx;
    var intervalId = undefined;

    this.step = function() {
        var pf = this.pf;
        pf.drawContext(ctx, 0, 0, 16, 16);
        pf.foreach(function (x, y, elem) {
            if (elem instanceof Bobule) {
                elem.move(pf);
            }
        });
    };

    this.start = function() {
        if (intervalId !== undefined)
            return;
        this.step();
        var self = this;
        interval_id = setInterval(function() { self.step(); }, 100);
    }

    this.stop = function() {
        if (intervalId === undefined)
            return;
        clearInterval(intervalId);
        intervalId = undefined;
    }

    this.init = function(canvas) {
        ctx = canvas.getContext('2d');
        this.pf = new WorbPlayfield();
        this.pf.load(0, 0, program);
        this.start();
    };
};
