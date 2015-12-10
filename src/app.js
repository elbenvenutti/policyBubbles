'use strict';

const POLLING_INTERVAL = 1;

var rest = require('rest');

var BubbleCollection = require('./BubbleCollection');
var SoundManager = require('./SoundManager');

var soundManager = new SoundManager();
var bubbleCollection = new BubbleCollection();

var context;
var resizeCanvas = () => {
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
};
addEventListener('resize', resizeCanvas, false);

var drawFrame;
var animate = () => window.requestAnimationFrame(drawFrame);
drawFrame = () => {
    context.globalCompositeOperation = 'destination-over';
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    bubbleCollection.drawFrame(context);

    animate();
};

var createBubblesFromResponse = (response) => {
    var data = JSON.parse(response.entity);
    var minDate = data.reduce((a, b) => a ? Math.min(a, Date.parse(b.created)) : Date.parse(b.created));
    data.forEach((policyData) => {
        var policy = {
            premium: parseFloat(policyData.premium.replace(/[£,]/g, '')),
            postcode: policyData.postcode,
            numberOfQuotes: policyData.number_of_quotes
        };

        var bubbleDelay = Date.parse(policyData.created) - minDate;
        var delay = (delayedFunction) => setTimeout(delayedFunction, bubbleDelay);

        if (policyData.event.indexOf('purchase') > -1) {
            delay(() => bubbleCollection.addPurchase(policy));
        } else if (policyData.event.indexOf('cancel') > -1) {
            delay(() => bubbleCollection.addCancellation(policy));
        } else {
            delay(() => bubbleCollection.addEnquiry(policy));
        }
    });
};

var updatePolicyData = () => rest(`./policies?minutes=${POLLING_INTERVAL}`).then(createBubblesFromResponse);

addEventListener('bubbleCreated', (event) => soundManager.playPremium(event.detail.premium));
addEventListener('purchaseBubbleCreated', () => soundManager.playPurchase());

window.onload = () => {
    context = document.getElementById('main').getContext('2d');
    resizeCanvas();
    updatePolicyData();
    setTimeout(animate, 0);
    setInterval(updatePolicyData, POLLING_INTERVAL * 60000);
};
