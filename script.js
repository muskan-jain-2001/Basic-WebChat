(function() {
    var element = function(id) {
        return document.getElementById(id);
    }
    var status = element('status')
    var messages = element('messages')
    var textarea = element('textarea')
    var username = element('username')
    var clearbtn = element('clear')
    var sendbtn = element('send')


    var statusDefault = status.textContent;
    var setStatus = function(s) {
        status.textcontent = s;
        if (s !== statusDefault) {
            var delay = setTimeout(function() {
                setStatus(statusDefault);
            }, 4000);
        }
    }
    var socket = io.connect('http://127.0.0.1:4000');
    if (socket !== undefined) {
        console.log('connected to socket...')
        socket.on('output', function(data) {
            console.log(data);
            if (data.length) {
                for (var x = 0; x < data.length; x++) {
                    var message = document.createElement('div');

                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[x].name + " : " + data[x].message;

                    messages.appendChild(message);
                    //messages.insertBefore(messages.firstChild, message);

                }
            }
        })
        socket.on('status', function(data) {
            setStatus((typeof data === 'object') ? data.message : data)
            if (data.clear) {
                textarea.value = '';
            }
        })
        textarea.addEventListener('keydown', function(event) {
            if (event.which === 13 && event.shiftKey == false) {
                socket.emit('input', {
                    name: username.value,
                    message: textarea.value
                });
                event.preventDefault();

                textarea.value = ''
            }
        })

        sendbtn.addEventListener('click', function() {
            socket.emit('input', {
                name: username.value,
                message: textarea.value
            })
            event.preventDefault()
            textarea.value = ''
        })

        clearbtn.addEventListener('click', function() {
            socket.emit('clear');
        })
        socket.on('cleared', function() {
            messages.textContent = '';
        })
    }

})();