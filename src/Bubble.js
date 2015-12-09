'use strict';

const SPEED = 30;
const BUBBLE_IMAGE_SIZE = 100;

var height = Symbol();
var width = Symbol();
var image = Symbol();
var created = Symbol();
var speed = Symbol();
var policy = Symbol();
var x = Symbol();

module.exports = class {
    constructor(_policy, _image) {
        this[policy] = _policy;
        this[speed] = SPEED / 2000 + Math.random() / SPEED;
        this[image] = _image;
        this[created] = Date.now();

        dispatchEvent(new CustomEvent('bubbleCreated', { detail: { premium: this[policy].premium } }));
    }

    draw(context) {
        var calculateYPosition = () => {
            var y;
            y = Math.round(this[height] - this[speed] * (Date.now() - this[created]));
            if (y < -BUBBLE_IMAGE_SIZE) {
                dispatchEvent(new CustomEvent('destroyBubble', { detail: { bubble: this } }));
            } else if (y > this[height]) {
                y = this[height];
            }
        };

        this[width] = context.canvas.width;
        this[height] = context.canvas.height;

        var y = calculateYPosition();

        if (!this[x]) {
            this[x] = BUBBLE_IMAGE_SIZE / 2 + Math.random() * (this[width] - 1.5 * BUBBLE_IMAGE_SIZE);
        }

        var scale = 0.5 + this[policy].premium / 400;

        context.save();
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.scale(scale, scale);
        context.fillStyle = 'rgba(0, 0, 0, 0.75)';
        context.font = 'bold 20px helvetica';
        context.translate((this[x] + (this[height] - y) * Math.sin(y / 30) / 50) / scale, y / scale);
        context.drawImage(this[image], 0, 0, BUBBLE_IMAGE_SIZE, BUBBLE_IMAGE_SIZE);
        context.fillText(`£${this[policy].premium.toFixed(2)}`, 50, 40);
        context.font = '14px helvetica';
        context.fillText(`${this[policy].postcode}`, 50, 60);
        context.font = 'bold 16px helvetica';
        context.fillText(this[policy].numberOfQuotes, 50, 75);
        context.restore();
    }
};
