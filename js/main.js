// Generated by CoffeeScript 1.9.3
(function() {
  var BranchShape, DrawingCanvas, LeaveShape, Shape, Tree,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

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

    DrawingCanvas.prototype.clear = function(color) {
      this.ctx.fillStyle = color;
      return this.ctx.fillRect(0, 0, this.el.width, this.el.height);
    };

    return DrawingCanvas;

  })();

  $(function() {
    var branches, general, gui, leaves, tree;
    tree = new Tree;
    tree.generate();
    gui = new dat.GUI;
    branches = gui.addFolder('branches');
    branches.add(tree.branch_parameters, 'up_growing', 0, 200);
    branches.add(tree.branch_parameters, 'down_growing', 0, 200);
    branches.add(tree.branch_parameters, 'depth', 1, 10).step(1);
    branches.addColor(tree.branch_parameters, 'color');
    branches.add(tree.branch_parameters, 'hue_variance', 0, 20);
    branches.add(tree.branch_parameters, 'saturation_variance', 0, 50);
    branches.add(tree.branch_parameters, 'value_variance', 0, 50);
    leaves = gui.addFolder('leaves');
    leaves.add(tree.leaves_parameters, 'squareness', 0, 100);
    leaves.add(tree.leaves_parameters, 'depth', 0, 10).step(1);
    leaves.addColor(tree.leaves_parameters, 'color');
    leaves.add(tree.leaves_parameters, 'hue_variance', 0, 50);
    leaves.add(tree.leaves_parameters, 'saturation_variance', 0, 50);
    leaves.add(tree.leaves_parameters, 'value_variance', 0, 50);
    general = gui.addFolder('trunk');
    general.add(tree.trunk_parameters, 'width', 0, tree.trunk_parameters.width * 4);
    general.add(tree.trunk_parameters, 'height', 0, tree.trunk_parameters.width * 4);
    gui.add(tree.general_parameters, 'growing_time', 0, 1000);
    gui.addColor(tree.general_parameters, 'background');
    return gui.add(tree, 'generate');
  });

  Shape = (function() {
    Shape.prototype.addAngle = Math.PI / 4;

    function Shape(tree1, position1, size1, depth) {
      this.tree = tree1;
      this.position = position1;
      this.size = size1;
      this.depth = depth != null ? depth : 1;
      this.divide = bind(this.divide, this);
      this.currentTree = this.tree._currentTree;
    }

    Shape.prototype.draw = function(ctx) {
      this.ctx = ctx;
      this.setColors();
      this.ctx.fillStyle = "hsl(" + this.hue + ", " + (this.saturation * 100) + "%, " + (this.value * 100) + "%)";
      this.ctx.translate(this.position.x, this.position.y);
      this.ctx.rotate(-this.position.angle);
      this.ctx.fillRect(0, 0, this.size.width, -this.size.height);
      this.ctx.rotate(this.position.angle);
      return this.ctx.translate(-this.position.x, -this.position.y);
    };

    Shape.prototype.limitReached = function() {
      return this.currentTree !== this.tree._currentTree || this.depth >= this.tree.branch_parameters.depth + this.tree.leaves_parameters.depth;
    };

    Shape.prototype.divide = function() {
      var i, len, ref, results, shape, timeout;
      if (!this.limitReached()) {
        ref = this.childrenShapes();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          shape = ref[i];
          shape.draw(this.ctx);
          timeout = jStat.exponential.sample(1 / this.tree.general_parameters.growing_time);
          results.push(setTimeout(shape.divide, timeout));
        }
        return results;
      }
    };

    Shape.prototype.childrenShapes = function() {
      var leftShape, rightShape;
      leftShape = this.leftShape();
      rightShape = this.rightShape(leftShape);
      return [leftShape, rightShape];
    };

    Shape.prototype.isGoingDown = function(angle) {
      return Math.cos(angle) < 0;
    };

    Shape.prototype.leftShape = function() {
      var leftShapePosition, leftShapeSize;
      leftShapePosition = {
        x: this.position.x + Math.cos(Math.PI / 2 + this.position.angle) * this.size.height,
        y: this.position.y - Math.sin(Math.PI / 2 + this.position.angle) * this.size.height,
        angle: this.position.angle + this.addAngle
      };
      leftShapeSize = {
        width: this.size.width * Math.cos(this.addAngle),
        height: this.childHeight() * this.heightMultiplier(leftShapePosition)
      };
      if (this.depth >= this.tree.branch_parameters.depth) {
        return new LeaveShape(this.tree, leftShapePosition, leftShapeSize, this.depth + 1);
      } else {
        return new BranchShape(this.tree, leftShapePosition, leftShapeSize, this.depth + 1);
      }
    };

    Shape.prototype.rightShape = function(leftShape) {
      var rightShapePosition, rightShapeSize;
      rightShapePosition = {
        x: leftShape.position.x + Math.cos(leftShape.position.angle) * leftShape.size.width,
        y: leftShape.position.y - Math.sin(leftShape.position.angle) * leftShape.size.width,
        angle: this.position.angle + this.addAngle - Math.PI / 2
      };
      rightShapeSize = {
        width: this.size.width * Math.sin(this.addAngle),
        height: this.childHeight() * this.heightMultiplier(rightShapePosition)
      };
      if (this.depth >= this.tree.branch_parameters.depth) {
        return new LeaveShape(this.tree, rightShapePosition, rightShapeSize, this.depth + 1);
      } else {
        return new BranchShape(this.tree, rightShapePosition, rightShapeSize, this.depth + 1);
      }
    };

    Shape.prototype.setColors = function(shape_type) {
      var saturation_beta_parameter, saturation_inverse_variance, value_beta_parameter, value_inverse_variance;
      this.hue = jStat.normal.sample(this.tree[shape_type].color.h, this.tree[shape_type].hue_variance);
      saturation_beta_parameter = (1 - this.tree[shape_type].color.s) / this.tree[shape_type].color.s;
      saturation_inverse_variance = 51 - this.tree[shape_type].saturation_variance;
      this.saturation = jStat.beta.sample(saturation_inverse_variance, saturation_inverse_variance * saturation_beta_parameter);
      value_beta_parameter = (1 - this.tree[shape_type].color.v) / this.tree[shape_type].color.v;
      value_inverse_variance = 51 - this.tree[shape_type].value_variance;
      return this.value = jStat.beta.sample(value_inverse_variance, value_inverse_variance * value_beta_parameter);
    };

    return Shape;

  })();

  BranchShape = (function(superClass) {
    extend(BranchShape, superClass);

    function BranchShape() {
      return BranchShape.__super__.constructor.apply(this, arguments);
    }

    BranchShape.prototype.beta = 25;

    BranchShape.prototype.heightMultiplier = function(position) {
      if (this.isGoingDown(position.angle)) {
        return jStat.beta.sample(this.tree.branch_parameters.down_growing, this.beta);
      } else {
        return jStat.beta.sample(this.tree.branch_parameters.up_growing, this.beta);
      }
    };

    BranchShape.prototype.childHeight = function() {
      if (this.depth < this.tree.branch_parameters.depth) {
        return this.size.height;
      } else {
        return this.size.width;
      }
    };

    BranchShape.prototype.setColors = function() {
      return BranchShape.__super__.setColors.call(this, 'branch_parameters');
    };

    return BranchShape;

  })(Shape);

  LeaveShape = (function(superClass) {
    extend(LeaveShape, superClass);

    function LeaveShape() {
      return LeaveShape.__super__.constructor.apply(this, arguments);
    }

    LeaveShape.prototype.heightMultiplier = function(position) {
      return 1 + 2 * jStat.beta.sample(100.1 - this.tree.leaves_parameters.squareness, 100);
    };

    LeaveShape.prototype.childHeight = function() {
      return this.size.width;
    };

    LeaveShape.prototype.setColors = function() {
      return LeaveShape.__super__.setColors.call(this, 'leaves_parameters');
    };

    return LeaveShape;

  })(Shape);

  Tree = (function() {
    function Tree() {
      this.generate = bind(this.generate, this);
      var min;
      this.canvas = new DrawingCanvas($('canvas'));
      this.general_parameters = {
        growing_time: 200,
        background: "#ffffff"
      };
      min = Math.min(this.canvas.el.height, this.canvas.el.width);
      this.trunk_parameters = {
        width: min * 0.08,
        height: min * 0.08 * 16 / 9
      };
      this.branch_parameters = {
        up_growing: 50,
        down_growing: 50,
        depth: 7,
        color: {
          h: 40,
          s: 0.9,
          v: 0.3
        },
        hue_variance: 5,
        saturation_variance: 30,
        value_variance: 10
      };
      this.leaves_parameters = {
        depth: 4,
        squareness: 50,
        color: {
          h: 115,
          s: 0.9,
          v: 0.3
        },
        hue_variance: 10,
        saturation_variance: 10,
        value_variance: 10
      };
    }

    Tree.prototype.generate = function() {
      var shapePosition, size;
      this._currentTree = Math.random();
      this.canvas.clear(this.general_parameters.background);
      size = {
        width: this.trunk_parameters.width,
        height: this.trunk_parameters.height
      };
      shapePosition = {
        x: this.canvas.el.width / 2 - size.width / 2,
        y: this.canvas.el.height * 0.9,
        angle: 0
      };
      this.baseShape = new BranchShape(this, shapePosition, size);
      return this.draw();
    };

    Tree.prototype.draw = function() {
      this.baseShape.draw(this.canvas.ctx);
      return this.baseShape.divide();
    };

    return Tree;

  })();

}).call(this);
