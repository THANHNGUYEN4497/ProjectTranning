const NotifyMessage = require("./notify-message.js");

class EnterFailMessage extends NotifyMessage {
    constructor(roomName, errorMsg) {
        super("enter_fail");

        this._roomName = roomName;
        this._errorMsg = errorMsg;
    }

    toJson() {
        return {"event":this._event,"content":{"room_name":this._roomName,"error_msg":this._errorMsg}};
    }
}

module.exports = EnterFailMessage;