var selectUtil = {};

selectUtil.isMultiSelect = function() {
    return keyUtil.shift
        || keyUtil.isPlatformCtrlKey();
}

selectUtil.vertexIsSelected = function(id) {
    var result = selected.find(function(selectedThing) {
        return selectedThing.type == 'vertex' && selectedThing.id === id;
    });

    return result !== undefined;
}

selectUtil.edgeIsSelected = function(id) {
    var result = selected.find(function(selectedThing) {
        return selectedThing.type == 'edge' && selectedThing.id === id;
    });

    return result !== undefined;
}

selectUtil.thingIsSelected = function(thing) {
    var result = selected.find(function(selectedThing) {
        return selectedThing.type == thing.type && selectedThing.id === thing.id;
    });

    return result !== undefined;
}
