//este codigo permite obtener los parametros del navegador para acceder
//a los dispositivos de video y microfono ya que segun el navegador 
//puede llegar a tener parametros distintos

//mas informacion https://developer.mozilla.org/es/docs/Web/API/RTCPeerConnection


//estas variables son accedidas desde la configuracion de la conexcion y de forma simultanea desde los metodos que se crean
var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;
var reattachMediaStream = null;
var webrtcDetectedBrowser = null;

if (navigator.mozGetUserMedia) {
  
    //detecta el navegador en el cual se esta accediendo
    webrtcDetectedBrowser = "firefox";

    // permite la conexion de los dispositivos locales 
  
    //permite almacenar la conexion para crean una comuncacion peer to peer con RTC 
    RTCPeerConnection = mozRTCPeerConnection;

    //en esta seson se alamacenara y se podra compartir los dispositivos para que el usuario remoto pueda ver y escuchar
    RTCSessionDescription = mozRTCSessionDescription;

    // genera un objeto candidato, la conexion establecida con el servidor
    //mantiene los parametros en el que comparte los parametros del audio y video para acceder a ellos
    RTCIceCandidate = mozRTCIceCandidate;

    // obtiene los dispositivos de audio y video
    //detectados por el navegador
    getUserMedia = navigator.mozGetUserMedia.bind(navigator);

    //adjunta la configuracion de los dispositivos 
    attachMediaStream = function (element, stream) {
        element.mozSrcObject = stream;
        element.play();
    };

    reattachMediaStream = function (to, from) {      
        to.mozSrcObject = from.mozSrcObject;
        to.play();
    };

    //capturara la reproduccion de audio y video
    MediaStream.prototype.getVideoTracks = function () {
        return [];
    };

    MediaStream.prototype.getAudioTracks = function () {
        return [];
    };
}
    //si el navegador es chrome
else if (navigator.webkitGetUserMedia) {
  
    //detecta el navegador en el cual se esta accediendo
    webrtcDetectedBrowser = "chrome";

    //permite almacenar la conexion para crean una comuncacion peer to peer con RTC 
    RTCPeerConnection = webkitRTCPeerConnection;

    // obtiene los dispositivos de audio y video
    //detectados por el navegador
    getUserMedia = navigator.webkitGetUserMedia.bind(navigator);

    //adjunta la configuracion de los dispositivos y permite se visualice el video en pantalla
    attachMediaStream = function (element, stream) {
        console.log(stream);
        element.src = webkitURL.createObjectURL(stream);
        console.log(element.src);
    };

    reattachMediaStream = function (to, from) {
        to.src = from.src;
    };

    //capturara la reproduccion de audio y video
    if (!webkitMediaStream.prototype.getVideoTracks) {
        webkitMediaStream.prototype.getVideoTracks = function () {
            return this.videoTracks;
        };
        webkitMediaStream.prototype.getAudioTracks = function () {
            return this.audioTracks;
        };
    }
    if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
        webkitRTCPeerConnection.prototype.getLocalStreams = function () {
            return this.localStreams;
        };
        webkitRTCPeerConnection.prototype.getRemoteStreams = function () {
            return this.remoteStreams;
        };
    }
}
//si el navegador no permita adaptar la configuracion para las video llamadas
else {
    console.log("el navegador no soporta video llamadas");
}