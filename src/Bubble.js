'use strict';

const ANIMATION_INTERVAL = 1000 / 60;
const BUBBLE_IMAGE_SIZE = 100;

var SoundManager = require('./SoundManager');
var Policy = require('./Policy');

var soundManager = new SoundManager();

var bubbles = [];

var loadBubbleImage = (colour) => {
    var bubbleImage = new Image();
    bubbleImage.src = `./${colour}Bubble.png`;
    return bubbleImage;
};

var bubbleImages = [ 'green', 'orange', 'red' ].map((colour) => loadBubbleImage(colour));

var destroyBubble = (bubble) => bubbles.splice(bubbles.indexOf(bubble), 1);

var height = Symbol();
var width = Symbol();

class Bubble {
    constructor(policy) {
        this.policy = policy;
        this.speed = 0.15 + Math.random() / 3;

        soundManager.playPremium(this.policy.premium);
    }

    tick() {
        if (this.x && this.y) {
            this.y = this.y - this.speed;
            if (this.y < -100) {
                window.clearInterval(this.interval);
                destroyBubble(this);
            } else if (this.y > this[height]) {
                this.y = this[height];
            }
        }
    }

    draw(context) {
        this[width] = context.canvas.width;
        this[height] = context.canvas.height;

        if (!this.x && !this.y) {
            this.x = 50 + Math.random() * (this[width] - 150);
            this.y = this[height];
            this.interval = window.setInterval(this.tick.bind(this), ANIMATION_INTERVAL);
        }

        var scale = 0.5 + this.policy.premium / 400;

        context.save();
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.scale(scale, scale);
        context.fillStyle = 'rgba(0, 0, 0, 0.75)';
        context.font = 'bold 20px helvetica';
        context.translate((this.x + (this[height] - this.y) * Math.sin(this.y / 30) / 50) / scale, this.y / scale);
        context.drawImage(bubbleImages[this.policy.action], 0, 0, BUBBLE_IMAGE_SIZE, BUBBLE_IMAGE_SIZE);
        context.fillText(`£${this.policy.premium.toFixed(2)}`, 50, 40);
        context.font = '14px helvetica';
        context.fillText(`${this.policy.postcode}`, 50, 60);
        if (this.policy.action === Policy.ENQUIRY) {
            context.font = 'bold 16px helvetica';
            context.fillText(this.policy.numberOfQuotes, 50, 75);
        }
        context.restore();
    }
}

class BubbleCollection {
    add(policy) {
        bubbles.push(new Bubble(policy));
    }

    draw(context) {
        bubbles.forEach((bubble) => bubble.draw(context));
    }

    set onImagesLoaded(handler) {
        bubbleImages[Policy.CANCEL].onload = handler;
    }
}

module.exports = new BubbleCollection();
