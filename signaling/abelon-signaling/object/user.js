class User {
    constructor(uid, nickname, info) {
        this._uid = uid;
        this._nickname = nickname;
        this._info = info;
    }

    get uid() {
        return this._uid;
    }

    get nickName() {
        return this._nickname;
    }

    get info() {
        return this._info;
    }

    toJson() {
        return { "uid": this._uid, "nick_name": this._nickname, "info": this._info }
    }
}

module.exports = User;