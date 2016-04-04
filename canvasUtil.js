var canvasUtil = {};

canvasUtil.drawLine = function(context, from, to) {
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.lineWidth = 2;
    context.stroke();
};

canvasUtil.drawCircle = function(context, center, radius) {
    context.beginPath();
    context.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'black';
    context.fill();
};
