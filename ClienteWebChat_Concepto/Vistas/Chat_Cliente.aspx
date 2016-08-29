<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Chat_Cliente.aspx.cs" Inherits="ClienteWebChat_Concepto.Vistas.Chat_Cliente" %>

<!DOCTYPE html>
<html lang="en">
<head runat="server">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cliente</title>

     <!---jquery---->
    <script src="../Scripts/jquery-1.10.2.js"></script>

      <!---Referencia libreria de signalR---->
    <script src="../Scripts/jquery.signalR-2.2.1.js"></script>
    

      <script src="../Scripts/ejecutarScripts.js"></script>


    <link href="http://localhost:8080/Content/bootstrap.css" rel="stylesheet" />
    <script src="http://localhost:8080/Scripts/bootstrap.js"></script>



    <style>
        .ocultar {
            display: none;
        }
    </style>
</head>
<body>

    <div class="row">
        <div id="chat_cliente" data-asesor="" class="col-xs-4 col-sm-4 col-md-4 col-lg-4">
            <div id="Conectando" class="panel panel-default col-xs-12 col-sm-12 col-md-12 col-lg-12" style="max-height: 300px; overflow-y: scroll;">
                Conectando con asesor
            </div>
            <div id="mensajestools" class="ocultar input-group col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <input id="mensaje" class="form-control" style="width: 100%;" placeholder="Mensaje" />
                <span class="input-group-btn">
                    <a id="enviar" class="btn btn-success">enviar</a>
                </span>
            </div>
        </div>

         <div class="col-xs-8 col-sm-8 col-md-8 col-lg-8 ">      

            <div class="">
                <h4>Asesor</h4>
                <video class="video partner cool-background" autoplay="autoplay"></video>
            </div>
            <div class="" style="height: 100px;">
                <h4>Yo</h4>
                <video class="video mine cool-background" autoplay="autoplay" style="height: 100% !important; width: auto;"></video>
            </div>       
    </div>
    </div>
</body>
</html>
