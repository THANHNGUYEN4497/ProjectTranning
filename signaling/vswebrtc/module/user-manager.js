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
    let key_roomName = roomName + ":*";
    _client.keys(key_roomName, (err, users_in_room) => {
      let number_user = users_in_room.length;
      let count = 0;
      users_in_room.forEach(user_hash => {
        _client.hvals(user_hash, (err, user_data) => {
          count++;
          try {
            let info = JSON.parse(user_data[3]);
            let user_obj = new User(
              user_data[0],
              user_data[1],
              user_data[2],
              info
            );
            memberOfRoom[user_data[0]] = user_obj;
          } catch (e) {
            reject(e);
          }

          if (count == number_user) {
            resolve(memberOfRoom);
          }
        });
      });
    });
    // resolve(_rooms[roomName]);
  });
}

function updateUserSocketId(roomName, uid, socketId) {
  return new Promise(function (resolve, reject) {
    let hashkey = roomName + ":" + uid;
    _client.hmset(hashkey, "socketId", socketId);
    resolve();
  });
}

function addUserToRoom(roomName, uid, user) {
  return new Promise(function (resolve, reject) {
    let key_roomName = roomName + ":*";
    _client.keys(key_roomName, (err, users_in_room) => {
      if (err) {
        reject(err);
      }
      let key_roomName_uid = roomName + ":" + uid;
      _client.keys(key_roomName_uid, (err, userdata) => {
        if (
          _limitRoomSize != 0 &&
          userdata == null &&
          users_in_room.length >= _limitRoomSize
        ) {
          reject(-1);
        }
        if (_maxRoomPerUser != 0) {
          let key_search = "*:" + uid;
          _client.keys(key_search, (err, users) => {
            if (err) {
              reject(err);
            }
            if (users.length >= _maxRoomPerUser) {
              reject(-2);
            }
            let user_info = JSON.stringify(user.info);
            let hashkey = roomName + ":" + uid;
            try {
              _client.hmset(
                hashkey,
                "uid",
                uid,
                "nickname",
                user.nickName,
                "socketId",
                user.socketId,
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
    // if(_limitRoomSize != 0 && _rooms[roomName] != null && _rooms[roomName][uid] == null && Object.keys(_rooms[roomName]).length >= _limitRoomSize) {
    // 	reject(-1);
    // }
    // if(_maxRoomPerUser != 0) {
    // 	let count = 0;
    // 	for(let room_name in _rooms) {
    // 		if(_rooms[room_name][uid] != null)
    // 			count++;
    // 	}

    // 	if(count >= _maxRoomPerUser) {
    // 		reject(-2);
    // 	}
    // }

    // if(_rooms[roomName] == null)
    // 	_rooms[roomName] = {};

    // _rooms[roomName][uid] = user;
  });
}

function getUserFromRoom(roomName, uid) {
  return new Promise(function (resolve, reject) {
    let user_hash = roomName + ":" + uid;
    _client.hvals(user_hash, (err, user_data) => {
      if (err) {
        reject();
      }
      if (user_data && user_data.length) {
        try {
          let info = JSON.parse(user_data[3]);
          let user_obj = new User(
            user_data[0], // uid
            user_data[1], // nickname
            user_data[2], // socketId
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
    // if(_rooms[roomName] == null) {
    // 	reject();
    // }
    // else {
    // 	resolve(_rooms[roomName][uid]);
    // }
  });
}

function removeUserFromRoom(roomName, uid) {
  return new Promise(function (resolve, reject) {
    let user_hash = roomName + ":" + uid;
    _client.DEL(user_hash, (err, number) => {
      if (err) {
        reject();
      } else {
        console.log(number);
        resolve();
      }
    });
    // if(_rooms[roomName] == null) {
    // 	reject();
    // }
    // else {
    // 	delete _rooms[roomName][socketId];
    // 	resolve();
    // }
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
exports.updateUserSocketId = updateUserSocketId;
exports.addUserToRoom = addUserToRoom;
exports.getUserFromRoom = getUserFromRoom;
exports.removeUserFromRoom = removeUserFromRoom;
// exports.getUserBySocketIdFromRoom = getUserBySocketIdFromRoom;
// exports.getRoomSize = getRoomSize;
exports.setLimitRoomSize = setLimitRoomSize;
exports.getLimitRoomSize = getLimitRoomSize;
exports.setMaxRoomPerUser = setMaxRoomPerUser;
exports.getMaxRoomPerUser = getMaxRoomPerUser;
