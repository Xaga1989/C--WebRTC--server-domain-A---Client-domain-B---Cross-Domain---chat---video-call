function Login() {
    localStorage.clear();
    $("#Ingresar").click(function (e) {
        e.preventDefault();
        if ($("#usuario").val() != "") {

            var usuario = { "Tipo": $("#tipo").val(), "Nombre": $("#usuario").val() };
            localStorage.setItem("Usuario", JSON.stringify(usuario));
            if ($("#tipo").val() == "Cliente") {

                window.location = "http://localhost:8080/Vistas/Chat_Cliente.aspx";
            }
            else if ($("#tipo").val() == "Asesor") {

                window.location = "http://localhost:8080/Vistas/Chat_Asesor.aspx"
            }

        }
        else {
            alert("Ingrese un usuario");
        }
    });
}