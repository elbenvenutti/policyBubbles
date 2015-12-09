'use strict';

var Bubble = require('./Bubble');

var bubbleImages = Symbol();
var bubbles = Symbol();

module.exports = class {
    constructor () {
        var loadBubbleImage = (colour) => {
            var bubbleImage = new Image();
            bubbleImage.src = `./${colour}Bubble.png`;
            return bubbleImage;
        };

        this[bubbles] = [];

        this[bubbleImages] = [ 'green', 'orange', 'red' ].map((colour) => loadBubbleImage(colour));
        this[bubbleImages][2].onload = () => dispatchEvent(new Event('bubbleImagesLoaded'));

        addEventListener('destroyBubble', (event) => this[bubbles].splice(this[bubbles].indexOf(event.detail.bubble), 1));
    }

    add(policy) {
        this[bubbles].push(new Bubble(policy, this[bubbleImages][policy.action]));
    }

    draw(context) {
        this[bubbles].forEach((bubble) => bubble.draw(context));
    }
};
