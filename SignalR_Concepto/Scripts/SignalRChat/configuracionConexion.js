//mas informacion https://www.w3.org/TR/webrtc/#dom-rtcpeerconnection-setlocaldescription//

/************************************************
ConnectionManager.js


Implementa conectividad WebRTC para compartir vídeos en el navegador
, y la funcionalidad para el resto
de la aplicación.

se integra con el  adaptador.js

************************************************/

var Modulo = Modulo || {};
//configuracion de la conexion 
Modulo.ConnectionManager = (function () {
    var _signaler,
        _connections = {},
        //se necesita una dns para acceder al video y sonido , y que se pueda visualizar entre los usuarios
        //puede ser un numero cualquiera no hay limitantes
        _iceServers = [{ url: 'stun:stun.l.google.com:19302' }],

       //aciones que se realizaran cuando se inicie la conexion de los dispositivos ppor medio de una llamada
       //se crean como funciones vacias , cuando se inicie seran sobrescritas
        _onReadyForStreamCallback = function () { },
        _onStreamAddedCallback = function () { },
        _onStreamRemovedCallback = function () { },

        // Inicializar el ConnectionManager con un emisor de señales y devoluciones de llamada para controlar los eventos
        //se recibe como parametros las funciones que realizara la interfaz y la conexion del usuario remoto
        _initialize = function (signaler, onReadyForStream, onStreamAdded, onStreamRemoved) {
            _signaler = signaler;

            //se sobreescriben funciones
            _onReadyForStreamCallback = onReadyForStream || _onReadyForStreamCallback;
            _onStreamAddedCallback = onStreamAdded || _onStreamAddedCallback;
            _onStreamRemovedCallback = onStreamRemoved || _onStreamRemovedCallback;
        },

        //Crear una nueva conexión con el usuario el cual se esta comunicando
        _createConnection = function (partnerClientId) {


            // crea la nueva conexion para establecer la comunicacion peer to peer
            var connection = new RTCPeerConnection({ iceServers: _iceServers });

            // envia las señales o parametros de la configuracion de los dispositivos para que el usuario
            //remoto pueda acceder a ellos
            connection.onicecandidate = function (event) {
                if (event.candidate) {
                    // encuentra un nuevo candidate
                    _signaler.sendSignal(JSON.stringify({ "candidate": event.candidate }), partnerClientId);
                } else {

                }
            };

            // manejo del estado de la conexion
            connection.onstatechange = function () {
                // solo visualiza las transciones del estado , pero no realzia ningun tipo de
                //accion en la configuracion
                var states = {
                    'iceConnectionState': connection.iceConnectionState,
                    'iceGatheringState': connection.iceGatheringState,
                    'readyState': connection.readyState,
                    'signalingState': connection.signalingState
                };


            };

            // se realiza el evento del envio de video al usuario remoto
            connection.onaddstream = function (event) {
                // permite atravez de la interfaz de uisuario devolver la llamada
                _onStreamAddedCallback(connection, event);
            };

            //remueve la conexion que se establecio
            connection.onremovestream = function (event) {
                _onStreamRemovedCallback(connection, event.stream.id);
            };

            // almacena la conexion
            _connections[partnerClientId] = connection;

            // retorna la conexion
            return connection;
        },

        // proceso en que se recibe la señal del usuario remoto para poder acceder a sus dispositovos, de igual forma 
        //se enevia la configuracion local
        _receivedSdpSignal = function (connection, partnerClientId, sdp) {


            //se crea la session remota para la comunicacion peer to peer
            connection.setRemoteDescription(new RTCSessionDescription(sdp),
                function () {
                    if (connection.remoteDescription.type == "offer") {

                        _onReadyForStreamCallback(connection);
                        connection.createAnswer(function (desc) {
                            connection.setLocalDescription(desc, function () {
                                _signaler.sendSignal(JSON.stringify({ "sdp": connection.localDescription }), partnerClientId);
                            });
                        },
                        function (error) { });
                    }

                    else if (connection.remoteDescription.type == "answer") {

                    }
                });
        },

        //permite crear la señal del usuario remoto para poder acceder a ella 
        _newSignal = function (partnerClientId, data) {
            var signal = JSON.parse(data),
                connection = _getConnection(partnerClientId);

            console.log(signal);
            console.log(connection);

            // se valida el tipo de señal para convertirla o seguir con ella
            if (signal.sdp) {
                _receivedSdpSignal(connection, partnerClientId, signal.sdp);
            } else if (signal.candidate) {
                _receivedCandidateSignal(connection, partnerClientId, signal.candidate);
            }
        },

        // se convierte la señal de tipo candidate a una señal sdp
        _receivedCandidateSignal = function (connection, partnerClientId, receivedSDP) {

            var candidate = new RTCIceCandidate(receivedSDP);
            console.log(candidate);
            connection.addIceCandidate(candidate).then(_=> {
                console.log("ok");
            }).catch(e=> {
                console.log("Error");
            });
        },

        // permite devolver o crear la conexion del usuario remoto
        _getConnection = function (partnerClientId) {
            var connection = _connections[partnerClientId] || _createConnection(partnerClientId);
            return connection;
        },

        // permite cerrar la conexion establecida entre usuarios
        _closeAllConnections = function () {
            for (var connectionId in _connections) {
                _closeConnection(connectionId);
            }
        },

        // permite cerrar la conexion establecida entre dos usuarios
        _closeConnection = function (partnerClientId) {
            var connection = _connections[partnerClientId];

            if (connection) {
                //se sobreescribe las funcionalidades
                _onStreamRemovedCallback(null, null);

                //se cierra la conexion
                connection.close();
                delete _connections[partnerClientId]; // Remove the property
            }
        },

        // permite iniciar la offerta 
        //hace la peticion para acceder a los dispositovos del usuario remoto y compartir el local
        _initiateOffer = function (partnerClientId, stream) {
            // obtenemos la conexion del usuario remoto
            var connection = _getConnection(partnerClientId);

            // agregamos los dispositivos
            connection.addStream(stream);



            //enviamos la oferta y la señal que retorna la oferta
            connection.createOffer(function (desc) {
                connection.setLocalDescription(desc, function () {
                    _signaler.sendSignal(JSON.stringify({ "sdp": connection.localDescription }), partnerClientId);
                });
            }, function (error) { });
        };

    // retorno de los metodos del api
    return {
        initialize: _initialize,
        newSignal: _newSignal,
        closeConnection: _closeConnection,
        closeAllConnections: _closeAllConnections,
        initiateOffer: _initiateOffer
    };
})();