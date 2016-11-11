var canvasUtil = {};

canvasUtil.drawLine = function(context, from, to, color = 'black') {
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.lineWidth = 2;
    context.strokeStyle = color;
    context.stroke();
};

canvasUtil.drawCircle = function(context, center, radius, color = 'black') {
    context.beginPath();
    context.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
};

canvasUtil.drawText = function(context, text, origin, color = 'black', size = '14px', font = 'Arial') {
    context.font = size + ' ' + font;
    context.fillStyle = color;
    context.fillText(text, origin.x, origin.y);
}
