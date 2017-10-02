var canvasUtil = {};

canvasUtil.scaleForDisplay = function(value) {
    return value * window.devicePixelRatio;
}

canvasUtil.drawLine = function(context, from, to, color = 'black') {
    context.beginPath();
    context.moveTo(
        canvasUtil.scaleForDisplay(from.x),
        canvasUtil.scaleForDisplay(from.y)
    );
    context.lineTo(
        canvasUtil.scaleForDisplay(to.x),
        canvasUtil.scaleForDisplay(to.y)
    );
    context.lineWidth = canvasUtil.scaleForDisplay(2);
    context.strokeStyle = color;
    context.stroke();
};

canvasUtil.drawCircle = function(context, center, radius, color = 'black') {
    context.beginPath();
    context.arc(
        canvasUtil.scaleForDisplay(center.x),
        canvasUtil.scaleForDisplay(center.y),
        canvasUtil.scaleForDisplay(radius),
        0,
        2 * Math.PI,
        false
    );
    context.fillStyle = color;
    context.fill();
};

canvasUtil.drawText = function(context, text, origin, color = 'black', size = 14, font = 'Arial') {
    context.font = canvasUtil.scaleForDisplay(size) + 'px ' + font;
    context.fillStyle = color;
    context.fillText(
        text,
        canvasUtil.scaleForDisplay(origin.x),
        canvasUtil.scaleForDisplay(origin.y)
    );
}
