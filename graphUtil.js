var graphUtil = {};

graphUtil.vertexCounter = 0;
graphUtil.edgeCounter = 0;

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
