class Message {
    constructor(type) {
        this._type = type;
    }

    toJson() {
        throw new Error('You have to implement the method toJson!');
    }
}

module.exports = Message;