/*
 * worb.js -- An implementation of noit o' mnain worb, using yoob.js
 * requires the following classes to be sourced before this file:
 * yoob.Controller
 * yoob.Playfield
 */

/*
 * Copyright (c)2013, Chris Pressey, Cat's Eye Technologies.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 *
 *   Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in
 *   the documentation and/or other materials provided with the
 *   distribution.
 *
 *   Neither the name of Cat's Eye Technologies nor the names of its
 *   contributors may be used to endorse or promote products derived
 *   from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT HOLDERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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

    this.draw = function(ctx, px, py, x, y, w, h) {
        ctx.fillStyle = "rgba(0,0," + (255-(this.pressure * 25)) + ",1.0)";
        ctx.fillRect(x, y, w, h);
    };
};

Wall = function() {
    this.draw = function(ctx, px, py, x, y, w, h) {
        ctx.fillStyle = "brown";
        ctx.fillRect(x, y, w, h);
    };
};

Diode = function() {
    this.init = function(dx, dy) {
        this.dx = dx;
        this.dy = dy;
    };

    this.draw = function(ctx, px, py, x, y, w, h) {
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
    this.draw = function(ctx, px, py, x, y, w, h) {
        ctx.fillStyle = "green";
        ctx.fillRect(x, y, w, h);
    };
};

Sink = function() {
    this.draw = function(ctx, px, py, x, y, w, h) {
        ctx.fillStyle = "red";
        ctx.fillRect(x, y, w, h);
    };
};

Load = function() {
    this.draw = function(ctx, px, py, x, y, w, h) {
        ctx.fillStyle = "cyan";
        ctx.fillRect(x, y, w, h);
    };
};

/*
 * Adapter on top of yoob.Playfield
 */
WorbPlayfield = function() {
    this.init = function(cfg) {
        this.worldPf = new yoob.Playfield().init({});
        this.bobulePf = new yoob.Playfield().init({});
        this.cursors = [];
        return this;
    };

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
                } else if (c === '>') {
                    var g = new Diode();
                    g.init(1, 0);
                    this.put(lx, ly, g);
                } else if (c === '<') {
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
     * x, y, value.
     * This function ensures a particular order.
     */
    this.foreach = function(fun) {
        /* TODO have less knowledge of the innards of yoob.Playfield */
        for (var y = this.worldPf.minY; y <= this.worldPf.maxY; y++) {
            for (var x = this.worldPf.minX; x <= this.worldPf.maxX; x++) {
                var value = this.get(x, y);
                if (value === undefined)
                    continue;
                fun(x, y, value);
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
        this.foreach(function (x, y, elem) {
            elem.draw(ctx, offsetX + x * cellWidth, offsetY + y * cellHeight,
                           cellWidth, cellHeight);
        });
    };

    this.getLowerX = function() {
        return this.worldPf.getLowerX();
    };

    this.getUpperX = function() {
        return this.worldPf.getUpperX();
    };

    this.getLowerY = function() {
        return this.worldPf.getLowerY();
    };

    this.getUpperY = function() {
        return this.worldPf.getUpperY();
    };

    this.getCursoredExtentX = function() {
        return this.worldPf.getCursoredExtentX();
    };

    this.getCursoredExtentY = function() {
        return this.worldPf.getCursoredExtentY();
    };
};

var proto = new yoob.Controller();
WorbController = function() {
    this.step = function() {
        var underLoad = false;
        var pf = this.pf;
        this.view.draw();
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
            } else if (elem instanceof Load) {
                b = pf.get(x, y);
                if (b instanceof Bobule) {
                    underLoad = true;
                }
            }
        });
        if (this.onstep !== undefined) {
            this.onstep(underLoad);
        }
    };

    this.reset = function(text) {
        this.pf.clear();
        this.pf.load(0, 0, text);
        this.view.draw();
    };

    this.init = function(cfg) {
        proto.init.apply(this, [cfg]);
        this.pf = new WorbPlayfield().init({});
        cfg.view.setPlayfield(this.pf);
        this.view = cfg.view;
        return this;
    };
};
WorbController.prototype = proto;
