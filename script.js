var canvas;
var context;

var draggingVertexStartPositions;

var VERTEX_RADIUS = 5;
var EDGE_DISTANCE_THRESHOLD = 1;
var EDGE_FORWARD_OFFSET = 10;
var EDGE_OUTWARD_OFFSET = 10;

var vertices = [];
var edges = [];
var labels = [];

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

    var vLabels = labels.filter(function(label) {
        return label.v_id === id;
    });
    vLabels.forEach(function(label) {
        deleteLabelWithId(label.id);
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

function deleteLabelWithId(id) {
    var index = labels.findIndex(function(label) {
        return label.id === id;
    });
    if (index !== -1) {
        labels.splice(index, 1);
    }
}

/**
 * Gets the points that are used when drawing an edge. Even straight edges
 * will have four points.
 *
 * This function always returns an array of four points.
 */
function getPointsForEdge(id) {
    /**
     * Returns a normalized version of v.
     */
    function normalized(v) {
        var length = Math.sqrt(v.x * v.x + v.y * v.y);
        if (length === 0) {
            return {
                x: 0,
                y: 0
            };
        }

        return {
            x: v.x / length,
            y: v.y / length
        }
    }

    // Get the edge and its vertices to work with. If necessary, we swap v1
    // and v2 so that v1.id < v2.id. This ensures that the vector from one
    // vertex to the next is always the same direction for all edges.
    var edge = getEdgeById(id);
    var v1 = getVertexById(edge.v1);
    var v2 = getVertexById(edge.v2);
    if (v1.id > v2.id) {
        var vTmp = v1;
        v1 = v2;
        v2 = vTmp;
    }

    // Get all edges that are adjacent to v1 and v2.
    var edgesForVertices = edges.filter(function(otherEdge) {
        return (otherEdge.v1 === v1.id && otherEdge.v2 === v2.id)
            || (otherEdge.v1 === v2.id && otherEdge.v2 === v1.id);
    });

    // Figure out which side of (v2 - v1) the edge should be drawn on, based
    // on the index of the edge in the set of all edges from v1 to v2.
    var indexRelativeToVertex = edgesForVertices.findIndex(function(otherEdge) {
        return otherEdge.id === id;
    });
    var side = (indexRelativeToVertex % 2 == 1) ? 'left' : 'right';
    if (indexRelativeToVertex === 0) {
        side = 'straight';
    }

    // Calculate some useful vectors
    var v1v2_n = normalized({
        x: v2.x - v1.x,
        y: v2.y - v1.y
    });
    var forward = {
        x: v1v2_n.x * EDGE_FORWARD_OFFSET,
        y: v1v2_n.y * EDGE_FORWARD_OFFSET
    };
    if (side == 'left') {
        var outward_n = {
            x: -v1v2_n.y,
            y: v1v2_n.x
        };
    } else if (side == 'right') {
        var outward_n = {
            x: v1v2_n.y,
            y: -v1v2_n.x
        };
    } else {
        var outward_n = {
            x: 0,
            y: 0
        }
    }
    var outward = {
        x: outward_n.x * EDGE_OUTWARD_OFFSET * Math.ceil(indexRelativeToVertex / 2),
        y: outward_n.y * EDGE_OUTWARD_OFFSET * Math.ceil(indexRelativeToVertex / 2),
    };

    // Fill up the array of points and return it
    var points = [];
    points.push({ // v1
        x: v1.x,
        y: v1.y
    });
    points.push({ // point 1
        x: v1.x + forward.x + outward.x,
        y: v1.y + forward.y + outward.y
    });
    points.push({ // point 2
        x: v2.x - forward.x + outward.x,
        y: v2.y - forward.y + outward.y
    });
    points.push({ // v2
        x: v2.x,
        y: v2.y
    });

    return points;
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
    var v = graphUtil.newVertex(
        mouseUtil.mousePos.x,
        mouseUtil.mousePos.y
    );
    var l = graphUtil.newLabel(v.id);
    vertices.push(v);
    labels.push(l);
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

    edges.forEach(function(edge) {
        var color = 'black';
        if (selectUtil.edgeIsSelected(edge.id)) {
            color = 'red';
        }
        var points = getPointsForEdge(edge.id);
        for (var i = 0; i < 4 - 1; i++) {
            canvasUtil.drawLine(context, points[i], points[i + 1], color);    
        }
    });
    vertices.forEach(function(vertex) {
        var color = 'black';
        if (selectUtil.vertexIsSelected(vertex.id)) {
            color = 'red';
        };
        canvasUtil.drawCircle(context, vertex, VERTEX_RADIUS, color);
    });
    labels.forEach(function(label) {
        var v = getVertexById(label.v_id);
        var color = 'black';
        if (selectUtil.vertexIsSelected(v.id)) {
            color = 'red';
        }
        canvasUtil.drawText(context, label.text, {
            x: v.x + label.x,
            y: v.y - label.y
        }, color);
    });

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
            case 8: { // backspace
                deleteSelected();
                break;
            }
            case 46: { // forward delete
                deleteSelected();
                break;
            }
            case 65: { // a
                if (keyUtil.isPlatformCtrlKey()) {
                    // select all
                    selected = [];
                    vertices.forEach(function(vertex) {
                        selected.push({
                            type: 'vertex',
                            id: vertex.id
                        });
                    });
                    edges.forEach(function(edge) {
                        selected.push({
                            type: 'edge',
                            id: edge.id
                        });
                    });
                }
            }
        }

        draw();
    }, false);
}

init();
draw();
