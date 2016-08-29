$.getScript("http://localhost:8080/signalr/hubs", function () {
    console.log("ok 1");
    $.getScript("http://localhost:8080/Scripts/SignalRChat/adapatador.js", function () {
 
        console.log("ok 2");
        $.getScript("http://localhost:8080/Scripts/SignalRChat/configuracionConexion.js", function () {
            console.log("ok 3");
            $.getScript("http://localhost:8080/Scripts/SignalRChat/metodosAplicacion.js", function () {
                console.log("ok 4");
            });
          
        });
    });
});