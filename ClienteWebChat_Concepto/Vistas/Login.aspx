<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Login.aspx.cs" Inherits="SignalR_Concepto.Vistas.Login" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
   <!---jquery---->
    <script src="http://localhost:8080/Scripts/jquery-1.9.1.js"></script>

      <!-------Funcionalidades de SignalR-------->
    <script src="../Scripts/SignalR_Metodos.js"></script>

    <script type="text/javascript">
        $(document).ready(function () {
            Login();
        });
    </script>
</head>
<body>
    <form runat="server">

        <div>

            <input id="usuario" placeholder="usuario" />

            <select id="tipo">
                <option value="Cliente" selected="selected">Cliente</option>
                <option value="Asesor">Asesor</option>
            </select>
            <a id="Ingresar">Ingresar</a>
        </div>
    </form>

</body>
</html>
