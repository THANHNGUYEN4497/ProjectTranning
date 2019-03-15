const NotifyMessage = require("./notify-message.js");

class ExitFailMessage extends NotifyMessage {
    constructor(roomName, errorMsg) {
        super("exit_fail");

        this._roomName = roomName;
        this._errorMsg = errorMsg;
    }

    toJson() {
        return {"event":this._event,"content":{"room_name":this._roomName,"error_msg":this._errorMsg}};
    }
}

module.exports = ExitFailMessage;