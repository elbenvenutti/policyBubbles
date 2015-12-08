"use strict";

const ANIMATION_INTERVAL = 1000 / 60;
const POLLING_INTERVAL = 1;
const MINUTE_IN_MILLISECONDS = 60000;
const PURCHASE = 0;
const ENQUIRY = 1;
const CANCEL = 2;

const REVERSE_SOUNDS = false;
const MIN_SOUND_PRICE = 60;
const MAX_SOUND_PRICE = 600;

const BUBBLE_IMAGE_SIZE = 100;

var rest = require('rest');
var moment = require('moment');
var Howl = require('howler').Howl;

var width = window.innerWidth;
var height = window.innerHeight;

var paddedRange = (from, to) => {
    var newRange = [];
    for (let i = from; i <= to; i++) {
        newRange.push(i);
    }
    return newRange.map((number) => `00${number}`.substr(-2, 2));
};

var sounds = paddedRange(1, 33).map((i) => new Howl({ urls: [`celesta/celesta0${i}.mp3`]}));

var bubbles = [];

var destroyBubble = (bubble) => bubbles.splice(bubbles.indexOf(bubble), 1);

var loadBubbleImage = (colour) => {
    var bubbleImage = new Image();
    bubbleImage.src = `./${colour}Bubble.png`;
    return bubbleImage;
};

var bubbleImages = [ 'green', 'orange', 'red' ].map((colour) => loadBubbleImage(colour));

class Bubble {
    constructor(policy) {
        this.policy = policy;
        this.x = 50 + Math.random() * (width - 150);
        this.y = height;
        this.speed = 0.15 + Math.random() / 3;
        this.interval = window.setInterval(this.tick.bind(this), ANIMATION_INTERVAL);

        sounds[this.soundIndexFor(this.policy.premium)].play();
    }

    soundIndexFor(x) {
        if (x > MAX_SOUND_PRICE) {
            x = MAX_SOUND_PRICE;
        }
        var nMin = 0;
        var nMax = sounds.length - 1;

        var portion = (x - MIN_SOUND_PRICE) * (nMax - nMin) / (MAX_SOUND_PRICE - MIN_SOUND_PRICE);

        var result = portion + nMin;
        if (REVERSE_SOUNDS) {
            result = nMax - portion;
        }

        var number = Math.round(result);
        console.log("sound index of " + number + " for premium " + x);
        return number;
    }

    tick() {
        this.y = this.y - this.speed;
        if (this.y < -100) {
            window.clearInterval(this.interval);
            destroyBubble(this);
        } else if (this.y > height) {
            this.y = height;
        }
    }

    draw(context) {
        var scale = 0.5 + this.policy.premium / 400;

        context.save();
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.scale(scale, scale);
        context.fillStyle = 'rgba(0, 0, 0, 0.75)';
        context.font = 'bold 20px helvetica';
        context.translate((this.x + (height - this.y) * Math.sin(this.y / 30) / 50) / scale, this.y / scale);
        context.drawImage(bubbleImages[this.policy.action], 0, 0, BUBBLE_IMAGE_SIZE, BUBBLE_IMAGE_SIZE);
        context.fillText(`£${this.policy.premium.toFixed(2)}`, 50, 40);
        context.font = '14px helvetica';
        context.fillText(`${this.policy.postcode}`, 50, 60);
        if (this.policy.action === ENQUIRY) {
            context.font = 'bold 16px helvetica';
            context.fillText(this.policy.numberOfQuotes, 50, 75);
        }
        context.restore();
    }
}

var drawFrame;

var nextFrame = () => window.requestAnimationFrame(drawFrame);

drawFrame = () => {
    var context = document.getElementById('main').getContext('2d');
    context.canvas.width = width;
    context.canvas.height = height;

    context.globalCompositeOperation = 'destination-over';
    context.clearRect(0, 0, 500, 500);

    bubbles.forEach((bubble) => bubble.draw(context));

    nextFrame();
};

var poll = () => rest(`./policies?minutes=${POLLING_INTERVAL}`).then((response) => {
    var data = JSON.parse(response.entity);
    var minDate;
    var policies = data.map((policyData) => {
        var date = new moment(new Date(policyData.created));
        var action = ENQUIRY;
        if (!date.isAfter(minDate)) {
            minDate = date;
        }

        if (policyData.event.indexOf('purchase') > -1) {
            action = PURCHASE;
        } else if (policyData.event.indexOf('cancel') > -1) {
            action = CANCEL;
        }

        return {
            created: date,
            premium: parseFloat(policyData.premium.replace(/[£,]/g, '')),
            postcode: policyData.postcode,
            action: action,
            numberOfQuotes: policyData.number_of_quotes
        };
    });

    policies.forEach((policy, index) => {
        window.setTimeout(() => bubbles.push(new Bubble(policies[index])), policies[index].created.valueOf() - minDate.valueOf());
    });
});

bubbleImages[CANCEL].onload = () => {
    poll();
    setInterval(poll, POLLING_INTERVAL * MINUTE_IN_MILLISECONDS);
    nextFrame();
};

window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
}, false);
