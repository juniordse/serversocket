const WebSocket = require('ws');

const PORT = 5000;
let newClient = null;

const wsServer = new WebSocket.Server({
    port: PORT
});

var players = {}

wsServer.on('connection', function (socket) {
    console.log("A client just connected");
    
    var id = (Math.round(Math.random()*(20000-10000)+10000)).toString();
    players[id] = {
        "velocity.x": "0",
        "velocity.y": "0",
        "velocity.z": "0",
        "rotation.x": "0",
        "rotation.y": "0",
        "rotation.z": "0",
        "relativeVelocity": "0"
    };
    socket.randomID = id;
    
    newClient = socket;

    // Envia para o player conectado seu próprio id
    socket.send(' {"type":"playerID", "id":"'+id+'"}');

    // Envia a lista dos clientes ao novo cliente conectado
    var strg = getJsonString(players, id);
    socket.send(strg); 
    
    

    // Nova conexão no Server > Avisa os outros
    wsServer.clients.forEach(function (client) {
        if (client != newClient) {
            client.send(' {"type":"action", "action": "player_connected", "id": "' + socket.randomID.toString() + '"}');
        }
    });


    socket.on('message', function (msg) {

        if (isJSON(msg)) {
            try {
                const jsonData = JSON.parse(msg);

                if (jsonData["type"] == "position") {

                    const sendingClient = socket;

                    var velocity_x = jsonData["velocity.x"];
                    var velocity_y = jsonData["velocity.y"];
                    var velocity_z = jsonData["velocity.z"];
                    var rotation_x = jsonData["rotation.x"];
                    var rotation_y = jsonData["rotation.y"];
                    var rotation_z = jsonData["rotation.z"];
                    var relativeVelocity = jsonData["relativeVelocity"];
                    var position_x = jsonData["position.x"];
                    var position_y = jsonData["position.y"];
                    var position_z = jsonData["position.z"];

                    players[socket.randomID]["velocity.x"] = velocity_x;
                    players[socket.randomID]["velocity.y"] = velocity_y;
                    players[socket.randomID]["velocity.z"] = velocity_z;
                    players[socket.randomID]["rotation.x"] = rotation_x;
                    players[socket.randomID]["rotation.y"] = rotation_y;
                    players[socket.randomID]["rotation.z"] = rotation_z;
                    players[socket.randomID]["relativeVelocity"] = relativeVelocity;
                    players[socket.randomID]["position.x"] = position_x;
                    players[socket.randomID]["position.y"] = position_y;
                    players[socket.randomID]["position.z"] = position_z;

                    wsServer.clients.forEach(function (client) {
                        if (client != sendingClient) {
                            // O id é o cliente que deverá ter sua posição alterada
                            client.send(
                                ' {"type":"position", "id":"' + socket.randomID.toString() + '", "velocity.x": "' + velocity_x + '", "velocity.y": "' + velocity_y + '", "velocity.z": "' + velocity_z + '", "rotation.x": "' + rotation_x + '", "rotation.y": "' + rotation_y + '", "rotation.z": "' + rotation_z + '", "relativeVelocity": "' + relativeVelocity + '", "position.x": "' + position_x + '", "position.y": "' + position_y + '", "position.z": "' + position_z + '"}'
                            )
                        }
                    });
                }
                else {
                    console.log("not is position")
                }

            } catch (error) {
                console.error("Erro ao analisar a string JSON:", error);
            }
        }
        else {
            console.log("is not json")
        }
        



        // Broadcast that message to all connected clients
        //wsServer.clients.forEach(function (client) {
        //    client.send("O servidor recebeu sua mensagem :) ->: " + msg);
        //});

    });

    socket.on('close', function () {
        console.log('Client disconnected');

        delete players[socket.randomID];
        newClient = socket;

        wsServer.clients.forEach(function (client) {
            if (client !== newClient) {
                client.send(' {"type":"action", "action": "player_desconnected", "id": "' + socket.randomID.toString() + '"}');
            }
        });
    })

});

console.log( (new Date()) + " Server is listening on port " + PORT);


function isJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (error) {
        return false;
    }
}

function getJsonString(players, id) {
    var finalString = " ";
    var count = 0;

    for (var key in players) {
        if(key != id) {
            var tempString = "";

            if(count == 0) { tempString += " type:list_players-"; }

            tempString += '{"id": "'+key+'", "velocity.x": "'+players[key]["velocity.x"]+'", "velocity.y": "'+players[key]["velocity.y"]+'", "velocity.z": "'+players[key]["velocity.z"]+'", "rotation.x": "'+players[key]["rotation.x"]+'", "rotation.y": "'+players[key]["rotation.y"]+'", "rotation.z": "'+players[key]["rotation.z"]+'", "relativeVelocity": "'+players[key]["relativeVelocity"]+'", "position.x": "'+players[key]["position.x"]+'", "position.y": "'+players[key]["position.y"]+'", "position.z": "'+players[key]["position.z"]+'"}*';
            
            finalString += tempString
            count++;
        }
    }

    
    return finalString.slice(0, -1);;
}