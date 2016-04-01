var canvas;
var context;

var activeVertex = null;
var activeVertexStartPosition;

var VERTEX_RADIUS = 5;

var vertices = [];
var edges = [];

var mode = 'vertex';

var selectedVertex = null;

function setMode(newMode) {
    mode = newMode;
    $('.debug-mode').text(mode);
}

function getVertexUnderMouse() {
    var pos = mouseUtil.mousePos;
    if (mouseUtil.mouseIsDragging) {
        pos = mouseUtil.mouseDownStartPos;
    }
    
    for (var i = 0; i < vertices.length; i++) {
        var vertex = vertices[i];
        if (
            Math.abs(pos.x - vertex.x) <= VERTEX_RADIUS &&
            Math.abs(pos.y - vertex.y) <= VERTEX_RADIUS
        ) {
            return i;
        }
    }

    return null;
}

function updateMouseDebug() {
    function posToString(pos) {
        if (!pos) {
            return "";
        }
        return "x: " + pos.x + " y: " + pos.y;
    }
    var debugMouseDown = document.getElementsByClassName('debug-mousedown')[0];
    var debugMouseDownStartPos = document.getElementsByClassName('debug-mousedownstartpos')[0];
    var debugMouseIsDragging = document.getElementsByClassName('debug-mouseisdragging')[0];
    var debugMousePos = document.getElementsByClassName('debug-mousepos')[0];

    debugMouseDown.innerHTML = mouseUtil.mouseDown;
    debugMouseDownStartPos.innerHTML = posToString(mouseUtil.mouseDownStartPos);
    debugMouseIsDragging.innerHTML = mouseUtil.mouseIsDragging;
    debugMousePos.innerHTML = posToString(mouseUtil.mousePos);
}

function addVertex() {
    vertices.push({
        x: mouseUtil.mousePos.x,
        y: mouseUtil.mousePos.y
    });
}

function addEdge(v1, v2) {
    if (v1 == v2) {
        return;
    }
    
    edges.push({
        v1: v1,
        v2: v2
    });
}

function draw() {
    context.canvas.width  = window.innerWidth;
    context.canvas.height = window.innerHeight;

    for (var i = 0; i < vertices.length; i++) {
        var vertex = vertices[i];
        canvasUtil.drawCircle(context, vertex, VERTEX_RADIUS);
    }
    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        canvasUtil.drawLine(context, vertices[edge.v1], vertices[edge.v2]);
    }

    updateMouseDebug();
}

function init() {
    canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');

    mouseUtil.init(canvas);
    mouseUtil.registerCallback("mouseclick", function() {
        if (mode == 'vertex') {
            addVertex();
        } else if (mode == 'edge') {
            var vert = getVertexUnderMouse();

            if (vert === null) {
                selectedVertex = null;
                return;
            }

            if (selectedVertex === null) {
                selectedVertex = vert;
                return;
            }

            addEdge(selectedVertex, vert);
            selectedVertex = null;
        }
    });
    mouseUtil.registerCallback("mousedragstart", function() {
        activeVertex = getVertexUnderMouse();
        if (activeVertex !== null) {
            activeVertexStartPosition = {
                x: vertices[activeVertex].x,
                y: vertices[activeVertex].y
            }
        }
    });
    mouseUtil.registerCallback("mousedrag", function() {
        var dragOffset = mouseUtil.getMouseDragOffset();
        if (activeVertex !== null) {
            vertices[activeVertex] = {
                x: activeVertexStartPosition.x + dragOffset.x,
                y: activeVertexStartPosition.y + dragOffset.y
            };
        }
    });
    mouseUtil.registerCallback("mousemove", function() {
        draw();
    });
    mouseUtil.registerCallback("mousedown", function() {
        draw();
    });
    mouseUtil.registerCallback("mouseup", function() {
        draw();
    });
}

init();
draw();
