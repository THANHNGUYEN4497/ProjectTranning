class User {
    constructor(uid, nickname, socketId, info, isUniboRobot = false) {
        this._uid = uid;
        this._nickname = nickname;
        this._socketId = socketId;
        this._info = info;

        this._isUniboRobot = isUniboRobot;
    }

    set isUniboRobot(value) {
        this._isUniboRobot = value;
    }

    get isUniboRobot() {
        return this._isUniboRobot;
    }

    get uid() {
        return this._uid;
    }

    get nickName() {
        return this._nickname;
    }

    get socketId() {
        return this._socketId;
    }

    get info() {
        return this._info;
    }

    toJson() {
        return {"uid":this._uid,"socket_id":this._socketId,"nick_name":this._nickname,"info":this._info}
    }
}

module.exports = User;