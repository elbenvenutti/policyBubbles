'use strict';

const PURCHASE = 0;

module.exports = class {
    static get PURCHASE() {
        return PURCHASE;
    }

    static get ENQUIRY() {
        return 1;
    }

    static get CANCEL() {
        return 2;
    }
};
