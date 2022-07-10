import inherits from 'inherits';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
  componentsToPath,
  createLine
} from 'diagram-js/lib/util/RenderUtil';

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  classes as svgClasses
} from 'tiny-svg';

var COLOR_GREEN = '#52B415',
    COLOR_RED = '#cc0000',
    COLOR_YELLOW = '#ffc800';

/**
 * A renderer that knows how to render custom elements.
 */
export default function CustomRenderer(eventBus, styles) {

  BaseRenderer.call(this, eventBus, 2000);

  var computeStyle = styles.computeStyle;

  this.drawrisk = function(p, side, element) {
    console.log("p",p)
    console.log("element",element)
    console.log("riskdId",element.businessObject.get("riskId"))
    var halfSide = side / 2,
        points,
        attrs;

    points = [ halfSide, 0, side, side, 0, side ];

    attrs = computeStyle(attrs, {
      stroke: COLOR_RED,
      strokeWidth: 2,
      fill: COLOR_RED
    });

    var polygon = svgCreate('polygon');

    svgAttr(polygon, {
      points: points
    });

    svgAttr(polygon, attrs);

    svgAppend(p, polygon);

    var text = svgCreate('text'); 

    svgAttr(text, {
      fill: COLOR_RED,
      transform: 'translate(1, 60)'
    });

    svgClasses(text).add('djs-label'); 
  
    //get risk display name and set it here
    svgAppend(text, document.createTextNode(element.businessObject.get("riskId") || "Risk")); 
  
    svgAppend(p, text);

    return polygon;
  };

  this.getriskPath = function(element) {
    var x = element.x,
        y = element.y,
        width = element.width,
        height = element.height;

    var riskPath = [
      ['M', x + width / 2, y],
      ['l', width / 2, height],
      ['l', -width, 0 ],
      ['z']
    ];

    return componentsToPath(riskPath);
  };

  this.drawCustomConnection = function(p, element) {
    var attrs = computeStyle(attrs, {
      stroke: COLOR_RED,
      strokeWidth: 2
    });

    return svgAppend(p, createLine(element.waypoints, attrs));
  };

  this.getCustomConnectionPath = function(connection) {
    var waypoints = connection.waypoints.map(function(p) {
      return p.original || p;
    });

    var connectionPath = [
      ['M', waypoints[0].x, waypoints[0].y]
    ];

    waypoints.forEach(function(waypoint, index) {
      if (index !== 0) {
        connectionPath.push(['L', waypoint.x, waypoint.y]);
      }
    });

    return componentsToPath(connectionPath);
  };
}

inherits(CustomRenderer, BaseRenderer);

CustomRenderer.$inject = [ 'eventBus', 'styles' ];


CustomRenderer.prototype.canRender = function(element) {
  return /^custom:/.test(element.type);
};

CustomRenderer.prototype.drawShape = function(p, element) {
  var type = element.type;

  if (type === 'custom:risk') {
    return this.drawrisk(p, element.width, element);
  }
};

CustomRenderer.prototype.getShapePath = function(shape) {
  var type = shape.type;

  if (type === 'custom:risk') {
    return this.getriskPath(shape);
  }
};

CustomRenderer.prototype.drawConnection = function(p, element) {

  var type = element.type;

  if (type === 'custom:connection') {
    return this.drawCustomConnection(p, element);
  }
};


CustomRenderer.prototype.getConnectionPath = function(connection) {

  var type = connection.type;

  if (type === 'custom:connection') {
    return this.getCustomConnectionPath(connection);
  }
};
