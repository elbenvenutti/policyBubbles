'use strict';

var rest = require('rest');
var moment = require('moment');
var Howl = require('howler').Howl;

const ANIMATION_INTERVAL = 1000 / 60;
const POLLING_INTERVAL = 5 * 60 * 1000;

var width = window.innerWidth;
var height = window.innerHeight;
var sounds = [ '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13' ].map((i) => new Howl({
    urls: [ `wikki/wikki0${i}.mp3` ]
}));

class Bubble {
    constructor(price) {
        this.x = 50 + Math.random() * (width - 150);
        this.y = height;
        this.price = price;
        this.speed = 0.15 + Math.random() / 3;
        this.interval = window.setInterval(this.tick.bind(this), ANIMATION_INTERVAL);
        var soundIndex = 13 - Math.floor(Math.min(1300, Math.max(100, price)) / 100);
        sounds[soundIndex].play();
    }

    tick() {
        this.y = this.y - this.speed;
        if (this.y < -100) {
            window.clearInterval(this.interval);
            destroyBubble(this);
        }
    }

    draw(context) {
        var tick =
        context.save();
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = "20px serif";
        var scale = 0.5 + this.price / 400;
        context.scale(scale, scale);
        context.translate(this.x + (height - this.y) * Math.sin(this.y / 30) / 50, this.y / scale);
        context.drawImage(bubbleImage, 0, 0, 100, 100);
        context.fillText(`£${this.price.toFixed(2)}`, 50, 50);
        context.restore();
    }
};

var bubbles = [];

var destroyBubble = (bubble) => bubbles.splice(bubbles.indexOf(bubble), 1);

var drawFrame = () => {
    var context = document.getElementById('main').getContext('2d');
    context.canvas.width = width;
    context.canvas.height = height;

    context.globalCompositeOperation = 'destination-over';
    context.clearRect(0, 0, 500, 500);

    bubbles.forEach((bubble) => bubble.draw(context));

    nextFrame();
};

var nextFrame = () => window.requestAnimationFrame(drawFrame);

var bubbleImage = new Image();
bubbleImage.src = './bubble.png';

bubbleImage.onload = () => {
    poll()
    setInterval(poll, POLLING_INTERVAL);
    nextFrame();
}

var poll = () => rest('./policies').then((response) => {
    var data = JSON.parse(response.entity.replace(/(:\d\d)\.0/g, '$1').replace(/([^{}\[\],=\s]+)=([^{}\[\],=]+)/g, '"$1":"$2"'));
    var minDate;
    var policies = data.map((policyData) => {
        var date = new moment(policyData.created);
        if (!date.isAfter(minDate)) {
            minDate = date;
        }

        return {
            created: new moment(policyData.created),
            premium: policyData.gross_premium,
        }
    });

    policies.forEach((policy, index) => {
        window.setTimeout(() => bubbles.push(new Bubble(parseFloat(policies[index].premium))),
            100 + policies[index].created.valueOf() - minDate.valueOf());
    });
});
