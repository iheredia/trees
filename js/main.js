// Generated by CoffeeScript 1.9.3
(function() {
  var BranchShape, DrawingCanvas, LeaveShape, Shape, Tree, beta_sample_for,
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

  beta_sample_for = function(mean, variance) {
    var alpha, beta;
    alpha = ((1 - mean) / variance - 1 / mean) * mean * mean;
    beta = alpha * (1 / mean - 1);
    return jStat.beta.sample(alpha, beta);
  };

  $(function() {
    var branches, general, growth, gui, leaves, tree;
    tree = new Tree;
    tree.generate();
    gui = new dat.GUI({
      load: {
        "preset": "tree",
        "closed": false,
        "remembered": {
          "tree": {
            "0": {
              "growing_time": 200,
              "background": "#ffffff",
              "clean_canvas": true,
              "shape": "rects"
            },
            "1": {
              "up_growing": 150,
              "down_growing": 20,
              "depth": 7,
              "color": {
                "h": 40,
                "s": 0.9,
                "v": 0.3
              },
              "hue_variance": 5,
              "saturation_variance": 30,
              "value_variance": 10
            },
            "2": {
              "depth": 5,
              "squareness": 50,
              "color": {
                "h": 115,
                "s": 0.9,
                "v": 0.3
              },
              "hue_variance": 10,
              "saturation_variance": 10,
              "value_variance": 10
            },
            "3": {
              "width": 60,
              "height": 110
            },
            "4": {
              "split_direction": 90,
              "split_variance": 0.5
            }
          },
          "ellipsis": {
            "0": {
              "growing_time": 200,
              "background": "#6a9aa4",
              "shape": "ellipsis",
              "clean_canvas": true
            },
            "1": {
              "up_growing": 200,
              "down_growing": 103.6704866667622,
              "depth": 6,
              "color": {
                "h": 201.1764705882353,
                "s": 0.9,
                "v": 0.3
              },
              "hue_variance": 5.514387588657563,
              "saturation_variance": 27.020499184422057,
              "value_variance": 28.123376702153575
            },
            "2": {
              "squareness": 16.543162765972692,
              "depth": 5,
              "color": {
                "h": 282.3529411764706,
                "s": 0.9,
                "v": 0.3
              },
              "hue_variance": 10,
              "saturation_variance": 10,
              "value_variance": 10
            },
            "3": {
              "width": 50,
              "height": 70
            },
            "4": {
              "split_direction": 90,
              "split_variance": 0.1519403365320457
            }
          }
        }
      }
    });
    gui.remember(tree.general_parameters);
    gui.remember(tree.branch_parameters);
    gui.remember(tree.leaves_parameters);
    gui.remember(tree.trunk_parameters);
    gui.remember(tree.growth_parameters);
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
    general.add(tree.trunk_parameters, 'position_x', 0, 100);
    general.add(tree.trunk_parameters, 'position_y', 0, 100);
    growth = gui.addFolder('growth');
    growth.add(tree.growth_parameters, 'split_direction', 1, 180);
    growth.add(tree.growth_parameters, 'split_variance', 0.01, 1);
    gui.add(tree.general_parameters, 'growing_time', 0, 1000);
    gui.addColor(tree.general_parameters, 'background');
    gui.add(tree.general_parameters, 'shape', ['rects', 'ellipsis']);
    gui.add(tree.general_parameters, 'clean_canvas');
    return gui.add(tree, 'generate');
  });

  Shape = (function() {
    function Shape(tree1, position, size1, depth) {
      this.tree = tree1;
      this.position = position;
      this.size = size1;
      this.depth = depth != null ? depth : 1;
      this.divide = bind(this.divide, this);
      this.drawEllipsis = bind(this.drawEllipsis, this);
      this.drawRects = bind(this.drawRects, this);
      this.currentTree = this.tree._currentTree;
    }

    Shape.prototype.draw = function(ctx) {
      this.ctx = ctx;
      return {
        rects: this.drawRects,
        ellipsis: this.drawEllipsis
      }[this.tree.general_parameters.shape]();
    };

    Shape.prototype.drawRects = function() {
      this.setColors();
      this.ctx.fillStyle = "hsl(" + this.hue + ", " + (this.saturation * 100) + "%, " + (this.value * 100) + "%)";
      this.ctx.translate(this.position.x, this.position.y);
      this.ctx.rotate(-this.position.angle);
      this.ctx.fillRect(0, 0, this.size.width, -this.size.height);
      this.ctx.rotate(this.position.angle);
      return this.ctx.translate(-this.position.x, -this.position.y);
    };

    Shape.prototype.drawEllipsis = function() {
      this.setColors();
      this.ctx.save();
      this.ctx.fillStyle = "hsl(" + this.hue + ", " + (this.saturation * 100) + "%, " + (this.value * 100) + "%)";
      this.ctx.translate(this.position.x, this.position.y);
      this.ctx.rotate(-this.position.angle);
      this.ctx.scale(1, this.size.height / this.size.width);
      this.ctx.beginPath();
      this.ctx.arc(this.size.width / 2, -this.size.width / 2, this.size.width / 2, 0, 2 * Math.PI, false);
      this.ctx.fill();
      return this.ctx.restore();
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
      var ShapeClass, leftShape, parameters, rightShape;
      if (this.depth >= this.tree.branch_parameters.depth) {
        ShapeClass = LeaveShape;
      } else {
        ShapeClass = BranchShape;
      }
      parameters = this.childParameters();
      leftShape = new ShapeClass(this.tree, parameters.leftPosition, parameters.leftSize, this.depth + 1);
      rightShape = new ShapeClass(this.tree, parameters.rightPosition, parameters.rightSize, this.depth + 1);
      return [leftShape, rightShape];
    };

    Shape.prototype.childSize = function(side) {
      var trig;
      trig = side === 'left' ? Math.cos : Math.sin;
      return {
        width: this.size.width * trig(this.addAngle),
        height: this.childHeight()
      };
    };

    Shape.prototype.childParameters = function() {
      var angle_mean, angle_variance, leftPosition, leftSize, rightPosition, rightSize;
      angle_mean = this.tree.growth_parameters.split_direction;
      angle_variance = this.tree.growth_parameters.split_variance;
      this.addAngle = beta_sample_for(angle_mean / 180, angle_variance / 10 * 0.25) * Math.PI / 2;
      leftSize = this.childSize('left');
      rightSize = this.childSize('right');
      leftPosition = {
        x: this.position.x + Math.cos(Math.PI / 2 + this.position.angle) * this.size.height,
        y: this.position.y - Math.sin(Math.PI / 2 + this.position.angle) * this.size.height,
        angle: this.position.angle + this.addAngle
      };
      rightPosition = {
        x: leftPosition.x + Math.cos(leftPosition.angle) * leftSize.width,
        y: leftPosition.y - Math.sin(leftPosition.angle) * leftSize.width,
        angle: this.position.angle + this.addAngle - Math.PI / 2
      };
      return {
        leftPosition: leftPosition,
        rightPosition: rightPosition,
        leftSize: leftSize,
        rightSize: rightSize
      };
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

    Shape.prototype.isGoingDown = function(angle) {
      return Math.cos(angle) < 0;
    };

    return Shape;

  })();

  BranchShape = (function(superClass) {
    extend(BranchShape, superClass);

    BranchShape.prototype.beta = 25;

    function BranchShape(tree1, position, size1, depth) {
      this.tree = tree1;
      this.position = position;
      this.size = size1;
      this.depth = depth != null ? depth : 1;
      BranchShape.__super__.constructor.call(this, this.tree, this.position, this.size, this.depth);
      if (this.depth !== 0) {
        this.size.height *= this.heightMultiplier();
      }
    }

    BranchShape.prototype.heightMultiplier = function() {
      if (this.isGoingDown(this.position.angle)) {
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

    function LeaveShape(tree1, position, size1, depth) {
      this.tree = tree1;
      this.position = position;
      this.size = size1;
      this.depth = depth != null ? depth : 1;
      LeaveShape.__super__.constructor.call(this, this.tree, this.position, this.size, this.depth);
      this.size.height *= this.heightMultiplier();
    }

    LeaveShape.prototype.heightMultiplier = function() {
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
      this.canvas = new DrawingCanvas($('canvas'));
      this.general_parameters = {
        growing_time: 200,
        background: "#ffffff",
        clean_canvas: true,
        shape: 'rects'
      };
      this.trunk_parameters = {
        width: 60,
        height: 110,
        position_x: 50,
        position_y: 80
      };
      this.branch_parameters = {
        up_growing: 150,
        down_growing: 20,
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
        depth: 5,
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
      this.growth_parameters = {
        split_direction: 90,
        split_variance: 0.5
      };
    }

    Tree.prototype.generate = function() {
      var shapePosition, size;
      this._currentTree = Math.random();
      if (this.general_parameters.clean_canvas) {
        this.canvas.clear(this.general_parameters.background);
      }
      size = {
        width: this.trunk_parameters.width,
        height: this.trunk_parameters.height
      };
      shapePosition = {
        x: this.canvas.el.width * this.trunk_parameters.position_x / 100 - size.width / 2,
        y: this.canvas.el.height * this.trunk_parameters.position_y / 100 + size.height / 2,
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
