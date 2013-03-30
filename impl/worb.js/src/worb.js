/* Incomplete implementation of noit o' mnain worb w/yoob.js */

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
      
        var e = pf.get(newX, newY);
        /*
        If e is a bobule or a wall, continue.
        If e is a <>^v gate, check delta.
        */
        pf.put(this.x, this.y, undefined);
        this.pressure = 1;
        this.x = newX;
        this.y = newY;
        pf.put(this.x, this.y, this);
    };

    this.draw = function(ctx) {
    };
};

NoitOMnainWorb = function() {
    this.init = function(canvas) {
        this.pf = new yoob.Playfield();
    };
};
