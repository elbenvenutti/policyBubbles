'use strict';

const REVERSE_SOUNDS = false;
const MIN_SOUND_PRICE = 60;
const MAX_SOUND_PRICE = 600;

var Howl = require('howler').Howl;

var sounds = Symbol();

module.exports = class {
    constructor() {
        var paddedRange = (from, to) => {
            var newRange = [];
            for (let i = from; i <= to; i++) {
                newRange.push(i);
            }
            return newRange.map((number) => `00${number}`.substr(-2, 2));
        };

        this[sounds] = paddedRange(1, 33).map((i) => new Howl({ urls: [`celesta/celesta0${i}.mp3`]}));
    }

    playPremium(premium) {
        var minIndex = 0;
        var maxIndex = this[sounds].length - 1;

        premium = Math.min(premium, MAX_SOUND_PRICE);
        var portion = (premium - MIN_SOUND_PRICE) * (maxIndex - minIndex) / (MAX_SOUND_PRICE - MIN_SOUND_PRICE);
        var soundIndex = Math.round(REVERSE_SOUNDS ? maxIndex - portion : minIndex + portion);

        console.log("sound index of " + soundIndex + " for premium " + premium);
        this[sounds][soundIndex].play();
    }
};
