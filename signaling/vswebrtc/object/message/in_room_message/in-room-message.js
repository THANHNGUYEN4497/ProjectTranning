const Message = require("../message.js");

class InRoomMessage extends Message {
    constructor(type, roomName) {
        super(type, roomName);

        this._roomName = roomName;
    }
}

module.exports = InRoomMessage;