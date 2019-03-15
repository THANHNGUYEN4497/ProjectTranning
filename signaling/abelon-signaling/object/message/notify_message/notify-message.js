const Message = require("../message.js");

class NotifyMessage extends Message {
    constructor(event) {
        super();

        this._event = event;
    }
}

module.exports = NotifyMessage;