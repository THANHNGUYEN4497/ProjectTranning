const io = require("socket.io");
const redis = require('socket.io-redis');

const _log = require("../util/log.js");

const User = require("../object/user.js");

const RoomMessage = require("../object/message/in_room_message/room-message.js");

const EnterFailMessage = require("../object/message/notify_message/enter-fail-message.js");
const ExitFailMessage = require("../object/message/notify_message/exit-fail-message.js");

var _io;
var _userManager;

function handle(webServer, redisServerInfo, userManager) {
  _io = io.listen(webServer)
  //using redis adapter
  _io.adapter(redis(redisServerInfo));

  _userManager = userManager;
  _io.sockets.on('connection', handleEvent);
}

//----------
function handleEvent(socket) {
  _log.writeServerLog(1, socket.id + " connected!");

  socket.on('error', function (err) {
    _log.writeServerLog(3, "Server error: " + err.message);
  });

  socket.on('update', function (old_info) {
    old_info.forEach(elm => {
      _userManager.updateUserSocketId(elm.room_name, elm.uid, socket.id);
    });
  });

  socket.on('enter', function (new_member) {
    let roomName = new_member.room_name;
    let newMember = new User(new_member.uid, new_member.nick_name, socket.id, new_member.info);

    _userManager.addUserToRoom(roomName, newMember.uid, newMember)
      .then(() => {
        _io.of('/').adapter.remoteJoin(socket.id, roomName, (err) => {
          if (err) {
            _log.writeServerLog(3, newMember.uid + " joins room [" + roomName + "] fail. " + err.message);
          } else {
            _log.writeServerLog(1, newMember.uid + " joins room [" + roomName + "] success with socket:" + socket.id);
            _userManager.getMembersOfRoom(roomName)
              .then((members) => {
                if (members != null) {
                  let joinMsg = new RoomMessage(roomName, newMember.uid);
                  joinMsg.joinedMember = newMember;
                  for (let uid in members) {
                    joinMsg.addMember(members[uid]);
                  }
                  broadcastMessageToRoom(socket, joinMsg.toJson(), true);
                }
              }).catch((err) => {
                _log.writeServerLog(3, newMember.uid + " creates room [" + roomName + "] fail. " + err.message);

                let joinFailMsg = new EnterFailMessage(roomName, errorCode.message);
                sendMessageFromServer(socket, joinFailMsg.toJson());
              });
          }
        });
      })
      .catch((errorCode) => {
        if (errorCode == -1) {
          _log.writeServerLog(3, newMember.uid + " joins room [" + roomName + "] fail. Reach to limitation of member in room: " + _userManager.getLimitRoomSize());

          let joinFailMsg = new EnterFailMessage(roomName, "Reach to limitation of member in room: " + _userManager.getLimitRoomSize());
          sendMessageFromServer(socket, joinFailMsg.toJson());
        }
        else if (errorCode == -2) {
          _log.writeServerLog(3, newMember.uid + " creates room [" + roomName + "] fail. Reach to max of room per user: " + _userManager.getMaxRoomPerUser());

          let joinFailMsg = new EnterFailMessage(roomName, "Reach to max of room per user: " + _userManager.getMaxRoomPerUser());
          sendMessageFromServer(socket, joinFailMsg.toJson());
        }
        else {
          _log.writeServerLog(3, newMember.uid + " creates room [" + roomName + "] fail. " + errorCode.message);

          let joinFailMsg = new EnterFailMessage(roomName, errorCode.message);
          sendMessageFromServer(socket, joinFailMsg.toJson());
        }
      });
  });

  socket.on('exit', function (info) {
    var roomName = info.room_name;
    var uid = info.uid;

    var currentUser;

    _userManager.getUserFromRoom(roomName, uid)
      .then((user) => {
        if (user == null) {
          throw (uid + " leave room [" + roomName + "] fail. Not in this room");
        }
        else {
          currentUser = user;
          return _userManager.getMembersOfRoom(roomName);
        }
      })
      .then((members) => {
        if (members != null) {
          let leaveMsg = new RoomMessage(roomName, uid);
          leaveMsg.leftMember = new User(uid, currentUser.nickName, socket.id, currentUser.info);
          _userManager.removeUserFromRoom(roomName, uid)
            .then(() => {
              _io.of('/').adapter.remoteLeave(socket.id, roomName, (err) => {
                if (err) {
                  throw err;
                } else {
                  _log.writeServerLog(1, uid + " leaves room [" + roomName + "] success with socket:" + socket.id);
                }
              });
              for (let uId in members) {
                leaveMsg.addMember(members[uId]);
              }
              broadcastMessageToRoom(socket, leaveMsg.toJson(), true);
            });
        }
      }
      )
      .catch((errorCode) => {
        _log.writeServerLog(3, errorCode);

        let leaveFailMsg = new ExitFailMessage(roomName, "Not in this room");
        sendMessageFromServer(socket, leaveFailMsg.toJson());
      });
  });

  socket.on('message', function (message) {
    if (!message) return;

    if (message.send_to) {
      _userManager.getUserFromRoom(message.room_name, message.send_to)
        .then((receiver) => {
          sendMessageToTargetInRoom(socket, receiver.socketId, message);
        })
        .catch(() => {
          _log.writeServerLog(2, message.from + " send message fail. Receiver " + message.send_to + " doesn't exist");
        });
    }
    else {
      broadcastMessageToRoom(socket, message, false);
    }
  });

  socket.on('disconnect', function () {
    _log.writeServerLog(0, socket.id + " disconnected!");
  });
}

//----------
function broadcastMessageToRoom(socket, message, includeMe) {
  if (message.room_name) {
    try {
      if (includeMe) {
        _io.sockets.in(message.room_name).emit('message', message);
      }
      else {
        socket.broadcast.to(message.room_name).emit('message', message);
      }
      _log.writeServerLog(0, message.from + " broadcasts msg: " + JSON.stringify(message));
    } catch (e) {
      _log.writeServerLog(3, "broadcastMessageToRoom error: " + e.message);
    }
  }
}

function sendMessageToTargetInRoom(socket, target, message) {
  if (target) {
    try {
      socket.to(target).emit('message', message);
      _log.writeServerLog(0, message.from + " send msg: " + JSON.stringify(message));
    } catch (e) {
      _log.writeServerLog(3, "sendMessageToTargetInRoom error: " + e.message);
    }
    return;
  }
}

function sendMessageFromServer(targetSocket, message) {
  if (targetSocket) {
    try {
      targetSocket.emit('message', message);
      _log.writeServerLog(0, "Server send msg: " + JSON.stringify(message));
    } catch (e) {
      _log.writeServerLog(3, "sendMessageFromServer error: " + e.message);
    }
    return;
  }
}

//----------      
exports.handle = handle;