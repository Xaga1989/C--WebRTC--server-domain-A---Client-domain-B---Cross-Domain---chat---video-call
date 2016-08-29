using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using SignalR_Concepto.Modelos;
using System.Runtime.Remoting.Contexts;
using Microsoft.AspNet.SignalR.Hubs;
using System.Threading.Tasks;


namespace SignalR_Concepto.Chat
{

    public class Chat_Metodos : Hub
    {

        static List<Usuarios> Asesores = new List<Usuarios>();
        static List<Mensaje> Mensajes = new List<Mensaje>();


        //esta metodo es activado cuando hace login un usuario 
        public Usuarios UsuariosConectados(string Nombre, string Tipo)
        {
            try
            {

                //crear la disponibilidad del usario
                var id = Context.ConnectionId;
                Usuarios usuario = new Usuarios();
                if (Tipo == "Asesor")
                {
                    usuario.Nombre = Nombre;
                    usuario.ConnectionId = id;
                    usuario.Tipo = Tipo;
                    usuario.Disponibilidad = false;

                    Asesores.Add(usuario);


                }
                else
                {
                    usuario.Nombre = Nombre;
                    usuario.ConnectionId = id;
                    usuario.Tipo = Tipo;
                    usuario.Disponibilidad = true;
                    Asesores.Add(usuario);
                }

                // send to caller
                Clients.Caller.onConnected(id, Nombre, Asesores, Mensajes);

                // send to all except caller client
                Clients.AllExcept(id).onNewUserConnected(id, Nombre);


                return usuario;
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        //este metodo permite al cliente buscar un asesor disponible para atender su solicitud
        public Usuarios BuscandoAsesor(string Cliente_Id, string Tipo)
        {
            try
            {


                if (Tipo == "Cliente")
                {
                    var asesor = (from a in Asesores
                                  where a.Tipo == "Asesor" && a.Disponibilidad == true
                                  select a).FirstOrDefault();

                    if (asesor != null)
                    {
                        CambiarEstado(asesor.ConnectionId, false);
                    }
                    return asesor;
                }
                else
                {
                    return null;
                }

            }
            catch (Exception e)
            {
                throw e;

            }

        }

        //Enviar Mensajes privados
        public void EnviarMensajePrivado(string para, string desde, string Mensaje_Texto, string Nombre)
        {

            var usuariopara = Asesores.FirstOrDefault(x => x.ConnectionId == para);
            var usuariodesde = Asesores.FirstOrDefault(x => x.ConnectionId == desde);

            if (usuariopara != null && usuariodesde != null)
            {
                Clients.Client(usuariopara.ConnectionId).sendPrivateMessage(usuariodesde.ConnectionId, Nombre, Mensaje_Texto);

                // enviar mensaje a los usuarios
                Clients.Caller.sendPrivateMessage(usuariopara.ConnectionId, Nombre, Mensaje_Texto);

            }

        }

        //cambiar estado de disponibilidad del asesor
        public void CambiarEstado(string Asesor, bool Estado)
        {

            Asesores.Where(x => x.ConnectionId == Asesor && x.Tipo == "Asesor").FirstOrDefault().Disponibilidad = Estado;


        }

        //obtener el usuario por id
        public Usuarios ObtenerCliente(string cliente)
        {

            var Cliente = Asesores.Where(x => x.ConnectionId == cliente && x.Tipo == "Cliente").FirstOrDefault();
            return Cliente;
        }


        // video llamadas

        //este metodo permitira realizar la llamada desde el asesor al cliente
        public void CallUser(string targetConnectionId)
        {
            var callingUser = Asesores.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);
            var targetUser = Asesores.SingleOrDefault(u => u.ConnectionId == targetConnectionId);


            // They are here, so tell them someone wants to talk
            Clients.Client(targetConnectionId).incomingCall(callingUser);


        }

        public void AnswerCall(bool acceptCall, string targetConnectionId)
        {
            var callingUser = Asesores.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);
            var targetUser = Asesores.SingleOrDefault(u => u.ConnectionId == targetConnectionId);

            // Tell the original caller that the call was accepted
            Clients.Client(callingUser.ConnectionId).callAccepted(targetUser);

        }

        public void HangUp()
        {

        }

        // WebRTC Signal Handler
        public void SendSignal(string signal, string targetConnectionId)
        {
            var callingUser = Asesores.SingleOrDefault(u => u.ConnectionId == Context.ConnectionId);
            var targetUser = Asesores.SingleOrDefault(u => u.ConnectionId == targetConnectionId);


            // These folks are in a call together, let's let em talk WebRTC
            Clients.Client(targetConnectionId).receiveSignal(callingUser, signal);

           //Clients.Client(targetConnectionId).receiveSignal("usuario", "senal");

        }

    }
}
