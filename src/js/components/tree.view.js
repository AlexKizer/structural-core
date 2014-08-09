S.view('tree', function () {
  var view = S.baseView(),
    data = S.map(), // stores data about nodes
    $e,
    dom_svg,
    s_svg, // snap svg object
    $svg, // jQuery svg object
    width = 100,
    height = 100,
    nodeRadius,
    mh, // horizontal margin between nodes
    mv, // vertical margin between nodes
    x0, // x offset
    y0; // y offset

  /*
  example node data:
  {
    x: 100,
    y: 100,
    element: [svg element],
    leftLine: [svg element],
    rightLine: [svg element],
    label: 'some text',
    s_value: [svg element],
    s_height: [svg element]
  }
   */

  view.init = function() {
    
  }


  view.scaleTo = function(dimensions) {
    console.log('scaling tree');
    width = dimensions.width;
    height = dimensions.height;
    x0 = width / 2;
    nodeRadius = .05 * height; // TODO
    y0 = nodeRadius;
    mh = (height / view.component.height()) - nodeRadius;
    mv = mh;
    view.$element.width(width);
    view.$element.height(height);
    view.render(); 
  }

  view.render = function() {
    console.log('rendering');
    if($e) $e.remove();
    $e = $('<div class="tree"></div>');
    dom_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); // http://stackoverflow.com/questions/20045532/snap-svg-cant-find-dynamically-and-successfully-appended-svg-element-with-jqu
    $svg = $(dom_svg)
      .width(width)
      .height(height)
      .addClass('tree-svg')
      .appendTo($e);
    s_svg = Snap(dom_svg);
    rg(view.component.tree, data, {
      mh: mh,
      mv: mv,
      x0: x0,
      y0: y0
    });
    drawLines(view.component.tree);
    allNodes(view.component.tree, function(node) {
      data(node).element = drawNode(node, data(node).x, data(node).y);
      data(node).s_value = drawValue(node.value, data(node).x, data(node).y);
      data(node).s_height = drawHeight(node);   
    });
    view.$element.append($e);
    return view.$element;
  }

  function drawNode(node, x, y) {
    return circle = s_svg.circle(x + x0, y + y0, nodeRadius)
      .addClass('tree-node');
    /*if(data(node).doNotDraw) 
      circle.addClass('tree-node-hidden');*/
  }
  
  function drawLabel(node, label) {
    return s_svg.text(data(node).x + x0 + nodeRadius + 10, data(node).y + y0, '// ' + label)
      .addClass('tree-node-label')
      .attr('text-anchor', 'left');
  }

  function drawValue(value, x, y) {
    return s_svg.text(x + x0 /*- 10*/, y + y0 + nodeRadius * .5, value + '')
      .addClass('tree-node-value')
      .attr('text-anchor', 'middle')
      .attr('font-size', nodeRadius * 1.25);
  }

  function drawLine(xi, yi, xf, yf) {
    return s_svg.line(xi + x0, yi + y0, xf + x0, yf + y0)
      .addClass('tree-line');//.attr('stroke', 'black');
  }
  
  function drawHeight(node) {
    return s_svg.text(data(node).x + x0 - nodeRadius - 15, data(node).y + y0 + 5, node.height + '')
      .addClass('tree-height');
  }


  /**
   * Recursive method to draw connecting lines of tree.
   * @param root
   */
  function drawLines(root) {
      if(root.left) {
          data(root).leftLine = drawLine(data(root).x, data(root).y, data(root.left).x, data(root.left).y);
          drawLines(root.left);
      }
      if(root.right) {
          data(root).rightLine = drawLine(data(root).x, data(root).y, data(root.right).x, data(root.right).y);
          drawLines(root.right);
      }
  }

  function allNodes(root, func) {
    if(root) {
      func(root)
      allNodes(root.left, func);
      allNodes(root.right, func);
    }
  }
  
  
  view.live.focusOn = function(node, fn) {
    if(!node) return;
    var circle = data(node).element
      .addClass('focus');
    fn();
  }

  view.live.clearfocus = function(fn) {
    data.forEach(function(pair){
      pair[1].element.removeClass('focus');
    });
    fn();
  }
  
  view.live.add = function(parent, direction, value, fn) {
    if(direction) {
      data(parent.right).doNotDraw = true;
    } else {
      data(parent.left).doNotDraw = true;
    }
    // TODO animate addition of node
    view.scaleTo({
      width: width,
      height: height
    });
    view.render();
    fn();
  }
  
  view.live.travel = function(parent, direction, fn) {
    if(direction) {
      if(data(parent).rightLine) {
        var rightLine = data(parent).rightLine;
        rightLine.addClass('tree-line-active');
        var s_circle = s_svg.circle(rightLine.attr('x1'), rightLine.attr('y1'), 5)
          .addClass('tree-travelorb');
        s_circle.insertAfter(rightLine);
        s_circle.animate({
          cx: rightLine.attr('x2'),
          cy: rightLine.attr('y2')
        }, 500, null, function() {
          fn();
        });
      } else {
        fn();
      }
    } else {
      if(data(parent).leftLine) {
        var leftLine = data(parent).leftLine;
        leftLine.addClass('tree-line-active');
        var s_circle = s_svg.circle(leftLine.attr('x1'), leftLine.attr('y1'), 5)
          .addClass('tree-travelorb');
        s_circle.insertAfter(leftLine);
        s_circle.animate({
          cx: leftLine.attr('x2'),
          cy: leftLine.attr('y2')
        }, 500, null, function() {
          fn();
        });
      } else {
        fn();
      }
    }
  };
  
  view.live.label = function(node, label, fn) {
    if(node && data(node)) {
      data(node).label = label;
      data(node).s_label = drawLabel(node, label);
      fn();
    } else {
      fn();
    }
  }
  
  view.live.setNode = function(node, value, fn) {
    var s_node = data(node).element,
        s_value = data(node).s_value;
    S.wait(function() {
      s_node.addClass('tree-remove');
      s_value.addClass('tree-remove');
      S.wait(function() {
        s_node.removeClass('tree-remove');
        s_value.removeClass('tree-remove')
          .attr('text', value);
        fn();
      }, 300);
    }, 200); 
  }

  view.live.clear = function(fn) {
    view.render();
    fn();
  }

  view.live.clearlabels = function(fn) {
    data.forEach(function(pair) {
      view.live.clearlabel(pair[0]);
    });
    fn();
  }

  view.live.clearlabel = function(node, fn) {
    if(data(node).s_label) {
      data(node).s_label.remove();
      data(node).label = undefined;
      data(node).s_label = undefined;
    }
    if(fn) fn();
  }

  view.add = function(parent_s, left, value, fn) {
    /*nodes(parent_s, getNodeElement(value));
    rg(view.component.tree, data, view.config());
    nodes.forEach(function(pair){
      move(nodes(pair[0]), pair[1].x, pair[1].y, function(){
        $e.append(nodes(parent_s));
      });
    });*/
  }

  function move($elem, x, y, fn) {
    /*$elem.animate({
      left: x,
      top: y
    }, 250, function(){
      fn();
    });*/
  }

  function rg(root, store, options) {
    //1. copy tree
    //2. run rg
    //3. copy to store


    var config = {
      mh: 10,
      mv: 10
    };

    $.extend(config, options);
    var _root = copyTree(root);
    //console.log('printing _root');
    //printTree(_root);
    setup(_root, 0, null, null);
    assign(_root, 0, false);
    copyToStore(_root, store);

    function RNode(node) {
      //console.log('R ' + node.value);
      this.value = node.value;
      this.left = null;//node.left;
      this.right = null;//node.right;
      this.x = 0;
      this.y = 0;
      this.thread = false;
      this.offset = 0;
      this.sid = node.sid;
    }

    function Extreme(node) {
      this.node = node;
      this.offset = 0;
      this.level = 0;
    }

    function copyTree(node) {
      var copy;
      if(!node)
        copy = null;
      else {
        /*copy = {};
         copy.value = node.value;*/
        copy = new RNode(node);
        copy.left = copyTree(node.left);
        copy.right = copyTree(node.right);
      }
      return copy;
    }

    function printTree(root) {
      if(!root)
        return;
      console.log(root.value)
      printTree(root.left);
      printTree(root.right);
    }

    function setup(node, level, rightMost, leftMost) {
      var left,
        right,
        lRightMost = new Extreme(null),
        lLeftMost = new Extreme(null),
        rRightMost = new Extreme(null),
        rLeftMost = new Extreme(null);

      // while loop variables:
      var currentSeparation, // The separation between contour nodes on the current level
        rootSeparation, // ?
        leftOffsetSum,  // offset from root
        rightOffsetSum; // offset from root


      if(!node /*== null*/) {
        // base case ?
        // ? update leftMost, rightMost
        leftMost.level = -1;
        rightMost.level = -1;
        return;
      }

      node.y = level * config.mv;
      left = node.left;
      //console.log('left is ' + left);
      right = node.right;
      setup(left, level + 1, lRightMost, lLeftMost);
      setup(right, level + 1, rRightMost, rLeftMost);
      if(left === null && right === null) {
        // node is a leaf
        // base case?
        if(leftMost && rightMost) {
          rightMost.node = node;
          leftMost.node = node;
          rightMost.level = level; // single node is both rightMost and leftMost on lowest level (which is current level)
          leftMost.level = level;
          rightMost.offset = 0; // ? TODO
          leftMost.offset = 0;  // ? TODO
        }
        node.offset = 0;
      } else {
        // node is not a leaf

        currentSeparation = config.mh; // margin = minimum separation between two nodes on a level
        rootSeparation = config.mh; // ? TODO
        leftOffsetSum = 0;
        rightOffsetSum = 0;

        while(left !== null && right !== null) {

          if(currentSeparation < config.mh) { // nodes are too close together

            // Increase rootSeparation just enough so that it accounts for difference between
            // config.mh and currentSeparation:
            rootSeparation += (config.mh - currentSeparation);

            // Now, increase currentSeparation to the minimumSeparation:
            currentSeparation = config.mh;

          }

// left contour:
          if(left.right !== null) {

            // leftOffsetSum is offset of left from root
            // left.offset = distance to each son
            // increase leftOffsetSum by left's offset from each child:
            leftOffsetSum += left.offset;

            // At this level, now, currentSeparation is decreased by left.offset,
            // because that is how far out left's right child is stick out.
            currentSeparation -= left.offset;

            // Go to next level, next on contour:
            left = left.right;
          } else {

            //left.right is null.

            // We can move left in now:
            leftOffsetSum -= left.offset; // ? TODO

            // We've allowed more separation ?
            currentSeparation += left.offset;

            // Go to next level, next on contour:
            left = left.left;
          }

// right contour:
          if(right.left !== null) {
            rightOffsetSum -= right.offset;
            currentSeparation -= right.offset;
            right = right.left;
          } else {
            rightOffsetSum += right.offset;
            currentSeparation += right.offset;
            right = right.right;
          }

        }

// set root's offset:
        node.offset = (rootSeparation + 1) / 2;
// ? TODO :
        leftOffsetSum -= node.offset;
        rightOffsetSum += node.offset;

// determine 2 extremes from the 4 we have:
// pick leftMost:
        if(rLeftMost.level > lLeftMost.level || node.left == null) {
          // rLeftMost wins
          leftMost = rLeftMost;
          leftMost.offset += node.offset; // ? TODO
        } else {
          // lLeftMost wins
          leftMost = lLeftMost;
          leftMost.offset -= node.offset;
        }


// threading:
// necessary if uneven heights? TODO

        if(left != null && left != node.left && rRightMost.node) {
          rRightMost.node.thread = true;
          // no idea what's going on here: TODO
          rRightMost.node.offset = Math.abs( (rRightMost.offset + node.offset) - leftOffsetSum);
          if(leftOffsetSum - node.offset <= rRightMost.offset) {
            rRightMost.node.left = left;
          } else {
            rRightMost.node.right = left;
          }
        } else if(right != null && right != node.right && lLeftMost.node) {
          lLeftMost.node.thread = true;
          lLeftMost.node.offset = Math.abs( (lLeftMost.offset - node.offset) - rightOffsetSum);
          if(rightOffsetSum + node.offset >= lLeftMost.offset) {
            lLeftMost.node.right = right;
          } else {
            lLeftMost.node.left = right;
          }
        } else {
          // nothing
        }

      }


    }

    function assign(node, x, useNew) {
      if(node != null) {
        node.x = x;
        if(node.thread) {
          // clean up threading:
          node.thread = false;
          node.right = null;
          node.left = null;
        }
        // ? TODO
        assign(node.left, x - node.offset, useNew);
        assign(node.right, x + node.offset, useNew);
      }
    }

    function copyToStore(root, store) {

      if(!root)
        return;
      //console.log('STORING ' + root.sid);
      store(root, {
        x: root.x,
        y: root.y
      });
      copyToStore(root.left, store);
      copyToStore(root.right, store);
    }


  }

  return view;
} );