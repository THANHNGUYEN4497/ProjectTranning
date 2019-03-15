const Message = require("../message.js");

class InRoomMessage extends Message {
    constructor(roomName) {
        super(roomName);

        this._roomName = roomName;
    }
}

module.exports = InRoomMessage;