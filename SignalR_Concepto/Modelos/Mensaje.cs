using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SignalR_Concepto.Modelos
{
    public class Mensaje
    {
        public string UserName { get; set; }

        public string Message { get; set; }
        public string Descripcion { get; set; }

        public Usuarios usuario { get; set; }
    }
}