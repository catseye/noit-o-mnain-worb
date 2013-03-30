/*
 * requires yoob.Playfield
 */

/* An implementation of noit o' mnain worb, using yoob.js */

Bobule = function() {
    this.pressure = 1;

    this.move = function(pf, x, y) {
        this.pressure++;
  
        var newX = x + (Math.floor(Math.random() * 3) - 1);
        var newY = y + (Math.floor(Math.random() * 3) - 1);
      
        var e = pf.get(newX, newY);
        if (e instanceof Bobule || e instanceof Wall) {
            return;
        }
        if (e instanceof Diode) {
            var dx = e.dx;
            var dy = e.dy;
            if (dx === -1 && newX > x) return;
            if (dx === 1 && newX < x) return;
            if (dy === -1 && newY > y) return;
            if (dy === 1 && newY < y) return;
        }
        pf.put(x, y, undefined);
        this.pressure = 1;
        pf.put(newX, newY, this);
    };

    this.draw = function(ctx, x, y, w, h) {
        ctx.fillStyle = "rgba(0,0," + (255-(this.pressure * 25)) + ",1.0)";
        ctx.fillRect(x, y, w, h);
    };
};

Wall = function() {
    this.draw = function(ctx, x, y, w, h) {
        ctx.fillStyle = "brown";
        ctx.fillRect(x, y, w, h);
    };
};

Diode = function() {
    this.init = function(dx, dy) {
        this.dx = dx;
        this.dy = dy;
    };

    this.draw = function(ctx, x, y, w, h) {
        ctx.fillStyle = "yellow";
        ctx.fillRect(x, y, w, h);
        ctx.beginPath();
        ctx.fillStyle = "orange";
        if (this.dx === 0 && this.dy === -1) {
            ctx.lineTo(x + (w*0.25), y + (h*0.75));
            ctx.lineTo(x + (w/2), y + (h*0.25));
            ctx.lineTo(x + (w*0.75), y + (h*0.75));
        } else if (this.dx === 0 && this.dy === 1) {
            ctx.lineTo(x + (w*0.25), y + (h*0.25));
            ctx.lineTo(x + (w/2), y + (h*0.75));
            ctx.lineTo(x + (w*0.75), y + (h*0.25));
        } else if (this.dx === 1 && this.dy === 0) {
            ctx.lineTo(x + (w*0.25), y + (h*0.25));
            ctx.lineTo(x + (w*0.75), y + (h*0.50));
            ctx.lineTo(x + (w*0.25), y + (h*0.75));
        } else if (this.dx === -1 && this.dy === 0) {
            ctx.lineTo(x + (w*0.75), y + (h*0.25));
            ctx.lineTo(x + (w*0.25), y + (h*0.50));
            ctx.lineTo(x + (w*0.75), y + (h*0.75));
        }
        ctx.closePath();
        ctx.fill();
    };
};

Source = function() {
    this.draw = function(ctx, x, y, w, h) {
        ctx.fillStyle = "green";
        ctx.fillRect(x, y, w, h);
    };
};

Sink = function() {
    this.draw = function(ctx, x, y, w, h) {
        ctx.fillStyle = "red";
        ctx.fillRect(x, y, w, h);
    };
};

Load = function() {
    this.draw = function(ctx, x, y, w, h) {
        ctx.fillStyle = "cyan";
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

    this.put = function(x, y, value) {
        if (value === undefined) {
            this.bobulePf.put(x, y, undefined);
        } else if (value instanceof Bobule) {
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
                    this.put(lx, ly, new Bobule());
                } else if (c === '#') {
                    this.put(lx, ly, new Wall());
                } else if (c === '+') {
                    this.put(lx, ly, new Source());
                } else if (c === '-') {
                    this.put(lx, ly, new Sink());
                } else if (c === '!') {
                    this.put(lx, ly, new Load());
                } else if (c === '>' || c === ')') {
                    var g = new Diode();
                    g.init(1, 0);
                    this.put(lx, ly, g);
                } else if (c === '<' || c === '(') {
                    var g = new Diode();
                    g.init(-1, 0);
                    this.put(lx, ly, g);
                } else if (c === '^') {
                    var g = new Diode();
                    g.init(0, -1);
                    this.put(lx, ly, g);
                } else if (c === 'v') {
                    var g = new Diode();
                    g.init(0, 1);
                    this.put(lx, ly, g);
                }
                lx++;
            }
        }
    };

    /*
     * Iterate over every defined cell in the Playfield.
     * fun is a callback which takes three parameters:
     * x, y, value.  If this callback returns a value,
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

    this.foreachBobule = function(fun) {
        this.bobulePf.foreach(fun);
    };

    this.foreachWorld = function(fun) {
        this.worldPf.foreach(fun);
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
    var canvas;
    var ctx;
    var intervalId = undefined;
    var cellWidth = 16;
    var cellHeight = 16;

    this.draw = function() {
        canvas.width = (this.pf.worldPf.max_x - this.pf.worldPf.min_x + 1) * cellWidth;
        canvas.height = (this.pf.worldPf.max_y - this.pf.worldPf.min_y + 1) * cellHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.pf.drawContext(ctx, 0, 0, cellWidth, cellHeight);
    };

    this.step = function() {
        var pf = this.pf;
        this.draw();
        pf.foreachBobule(function (x, y, elem) {
            elem.move(pf, x, y);
        });
        pf.foreachWorld(function (x, y, elem) {
            var b;
            if (elem instanceof Sink) {
                b = pf.get(x, y);
                if (b instanceof Bobule && Math.random() <= 0.10) {
                    pf.put(x, y, undefined);
                }
            } else if (elem instanceof Source) {
                b = pf.get(x, y);
                if (!(b instanceof Bobule) && Math.random() <= 0.10) {
                    pf.put(x, y, new Bobule());
                }
            }
        });
    };

    this.start = function() {
        if (intervalId !== undefined)
            return;
        this.step();
        var self = this;
        intervalId = setInterval(function() { self.step(); }, 100);
    };

    this.stop = function() {
        if (intervalId === undefined)
            return;
        clearInterval(intervalId);
        intervalId = undefined;
    };

    this.load = function(textarea) {
        this.stop();
        this.pf.clear();
        this.pf.load(0, 0, textarea.value);
        this.draw();
    };

    this.init = function(c) {
        canvas = c;
        ctx = canvas.getContext('2d');
        this.pf = new WorbPlayfield();
    };
};
