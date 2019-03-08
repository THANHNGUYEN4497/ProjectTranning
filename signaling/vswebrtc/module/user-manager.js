const redis = require("redis");

const User = require("../object/user.js");

//var _rooms = {};

var _limitRoomSize = 0;
var _maxRoomPerUser = 0;
var _client;

function initializeRedis(ip, port) {
  _client = redis.createClient(
    "redis://" + "" + ":" + "" + "@" + ip + ":" + port
  );
}

function getMembersOfRoom(roomName) {
  return new Promise(function (resolve, reject) {
    memberOfRoom = {};
    let key_roomName = `${roomName}:*`;
    _client.keys(key_roomName, (err, users_in_room) => {
      let number_user = users_in_room.length;
      let count = 0;
      users_in_room.forEach(user_hash => {
        _client.hmget(user_hash, 'uid', 'nickname', 'info', (err, user_data) => {
          count++;
          const [uid, nickname, infos] = user_data
          try {
            let info = JSON.parse(infos);
            let user_obj = new User(
              uid,
              nickname,
              info
            );
            memberOfRoom[user_data[0]] = user_obj;
          } catch (e) {
            reject(e);
          }
          if (count === number_user) {
            resolve(memberOfRoom);
          }
        });
      });
    });
  });
}

function createUidvsSocket(uid, socketId) {
  return new Promise((resolve, reject) => {
    try {
      _client.hget('uid2socket', uid, (err, socketIdOld) => {
        if (socketIdOld === null) {
          _client.hset('uid2socket', uid, socketId);
          _client.hset('socket2uid', socketId, uid);
        } else {
          _client.hset('uid2socket', uid, socketId);
          _client.hdel('socket2uid', socketIdOld, uid);
          _client.hset('socket2uid', socketId, uid);
        }
      });
      resolve();
    } catch (err) {
      reject()
    }
  });
}

function getSocketId(uid) {
  return new Promise((resolve, reject) => {
    try {
      _client.hget('uid2socket', uid, (err, socketId) => {
        resolve(socketId);
      })
    } catch (err) {
      reject()
    }
  })
}

function addUserToRoom(roomName, uid, user) {
  return new Promise(function (resolve, reject) {
    let key_roomName = `${roomName}:*`;
    _client.keys(key_roomName, (err, users_in_room) => {
      if (err) {
        reject(err);
      }
      let key_roomName_uid = `${roomName}:${uid}`;
      _client.keys(key_roomName_uid, (err, userdata) => {
        if (
          _limitRoomSize != 0 &&
          userdata == null &&
          users_in_room.length >= _limitRoomSize
        ) {
          reject(-1);
        }
        if (_maxRoomPerUser != 0) {
          let key_search = `*:${uid}`;
          _client.keys(key_search, (err, users) => {
            if (err) {
              reject(err);
            }
            if (users.length >= _maxRoomPerUser) {
              reject(-2);
            }
            let user_info = JSON.stringify(user.info);
            let hashkey = `${roomName}:${uid}`;
            try {
              _client.hmset(
                hashkey,
                "uid",
                uid,
                "nickname",
                user.nickName,
                "info",
                user_info
              );
              resolve();
            } catch (e) {
              reject(e);
            }
          });
        }
      });
    });
  });
}

function getUserFromRoom(roomName, uid) {
  return new Promise(function (resolve, reject) {
    let user_hash = `${roomName}:${uid}`;
    _client.hmget(user_hash, 'uid', 'nickname', 'info', (err, user_data) => {
      if (err) {
        reject();
      }
      if (user_data && user_data.length) {
        const [uid, nickname, infos] = user_data
        try {
          let info = JSON.parse(infos);
          let user_obj = new User(
            uid,
            nickname,
            info
          );
          resolve(user_obj);
        } catch (e) {
          reject(e);
        }
      } else {
        reject();
      }
    });
  });
}

function removeUserFromRoom(roomName, uid) {
  return new Promise(function (resolve, reject) {
    let user_hash = `${roomName}:${uid}`;
    _client.DEL(user_hash, (err, number) => {
      if (err) {
        reject();
      } else {
        console.log(number);
        resolve();
      }
    });
  });
}

// function getUserBySocketIdFromRoom(roomName, socketId) {
// 	return new Promise(function(resolve, reject) {
// 		if(_rooms[roomName] == null) {
// 			return reject();
// 		}
// 		else {
// 			for (let uid in _rooms[roomName]) {
// 				if(_rooms[roomName][uid].socket_id == socketId)
// 					return resolve(_rooms[roomName][uid]);
// 			}
// 		}

// 		reject();
// 	});
// }

function setLimitRoomSize(limitRoomSize) {
  _limitRoomSize = limitRoomSize;
}

function getLimitRoomSize() {
  return _limitRoomSize;
}

function setMaxRoomPerUser(maxRoomPerUser) {
  _maxRoomPerUser = maxRoomPerUser;
}

function getMaxRoomPerUser() {
  return _maxRoomPerUser;
}

// function getRoomSize(roomName) {
// 	return new Promise(function(resolve, reject) {
// 		return resolve(Object.keys(_rooms[roomName]).length);
// 	});
// }

//----------
exports.initializeRedis = initializeRedis;
exports.getMembersOfRoom = getMembersOfRoom;
exports.createUidvsSocket = createUidvsSocket;
exports.getSocketId = getSocketId;
exports.addUserToRoom = addUserToRoom;
exports.getUserFromRoom = getUserFromRoom;
exports.removeUserFromRoom = removeUserFromRoom;
// exports.getUserBySocketIdFromRoom = getUserBySocketIdFromRoom;
// exports.getRoomSize = getRoomSize;
exports.setLimitRoomSize = setLimitRoomSize;
exports.getLimitRoomSize = getLimitRoomSize;
exports.setMaxRoomPerUser = setMaxRoomPerUser;
exports.getMaxRoomPerUser = getMaxRoomPerUser;
