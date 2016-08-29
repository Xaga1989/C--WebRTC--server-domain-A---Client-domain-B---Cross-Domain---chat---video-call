//mas informacion https://www.w3.org/TR/webrtc/#dom-rtcpeerconnection-setlocaldescription//
var Modulo = Modulo || {};

Modulo.App = (function (connectionManager) {

    //limpiar las sesiones de cliente y asesor
    localStorage.removeItem('Cliente');
    localStorage.removeItem('Asesor');

    //se establecen las funcionalidades de la aplicacion
    var
        //inicializa la aplicacion 
        _start = function (hub) {
        // detectar si el navegador soporta la video llamada
        if (webrtcDetectedBrowser == null) {

           
        }

        // este metodo solo permite iniciar la sesion en la conexion RTC
        _getUsername();
    },
    // este metodo solo permite iniciar la sesion en la conexion RTC
        _getUsername = function () {

              //realizar el registro del usuario
              _startSession();

        },
        //realizar el registro del usuario
        _startSession = function () {
             

            // pregunta por los permisos para acceder a los dispositivos 
            //en el navegador
             
                getUserMedia(
                    {
                        // retornamos los permisos  
                        video: true,
                        audio: true
                    },
                    // cuando se ha accedido de forma exitosa nos retornara el stram
                    //contiene la informacion de los dispositivos locales 
                    function (stream) { 
                      

                        // en este metodo se inicia la interaccion con signalr (hub)
                        //procedemos a hacer la conexion del usuario con signalr
                        _connect(function (hub) {
                          
                            // se inicializa la configuracion de  la conexion y los metodos para poder realizar y recibir videollamadas

                            connectionManager.initialize(hub.server, _callbacks.onReadyForStream, _callbacks.onStreamAdded, _callbacks.onStreamRemoved);

                            // almacena el stream local
                            _mediaStream = stream;

                            //carga el video local en un html definido
                            var videoElement = document.querySelector('.video.mine');
                            attachMediaStream(videoElement, _mediaStream);

                            // funcionalidades y eventos para la interfaz
                            _attachUiHandlers(hub);

                           
                        }, function (event) {
                           
                        });
                    },
                    function (error) { // error callback
                      
                    }
                );
            },
        _mediaStream,
        _hub,

        //se realiza la conexion del usuario con signalr
        _connect = function (onSuccess, onFailure) {
            // obtenemos la configuracion de la conexion 
            $.support.cors = true;
            $.connection.hub.logging = true;
            $.connection.hub.url = "http://localhost:8080/signalr/";
            var hub = $.connection.chat_Metodos;
            //metodos de cliente , para chat y video llamadas
            metodosCliente(hub);         
            _setupHubCallbacks(hub);

            //$.support.cors = true;
            //$.connection.hub.url = '/signalr/hubs';
           
            //se inicializa la conexion creada y se registra al usuario
            $.connection.hub.start()
                .done(function () {
                    var usuario = JSON.parse(localStorage.getItem("Usuario"));
                    // se envia el registro del usuario
                    hub.server.usuariosConectados(usuario.Nombre, usuario.Tipo).done(function (data) {
                        localStorage.removeItem('Usuario');
                        if (data.Tipo == "Cliente") {
                            console.log("cliente ;" + data.ConnectionId);
                            localStorage.setItem("Cliente", JSON.stringify(data));
                            HablarConUnAsesorDisponible(hub);
                        }
                        else if (data.Tipo == "Asesor") {
                            localStorage.setItem("Asesor", JSON.stringify(data));

                            cambiarestadodisponibilidad(hub);

                        }

                    });

                    if (onSuccess) {
                        onSuccess(hub);
                    }
                })
                .fail(function (event) {
                    if (onFailure) {
                        onFailure(event);
                    }
                });

          
            
            _hub = hub;
        },




      
      //metodos de la interfaz
        _attachUiHandlers = function (hub) {
            // realizar llamada con el cliente que estoy chateando
            $('.llamarCliente').on('click', function () {
                var cliente = JSON.parse(localStorage.getItem("Cliente"));
                var asesor = JSON.parse(localStorage.getItem("Asesor"));
                hub.server.callUser(cliente.ConnectionId);
            });

            // colgar la llamada
            $('.colgarllamada').click(function () {
                hub.server.colgarLlamada();
                configuracionConexion.closeAllConnections();
            });
        },

        //metodos cliente para recibir las llamadas
        _setupHubCallbacks = function (hub) {
            // llamada entrante
            hub.client.incomingCall = function (callingUser) {

               hub.server.answerCall(true, callingUser.ConnectionId);

                     
            };

            //aceptar la llamada
            hub.client.callAccepted = function (acceptingUser) {


                // Callee accepted our call, let's send them an offer with our video stream
                connectionManager.initiateOffer(acceptingUser.ConnectionId, _mediaStream);
                               
            };

            //declinar la llamada
            hub.client.callDeclined = function (decliningConnectionId, reason) {


            };

            //finalizar la llamada
            hub.client.callEnded = function (connectionId, reason) {



                // Close the WebRTC connection
                connectionManager.closeConnection(connectionId);

            };

            //actualizar el listado de usuarios conectados y sua estado
            hub.client.updateUserList = function (userList) {
               
            };

            //recibir la señal
            hub.client.receiveSignal = function (callingUser, data) {
                connectionManager.newSignal(callingUser.ConnectionId, data);
            };
        },

        // sobreescribir los callbacks de la configuracion de la conexion
        _callbacks = {
            onReadyForStream: function (connection) {
                // The connection manager needs our stream
                // todo: not sure I like this
                connection.addStream(_mediaStream);
            },
            onStreamAdded: function (connection, event) {


                // Bind the remote stream to the partner window
                var otherVideo = document.querySelector('.video.partner');
                attachMediaStream(otherVideo, event.stream); // from adapter.js
            },
            onStreamRemoved: function (connection, streamId) {
                // todo: proper stream removal.  right now we are only set up for one-on-one which is why this works.


                // Clear out the partner window
                var otherVideo = document.querySelector('.video.partner');
                otherVideo.src = '';
            }
        };

    //retornar como api los metodos a acceder
    return {
        start: _start       
    };
})
//aqui se inicializa el Modulo primero obtiene el modelo u objeto de usuario , luego los datos de la conexion stream
(Modulo.ConnectionManager);

