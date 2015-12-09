'use strict';

const POLLING_INTERVAL = 1;
const MINUTE_IN_MILLISECONDS = 60000;

var rest = require('rest');
var moment = require('moment');

var BubbleCollection = require('./BubbleCollection');
var Policy = require('./Policy');
var SoundManager = require('./SoundManager');

var soundManager = new SoundManager();
var bubbleCollection = new BubbleCollection();

var getContext = () => document.getElementById('main').getContext('2d');

var drawFrame;
var nextFrame = () => window.requestAnimationFrame(drawFrame);
drawFrame = () => {
    var context = getContext();

    context.globalCompositeOperation = 'destination-over';
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    bubbleCollection.draw(context);

    nextFrame();
};

var poll = () => rest(`./policies?minutes=${POLLING_INTERVAL}`).then((response) => {
    var data = JSON.parse(response.entity);
    var minDate;
    var policies = data.map((policyData) => {
        var date = new moment(new Date(policyData.created));
        var action = Policy.ENQUIRY;
        if (!date.isAfter(minDate)) {
            minDate = date;
        }

        if (policyData.event.indexOf('purchase') > -1) {
            action = Policy.PURCHASE;
        } else if (policyData.event.indexOf('cancel') > -1) {
            action = Policy.CANCEL;
        }

        return {
            created: date,
            premium: parseFloat(policyData.premium.replace(/[£,]/g, '')),
            postcode: policyData.postcode,
            action: action,
            numberOfQuotes: action === Policy.ENQUIRY ? policyData.number_of_quotes : ''
        };
    });

    policies.forEach((policy, index) => {
        window.setTimeout(() => bubbleCollection.add(policies[index]), policies[index].created.valueOf() - minDate.valueOf());
    });
});

var resizeCanvas = () => {
    var context = getContext();
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
};

setTimeout(resizeCanvas, 0);

addEventListener('resize', resizeCanvas, false);

addEventListener('bubbleCreated', (event) => {
    soundManager.playPremium(event.detail.premium);
});

addEventListener('bubbleImagesLoaded', () => {
    poll();
    setInterval(poll, POLLING_INTERVAL * MINUTE_IN_MILLISECONDS);
    nextFrame();
});
