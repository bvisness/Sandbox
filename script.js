var canvas;
var context;

var draggingVertexStartPositions;

var VERTEX_RADIUS = 5;
var EDGE_DISTANCE_THRESHOLD = 1;

var vertices = [];
var edges = [];

var mode = 'vertex';

var selected = [];
var activeThing = null;

var env = 'pc';
if (navigator.userAgent.indexOf('Mac OS X') !== -1) {
    env = 'mac';
}

function setMode(newMode) {
    mode = newMode;
    selected = [];
    $('.debug-mode').text(mode);
    draw();
}

function getVertexById(id) {
    return vertices.find(function(vertex) {
        return vertex.id === id;
    });
}

function getEdgeById(id) {
    return edges.find(function(edge) {
        return edge.id === id;
    });
}

function deleteVertexWithId(id) {
    var adjacent = edges.filter(function(edge) {
        return edge.v1 === id || edge.v2 === id;
    });
    adjacent.forEach(function(edge) {
        deleteEdgeWithId(edge.id);
    });

    var index = vertices.findIndex(function(vertex) {
        return vertex.id === id;
    });
    if (index !== -1) {
        vertices.splice(index, 1);
    }
}

function deleteEdgeWithId(id) {
    var index = edges.findIndex(function(edge) {
        return edge.id === id;
    });
    if (index !== -1) {
        edges.splice(index, 1);
    }
}

function getIdOfVertexUnderMouse() {
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
            return vertex.id;
        }
    }

    return null;
}

function getIdOfEdgeUnderMouse() {
    function distance(p1, p2) {
        return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
    }

    var pos = mouseUtil.mousePos;
    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        var v1 = getVertexById(edge.v1);
        var v2 = getVertexById(edge.v2);
        var distanceDiff = (distance(v1, pos) + distance(pos, v2)) - distance(v1, v2);
        if (distanceDiff <= EDGE_DISTANCE_THRESHOLD) {
            return edge.id;
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
    vertices.push(graphUtil.newVertex(
        mouseUtil.mousePos.x,
        mouseUtil.mousePos.y
    ));
}

function addEdge(v1, v2) {
    if (v1 == v2) {
        return;
    }

    edges.push(graphUtil.newEdge(v1, v2));
}

function deleteSelected() {
    selected.forEach(function(selectedThing) {
        if (selectedThing.type == 'edge') {
            deleteEdgeWithId(selectedThing.id);
        } else if (selectedThing.type == 'vertex') {
            deleteVertexWithId(selectedThing.id);
        }
    });

    selected = [];
}

function draw() {
    context.canvas.width  = window.innerWidth;
    context.canvas.height = window.innerHeight;

    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        var color = 'black';
        if (selectUtil.edgeIsSelected(edge.id)) {
            color = 'red';
        }
        canvasUtil.drawLine(context, getVertexById(edge.v1), getVertexById(edge.v2), color);
    }
    for (var i = 0; i < vertices.length; i++) {
        var vertex = vertices[i];
        var color = 'black';
        if (selectUtil.vertexIsSelected(vertex.id)) {
            color = 'red';
        };
        canvasUtil.drawCircle(context, vertex, VERTEX_RADIUS, color);
    }

    updateMouseDebug();
}

function init() {
    canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');

    mouseUtil.init(canvas);
    mouseUtil.registerCallback("mouseclick", function() {
        select: if (mode == 'select') {
            if (selectUtil.isMultiSelect()) {
                if (activeThing !== null) {
                    selected.push(activeThing);
                }
            } else {
                if (activeThing === null) {
                    selected = [];    
                } else {
                    selected = [activeThing];
                }
            }
        } else if (mode == 'vertex') {
            addVertex();
            selected = [];
        } else if (mode == 'edge') {
            var vertId = getIdOfVertexUnderMouse();

            if (vertId === null) {
                selected = [];
                return;
            }

            if (selected.length === 0) {
                selected.push({
                    type: 'vertex',
                    id: vertId
                });
                return;
            }

            addEdge(selected[0].id, vertId);
            selected = [];
        }
    });
    mouseUtil.registerCallback("mousedragstart", function() {
        draggingVertexStartPositions = {};
        if (
            activeThing !== null
            && activeThing.type == 'vertex'
            && !selectUtil.thingIsSelected(activeThing)
        ) {
            selected = [activeThing];
        }
        selected.forEach(function(selectedThing) {
            if (selectedThing.type == 'vertex') {
                var vertex = getVertexById(selectedThing.id);
                draggingVertexStartPositions[vertex.id] = {
                    x: vertex.x,
                    y: vertex.y
                };
            }
        });
    });
    mouseUtil.registerCallback("mousedrag", function() {
        var dragOffset = mouseUtil.getMouseDragOffset();
        for (var draggingVertexId in draggingVertexStartPositions) {
            if (!draggingVertexStartPositions.hasOwnProperty(draggingVertexId)) {
                continue;
            }

            var vertex = getVertexById(parseInt(draggingVertexId, 10));
            vertex.x = draggingVertexStartPositions[draggingVertexId].x + dragOffset.x;
            vertex.y = draggingVertexStartPositions[draggingVertexId].y + dragOffset.y;
        }
    });
    mouseUtil.registerCallback("mousemove", function() {
        draw();
    });
    mouseUtil.registerCallback("mousedown", function() {
        select: if (mode == 'select') { 
            activeThing = null;

            var vertId = getIdOfVertexUnderMouse();
            if (vertId !== null && !selectUtil.vertexIsSelected(vertId)) {
                activeThing = {
                    type: 'vertex',
                    id: vertId
                };
                break select;
            }

            var edgeId = getIdOfEdgeUnderMouse();
            if (edgeId !== null && !selectUtil.edgeIsSelected(edgeId)) {
                activeThing = {
                    type: 'edge',
                    id: edgeId
                };
                break select;
            }
        }

        draw();
    });
    mouseUtil.registerCallback("mouseup", function() {
        draw();
    });

    document.addEventListener('keydown', function(e) {
        var key = e.keyCode;
        switch (key) {
            case 8: {
                deleteSelected();
                break;
            }
            case 46: {
                deleteSelected();
                break;
            }
        }

        draw();
    }, false);
}

init();
draw();
