const mongo = require('mongodb').MongoClient;
const io = require('socket.io').listen(4000).sockets;
mongo.connect('mongodb://127.0.0.1/chat-app', function(err, db) {

    if (err) {
        throw err;
    }
    console.log('Mongodb connected....')
    io.on('connection', function(socket) {

        var chat = db.collection('chats');
        sendstatus = function(s) {
            socket.emit('status', s)
        }
        chat.find().limit(100).sort({ _id: 1 }).toArray(function(err, res) {
            if (err) {
                throw err;
            }
            socket.emit('output', res)
        });
        socket.on('input', function(data) {
            let name = data.name;
            let message = data.message;
            if (name == '' || message == '') {
                sendstatus('please enter valid name and message')
            } else {
                chat.insert({ name: name, message: message }, function() {
                    io.emit('output', [data])
                    sendstatus({
                        message: 'message sent',
                        clear: true
                    })
                })
            }
        })
        socket.on('clear', function(data) {
            chat.remove({}, function() {
                socket.emit('cleared')
            })
        })
    })
});