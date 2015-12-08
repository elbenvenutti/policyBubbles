'use strict';

var rest = require('rest');
var moment = require('moment');
var Howl = require('howler').Howl;

const ANIMATION_INTERVAL = 1000 / 60;
const POLLING_INTERVAL = 1;
const MINUTE_IN_MILLISECONDS = 60000;

var width = window.innerWidth;
var height = window.innerHeight;
var sounds = [ '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '18', '19', '20', '21', '22', '23', '24', '25', '26','27', '28','29','30','31','32','33' ].map((i) => new Howl({
    urls: [ `celesta/celesta0${i}.mp3` ]
}));

class Bubble {
    constructor(policy) {
        this.policy = policy;
        this.x = 50 + Math.random() * (width - 150);
        this.y = height;
        this.speed = 0.15 + Math.random() / 3;
        this.interval = window.setInterval(this.tick.bind(this), ANIMATION_INTERVAL);

        sounds[this.remap(this.policy.premium, 60, 600, 1, 33)].play();
    }

    remap(x, oMin, oMax, nMin, nMax) {
        if (x > oMax) {
            x = oMax;
        }
        //range check
        if (oMin == oMax) {
            console.log("Warning: Zero input range");
            return None;
        };

        if (nMin == nMax) {
            console.log("Warning: Zero output range");
            return None
        }

        //check reversed input range
        var reverseInput = false;
        var oldMin = Math.min(oMin, oMax);
        var oldMax = Math.max(oMin, oMax);
        if (oldMin != oMin) {
            reverseInput = true;
        }

        //check reversed output range
        var reverseOutput = false;
        var newMin = Math.min(nMin, nMax)
        var newMax = Math.max(nMin, nMax)
        if (newMin != nMin) {
            reverseOutput = true;
        };

        var portion = (x - oldMin) * (newMax - newMin) / (oldMax - oldMin)
        if (reverseInput) {
            portion = (oldMax - x) * (newMax - newMin) / (oldMax - oldMin);
        };

        var result = portion + newMin
        if (reverseOutput) {
            result = newMax - portion;
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
        context.fillStyle = 'rgba(0, 0, 0, 0.75)';
        context.font = '20px helvetica';
        context.scale(scale, scale);
        context.translate(this.x + (height - this.y) * Math.sin(this.y / 30) / 50 / scale, this.y / scale);
        context.drawImage(bubbleImages[this.policy.colour], 0, 0, 100, 100);
        context.fillText(`£${this.policy.premium.toFixed(2)}`, 50, 40);
        context.font = '14px helvetica';
        context.fillText(`${this.policy.postcode}`, 50, 60);
        if (this.policy.colour === 'orange') {
            context.fillText(this.policy.numberOfQuotes, 50, 80);
        }
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

var loadBubbleImage = (colour) => {
    var bubbleImage = new Image();
    bubbleImage.src = `./${colour}Bubble.png`;
    return bubbleImage;
}

var bubbleImages = {
    red: loadBubbleImage('red'),
    green: loadBubbleImage('green'),
    orange: loadBubbleImage('orange')
};

bubbleImages.orange.onload = () => {
    poll()
    setInterval(poll, POLLING_INTERVAL * MINUTE_IN_MILLISECONDS);
    nextFrame();
}

var poll = () => rest(`./policies?minutes=${POLLING_INTERVAL}`).then((response) => {
    var data = JSON.parse(response.entity);
    var minDate;
    var policies = data.map((policyData) => {
        var date = new moment(new Date(policyData.created));
        var colour = 'green';
        if (!date.isAfter(minDate)) {
            minDate = date;
        }

        if (policyData.event.indexOf('purchase') > -1) {
            colour = 'orange'
        } else if (policyData.event.indexOf('cancel') > -1) {
            colour = 'red'
        }

        return {
            created: date,
            premium: parseFloat(policyData.premium.replace(/[£,]/g, '')),
            postcode: policyData.postcode,
            colour: colour,
            numberOfQuotes: policyData.number_of_quotes
        }
    });

    console.log(`will create ${policies.length} bubbles`);

    policies.forEach((policy, index) => {
        window.setTimeout(() => bubbles.push(new Bubble(policies[index])), policies[index].created.valueOf() - minDate.valueOf());
    });
});

window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
}, false);
