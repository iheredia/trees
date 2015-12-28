// Generated by CoffeeScript 1.9.3
(function() {
  var DrawingCanvas, Rectangle, Tree,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  DrawingCanvas = (function() {
    function DrawingCanvas($el) {
      this.$el = $el;
      this.setSizes = bind(this.setSizes, this);
      this.el = this.$el[0];
      $(window).resize(this.setSizes);
      this.setSizes();
      this.ctx = this.el.getContext('2d');
    }

    DrawingCanvas.prototype.setSizes = function() {
      if (this.el.width !== this.$el.width()) {
        this.el.width = this.$el.width();
      }
      if (this.el.height !== this.$el.height()) {
        return this.el.height = this.$el.height();
      }
    };

    DrawingCanvas.prototype.clear = function() {
      return this.ctx.clearRect(0, 0, this.el.width, this.el.height);
    };

    return DrawingCanvas;

  })();

  $(function() {
    var gui, tree;
    tree = new Tree;
    tree.generate();
    gui = new dat.GUI;
    return gui.add(tree, 'generate');
  });

  Rectangle = (function() {
    function Rectangle(position, size1, style1) {
      this.position = position;
      this.size = size1;
      this.style = style1;
      this.divide = bind(this.divide, this);
    }

    Rectangle.prototype.brownHue = 40;

    Rectangle.prototype.greenHue = 115;

    Rectangle.prototype.saturation = 90;

    Rectangle.prototype.draw = function(ctx) {
      var brightness, hue;
      this.ctx = ctx;
      hue = (this.style.hue || this.brownHue) + Math.random() * 20 - 10;
      brightness = Math.random() * 20 + 25;
      this.ctx.fillStyle = "hsl(" + hue + ", " + this.saturation + "%, " + brightness + "%)";
      this.ctx.translate(this.position.x, this.position.y);
      this.ctx.rotate(-this.position.angle);
      this.ctx.fillRect(0, 0, this.size.width, -this.size.height);
      this.ctx.rotate(this.position.angle);
      return this.ctx.translate(-this.position.x, -this.position.y);
    };

    Rectangle.prototype.addAngle = Math.PI / 4;

    Rectangle.prototype.divide = function() {
      var leftRect, leftRectPosition, leftRectSize, mean, rightRect, rightRectPosition, rightRectSize, style;
      style = {
        layer: this.style.layer + 1,
        hue: this.style.layer < 5 ? this.brownHue : this.greenHue
      };
      leftRectPosition = {
        x: this.position.x + Math.cos(Math.PI / 2 + this.position.angle) * this.size.height,
        y: this.position.y - Math.sin(Math.PI / 2 + this.position.angle) * this.size.height,
        angle: this.position.angle + this.addAngle
      };
      leftRectSize = {
        width: this.size.width * Math.cos(this.addAngle),
        height: this.size.height * jStat.beta.sample(12, 4)
      };
      leftRect = new Rectangle(leftRectPosition, leftRectSize, style);
      leftRect.draw(this.ctx);
      rightRectPosition = {
        x: leftRect.position.x + Math.cos(leftRect.position.angle) * leftRect.size.width,
        y: leftRect.position.y - Math.sin(leftRect.position.angle) * leftRect.size.width,
        angle: this.position.angle + this.addAngle - Math.PI / 2
      };
      rightRectSize = {
        width: this.size.width * Math.sin(this.addAngle),
        height: this.size.height * jStat.beta.sample(12, 4)
      };
      rightRect = new Rectangle(rightRectPosition, rightRectSize, style);
      rightRect.draw(this.ctx);
      if (this.style.layer < 10) {
        mean = 200;
        setTimeout(leftRect.divide, jStat.exponential.sample(1 / mean));
        return setTimeout(rightRect.divide, jStat.exponential.sample(1 / mean));
      }
    };

    return Rectangle;

  })();

  Tree = (function() {
    function Tree() {
      this.generate = bind(this.generate, this);
      this.canvas = new DrawingCanvas($('canvas'));
    }

    Tree.prototype.generate = function() {
      var min, rectPosition, size, style;
      this.canvas.clear();
      min = Math.min(this.canvas.el.height, this.canvas.el.width);
      size = {
        width: min * 0.08,
        height: min * 0.08 * 16 / 9
      };
      rectPosition = {
        x: this.canvas.el.width / 2 - size.width / 2,
        y: this.canvas.el.height * 0.9,
        angle: 0
      };
      style = {
        layer: 0
      };
      this.baseRect = new Rectangle(rectPosition, size, style);
      return this.draw();
    };

    Tree.prototype.draw = function() {
      this.baseRect.draw(this.canvas.ctx);
      return this.baseRect.divide();
    };

    return Tree;

  })();

}).call(this);
