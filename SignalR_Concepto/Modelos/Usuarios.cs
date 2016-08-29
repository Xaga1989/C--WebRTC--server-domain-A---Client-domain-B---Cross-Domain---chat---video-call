using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SignalR_Concepto.Modelos
{
    public class Usuarios
    {
        public string ConnectionId { get; set; }

        public string Nombre { get; set; }

        public string Tipo { get; set; }

        public bool Disponibilidad { get; set; }
    }
}