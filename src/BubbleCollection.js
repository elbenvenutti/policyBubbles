'use strict';

var Bubble = require('./Bubble');

var bubbles = Symbol();

module.exports = class {
    constructor () {
        this[bubbles] = [];
        addEventListener('destroyBubble', (event) => this[bubbles].splice(this[bubbles].indexOf(event.detail.bubble), 1));
    }

    addPurchase(policy) {
        this[bubbles].push(new Bubble.Green(policy));
    }

    addEnquiry(policy) {
        this[bubbles].push(new Bubble.Amber(policy));
    }

    addCancellation(policy) {
        this[bubbles].push(new Bubble.Red(policy));
    }

    drawFrame(context) {
        this[bubbles].forEach((bubble) => bubble.draw(context));
    }
};
