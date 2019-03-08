const Message = require("../message.js");

class NotifyMessage extends Message {
    constructor(event) {
        super("notify");

        this._event = event;
    }
}

module.exports = NotifyMessage;