// Kick off the app
Modulo.App.start();

//metodos cliente de siganlr y webrtc
function metodosCliente(parametros) {

    // esta funcion agrerga el usuario a la conexion
    parametros.client.onConnected = function (id, nombre, todos, mensajes) {




    }

    // reconoce cuando un nuevo usuario se ha conectado
    parametros.client.onNewUserConnected = function (id, nombre) {


    }

    // reconoce cuando un usuario se ha desconectado
    parametros.client.onUserDisconnected = function (id, nombre) {

        alert("desconectado");

    }

    //reconoce cuando se ha recibido un mensaje
    parametros.client.messageReceived = function (nombre, mensaje) {

        //agregar el mensaje recibido a la interfaz grafica
        AgregarMensaje(nombre, mensaje);
    }

    //reconoce cuando se ha enviado un mensaje privado
    parametros.client.sendPrivateMessage = function (id, nombre, mensaje) {


        ////validar si es cliente , para permitir al asesor conocer los datos del cliente
        if (localStorage.getItem("Cliente") == null) {
            parametros.server.obtenerCliente(id).done(function (data) {
                localStorage.setItem("Cliente", JSON.stringify(data));
                enviarMensajeCliente(parametros);
                $("#Conectando").empty();
                //agregar el mensaje recibido a la interfaz grafica
                AgregarMensaje(nombre, mensaje);
            });
        }
        else {
            //agregar el mensaje recibido a la interfaz grafica
            AgregarMensaje(nombre, mensaje);
        }
    }
}

//este metodo permite el intercambio de mensajes entre el asesor hacia el cliente
function enviarMensajeCliente(contexto) {
    $("#mensaje").keypress(function (e) {
        if (e.keyCode == 13) {
            e.preventDefault;
            var cliente = JSON.parse(localStorage.getItem("Cliente"));
            var asesor = JSON.parse(localStorage.getItem("Asesor"));
            //mensaje de bienvenida del asesor
            contexto.server.enviarMensajePrivado(cliente.ConnectionId, asesor.ConnectionId, $("#mensaje").val(), asesor.Nombre);
        }
    });

    $("#enviar").click(function (e) {
        e.preventDefault;
        var cliente = JSON.parse(localStorage.getItem("Cliente"));
        var asesor = JSON.parse(localStorage.getItem("Asesor"));
        //mensaje de bienvenida del asesor
        contexto.server.enviarMensajePrivado(cliente.ConnectionId, asesor.ConnectionId, $("#mensaje").val(), asesor.Nombre);

    });
}

