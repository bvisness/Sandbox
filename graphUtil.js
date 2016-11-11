var graphUtil = {};

graphUtil.vertexCounter = 0;
graphUtil.edgeCounter = 0;
graphUtil.labelCounter = 0;

graphUtil.newVertex = function(x, y) {
    return {
        id: this.vertexCounter++,
        x: x,
        y: y
    };
}

graphUtil.newEdge = function(v1_id, v2_id) {
    return {
        id: this.edgeCounter++,
        v1: v1_id,
        v2: v2_id
    }
}

graphUtil.newLabel = function(_v_id, _text = null) {
    var _id = this.labelCounter++;
    return {
        id: _id,
        text: (_text === null) ? String.fromCharCode(97 + _id) : _text,
        v_id: _v_id,
        x: 8,
        y: 8
    }
}
