var mouseUtil = {};

mouseUtil.DRAG_THRESHOLD = 2;

mouseUtil.mouseDown = undefined;
mouseUtil.mouseDownStartPos = undefined;
mouseUtil.mouseIsDragging = undefined;
mouseUtil.mousePos = undefined;

mouseUtil.callbacks = {
    "mousemove": [],
    "mousedown": [],
    "mouseup": [],
    "mouseclick": [],
    "mousedragstart": [],
    "mousedrag": [],
    "mousedragend": []
};

mouseUtil.executeFunctionArray = function(array) {
    for (var i = 0; i < array.length; i++) {
        array[i]();
    }
};

mouseUtil.registerCallback = function(evt, callback) {
    if (!mouseUtil.callbacks.hasOwnProperty(evt)) {
        return false;
    }
    mouseUtil.callbacks[evt].push(callback);
};

mouseUtil.getMousePos = function(element, evt) {
    var rect = element.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
};

mouseUtil.getMouseDragOffset = function() {
    if (!mouseUtil.mouseIsDragging) {
        return undefined;
    }
    
    return {
        x: mouseUtil.mousePos.x - mouseUtil.mouseDownStartPos.x,
        y: mouseUtil.mousePos.y - mouseUtil.mouseDownStartPos.y
    };
};

mouseUtil.init = function(element) {
    mouseUtil.mouseDown = false;
    mouseUtil.mouseIsDragging = false;

    element.addEventListener("mousemove", function(e) {
        mouseUtil.mousePos = mouseUtil.getMousePos(element, e);

        if (mouseUtil.mouseDown && !mouseUtil.mouseIsDragging) {
            var mouseDiffX = mouseUtil.mousePos.x - mouseUtil.mouseDownStartPos.x;
            var mouseDiffY = mouseUtil.mousePos.y - mouseUtil.mouseDownStartPos.y;
            if (
                Math.abs(mouseDiffX) > mouseUtil.DRAG_THRESHOLD ||
                Math.abs(mouseDiffY) > mouseUtil.DRAG_THRESHOLD
            ) {
                mouseUtil.mouseIsDragging = true;
                mouseUtil.executeFunctionArray(mouseUtil.callbacks["mousedragstart"]);
                mouseUtil.executeFunctionArray(mouseUtil.callbacks["mousedrag"]);
            }
        } else if (mouseUtil.mouseIsDragging) {
            mouseUtil.executeFunctionArray(mouseUtil.callbacks["mousedrag"]);
        }

        mouseUtil.executeFunctionArray(mouseUtil.callbacks["mousemove"]);
    }, false);

    element.addEventListener("mousedown", function(e) {
        mouseUtil.mouseDown = true;
        mouseUtil.mouseDownStartPos = mouseUtil.getMousePos(element, e);

        mouseUtil.executeFunctionArray(mouseUtil.callbacks["mousedown"]);
    }, false);

    element.addEventListener("mouseup", function(e) {
        if (!mouseUtil.mouseIsDragging) {
            mouseUtil.executeFunctionArray(mouseUtil.callbacks["mouseclick"]);
        }

        mouseUtil.mouseDown = false;
        mouseUtil.mouseDownStartPos = null;
        mouseUtil.mouseIsDragging = false;

        mouseUtil.executeFunctionArray(mouseUtil.callbacks["mouseup"]);
    }, false);
};