//este metodo permite el intercambio de mensajes entre cliente al asesor
function enviarMensajeAsesor(clienteId, asesorId, contexto) {

    $("#mensaje").keypress(function (e) {
        e.preventDefault;
        if (e.keyCode == 13) {

            var cliente = JSON.parse(localStorage.getItem("Cliente"));
            var asesor = JSON.parse(localStorage.getItem("Asesor"));
            //mensaje de bienvenida del asesor
            contexto.server.enviarMensajePrivado(asesor.ConnectionId, cliente.ConnectionId, $("#mensaje").val(), cliente.Nombre);
        }
    });

    $("#enviar").click(function (e) {
        e.preventDefault;
        var cliente = JSON.parse(localStorage.getItem("Cliente"));
        var asesor = JSON.parse(localStorage.getItem("Asesor"));
        //mensaje de bienvenida del asesor
        contexto.server.enviarMensajePrivado(asesor.ConnectionId, cliente.ConnectionId, $("#mensaje").val(), cliente.Nombre);

    });

}

//este metodopermite cambiar el estado de disponibilidad del asesor
function cambiarestado(asesor, estado, contexto) {
    contexto.server.cambiarEstado(asesor, estado).done(function () {

        if (!estado) {
            localStorage.removeItem('Cliente');
        }
        var asesor = JSON.parse(localStorage.getItem("Asesor"));
        asesor.Disponibilidad = estado;
        localStorage.setItem("Asesor", JSON.stringify(asesor));
    });
}

//esta funcionalidad permite al asesor cambiar su estado de conexion
function cambiarestadodisponibilidad(proxy) {

    var asesor = JSON.parse(localStorage.getItem("Asesor"));

    if (asesor.Disponibilidad == true) {
        $("#estado").attr('data-estado', true);
        $("#estado").addClass('btn-success');
        $("#estado").removeClass('btn-default');
    }
    else {
        $("#estado").attr('data-estado', false);

        $("#estado").removeClass('btn-success');
        $("#estado").addClass('btn-default');
    }

    //boton de cambio de estado de disponibilidad del asesor
    $("#estado").click(function () {
        if ($(this).attr('data-estado') == "true") {

            $(this).attr('data-estado', false);
            cambiarestado(asesor.ConnectionId, false, proxy);

            $("#estado").removeClass('btn-success');
            $("#estado").addClass('btn-default');

        }
        else {
            $(this).attr('data-estado', true);
            cambiarestado(asesor.ConnectionId, true, proxy);

            $("#estado").addClass('btn-success');
            $("#estado").removeClass('btn-default');
        }
    });

}

//esta funcionalidad permitira la comuinicacion con el primer asesor disponible
function HablarConUnAsesorDisponible(contexto) {

    //$.connection.hub.start().done(function () {
        var cliente = JSON.parse(localStorage.getItem("Cliente"));
        localStorage.removeItem('Asesor');

        var asesor = {};

        contexto.server.buscandoAsesor(cliente.ConnectionId, cliente.Tipo).done(function (data) {
            asesor = data;
            if (asesor != null) {
                $("#Conectando").empty();
                localStorage.setItem("Asesor", JSON.stringify(asesor));
                ComunicacionAsesorCliente(asesor.ConnectionId, cliente.ConnectionId, contexto, asesor.Nombre);
            }
            else {
                HablarConUnAsesorDisponible(contexto);
            }

        });




    //});

}

//esta funcionalidad permite la comunicacion entre el asesor y el cliente
function ComunicacionAsesorCliente(asesorId, clienteId, contexto, nombre) {

    //mensaje de bienvenida del asesor
    contexto.server.enviarMensajePrivado(asesorId, clienteId, "Bienvenido esto es un saludo", nombre);

    //funcionalidades de enviar mensajes
    enviarMensajeAsesor(clienteId, asesorId, contexto);

}


//esta funcion agrega los mensajes entre usuarios 
function AgregarMensaje(Nombre, Mensaje) {

    //mostrar las opciones de envio de mensajes
    $("#mensajestools").removeClass('ocultar');
    //aqui se agrega el html correspondiente del mensaje
    $("#Conectando").append('<div class="panel-body"><label>' + Nombre + ': </label><br/><p>' + Mensaje + '</p></div>');
    $("#mensaje").val("");

    $("#mensajestools").animate({ scrollTop: $('#mensajestools').prop("scrollHeight") }, 1000);
}
