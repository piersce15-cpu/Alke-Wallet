/*
Proyecto: Alke Wallet
Descripción: Simulación de billetera digital
Tecnologías: HTML, CSS, JavaScript, jQuery, Bootstrap
Persistencia: localStorage
Autora: Piera Cifuentes Espejo
Año: 2026
Nota: Este archivo contiene el código realizado con JavaScript y jQuery, comentar que la IA me ayudo a realaizarlo, puesto que me ha costado entender el lenguaje y su sintaxis.
*/

// --- INICIALIZACIÓN GLOBAL ---

$(document).ready(function() {
    // 1. Inicialización y Carga de Saldo
    var saldoGuardado = localStorage.getItem("saldo");
    var $h2Saldo = $("#saldo-actual"); 
    
    if ($h2Saldo.length && saldoGuardado) { // .length verifica si el elemento existe
        $h2Saldo.text("$" + parseInt(saldoGuardado).toLocaleString('es-CL'));
    }

    // Inicializar saldo si no existe
    if (!localStorage.getItem("saldo")) {
        localStorage.setItem("saldo", "100000");
    }

    // Ejecutar funciones iniciales
    cargarTablaMovimientos();
    actualizarVistasContactos();

    // 2. Manejo del Login (formulario)
    $('#loginForm').on('submit', function(event) {
        event.preventDefault();
        var email = $("#email").val(); // .val() obtiene el valor del input
        var pass = $("#password").val();
        //Verificar credenciales
        if (email === "usuario@alke.com" && pass === "1234") {
            alert("Iniciando sesión...");
            window.location.href = "menu.html";
        } else {
            alert("Error: Email o contraseña incorrectos. Inténtelo de nuevo");
        }
    });
});

// --- FUNCIONES GLOBALES ---


// Depósito

$(document).on("click", "#btnDepositar", realizarDeposito);

function realizarDeposito(event) {
    event.preventDefault();
    var montoTexto = $("#monto").val();
    var monto = parseInt(montoTexto);
    if (isNaN(monto) || monto <= 0) { alert("Ingrese un monto válido para depositar."); return; }
    var saldoActual = parseInt(localStorage.getItem("saldo")) || 0;
    var nuevoSaldo = saldoActual + parseInt(monto);
    
    localStorage.setItem("saldo", nuevoSaldo); 
    guardarMovimiento("Depósito", "+" + monto);
    
    alert("Depósito realizado. Nuevo saldo: $" + nuevoSaldo);
    window.location.href = "menu.html";
}

// Envío de dinero

$(document).on("click", "#btnRealizarEnvio", realizarEnvio);

function realizarEnvio(event) {
    event.preventDefault();
    var montoAEnviar = parseInt($("#monto-enviar").val());
    var saldoActual = parseInt(localStorage.getItem("saldo"));
    
    // Contacto seleccionado
    var nombreContacto = $("#contacto-seleccionado option:selected").text();

    if (montoAEnviar <= saldoActual && montoAEnviar > 0) {
        var nuevoSaldo = saldoActual - montoAEnviar;
        localStorage.setItem("saldo", nuevoSaldo);
        
        // Pasamos el nombre del contacto a la función
        guardarMovimiento("Envío", "-" + montoAEnviar, nombreContacto);
        
        alert("Envío a " + nombreContacto + " realizado.");
        window.location.href = "menu.html";
    } else {
        alert("Saldo insuficiente o monto inválido.");
    }
}

// Historial de Movimientos
function guardarMovimiento(tipo, monto, destinatario = "") {
    var movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
    
    // Si hay un destinatario, lo sumamos al tipo de movimiento
    // Ejemplo: "Envío a Juan Pérez"
    var tipoDetallado = destinatario ? `${tipo} a ${destinatario}` : tipo;

    var nuevoMovimiento = {
        fecha: new Date().toLocaleDateString(),
        tipo: tipoDetallado,
        monto: monto
    };

    movimientos.unshift(nuevoMovimiento); // unshift lo pone al principio de la lista
    localStorage.setItem("movimientos", JSON.stringify(movimientos));
}

function cargarTablaMovimientos() {
    var $tablaBody = $("#tabla-movimientos"); 
    if ($tablaBody.length) {
        var movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
        if (movimientos.length > 0) {
            $tablaBody.empty(); // .empty() limpia el contenido previo
            
            $.each(movimientos, function(i, m) { // $.each es el for de jQuery
                var signo = m.monto.charAt(0);
                var numero = m.monto.substring(1);
                var textoFinal = signo + "$" + numero;
                var colorClase = (signo === "+") ? "text-success" : "text-danger";
                var fila = `<tr>
                                <td>${m.fecha}</td>
                                <td>${m.tipo}</td>
                                <td class="${colorClase} font-weight-bold">${textoFinal}</td>
                            </tr>`;
                $tablaBody.append(fila); // .append() agrega al final del elemento
            });
        }
    }
}

//Agregar contacto

$(document).on("click", "#btnAgregarContacto", agregarContacto);

function agregarContacto() {
    // 1. Pedimos los datos del nuevo contacto
    var nombre = prompt("Nombre y Apellido:");
    var RUT = prompt("Número de RUT:");
    var alias = prompt("Alias:");
    var banco = prompt("Nombre del Banco:");
    var cuentabancaria = prompt("Número de Cuenta:");

    // 2. Validamos que no estén vacíos
    if (nombre && RUT && alias && banco && cuentabancaria) {
        var contactos = JSON.parse(localStorage.getItem("contactos")) || [];
        
        // 3. Guardamos el objeto
        contactos.push({ 
            nombre: nombre, 
            rut: RUT, 
            alias: alias, 
            banco: banco,
            cuentabancaria: cuentabancaria 
        });
        
        localStorage.setItem("contactos", JSON.stringify(contactos));
        alert("Contacto " + nombre + " agregado con éxito.");
        
        // 4. Refrescamos las vistas 
        actualizarVistasContactos(); 
    } else {
        alert("Todos los campos son obligatorios.");
    }
}

function actualizarVistasContactos() {
    var $selector = $("#contacto-seleccionado"); // El <select>
    var $listaDetallada = $("#lista-detallada-contactos"); // El <div>
    var contactos = JSON.parse(localStorage.getItem("contactos")) || [];

    // Limpiar el select y poner la opción por defecto
    if ($selector.length) {
        $selector.empty().append('<option value="">-- Elige un contacto --</option>');
        $.each(contactos, function(i, c) {
            $selector.append(`<option value="${c.rut}">${c.nombre}</option>`);
        });
    }

    // Limpiar la lista visual y dibujar los contactos
    if ($listaDetallada.length) {
        $listaDetallada.empty(); 
        if (contactos.length === 0) {
        $listaDetallada.append('<p class="text-center p-3">No tienes contactos agendados aún.</p>');}
       else {
        $.each(contactos, function(j, c) {
            var item = `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${c.nombre}</strong><br>
                        <small>RUT: ${c.rut} | Banco: ${c.banco} | Cuenta: ${c.cuentabancaria}</small>
                    </div>
                    <div>
                        <button class='btn btn-sm btn-primary' onclick='editarContacto(${j})'>Editar</button>
                        <button class='btn btn-sm btn-danger' onclick='borrarContacto(${j})'>Borrar</button>
                    </div>
                </div>`;
            $listaDetallada.append(item);
        });
    }}
}

// Funciones de Borrar y Editar Contactos
function borrarContacto(indice) {
    if (confirm("¿Estás seguro de que quieres eliminar este contacto?")) {
        var contactos = JSON.parse(localStorage.getItem("contactos")) || [];
        contactos.splice(indice, 1);
        localStorage.setItem("contactos", JSON.stringify(contactos));
        actualizarVistasContactos();
    }
}

function editarContacto(indice) {
    var contactos = JSON.parse(localStorage.getItem("contactos")) || [];
    var c = contactos[indice];
    var nuevoNombre = prompt("Editar Nombre:", c.nombre);
    var nuevoRut = prompt("Editar RUT:", c.rut);
    var nuevoAlias = prompt("Editar Alias:", c.alias);
    var nuevoBanco = prompt("Editar Banco:", c.banco);
    var nuevaCuentaBancaria = prompt("Editar Cuenta Bancaria:", c.cuentabancaria);

    if (nuevoNombre && nuevoRut && nuevoAlias && nuevoBanco && nuevaCuentaBancaria) {
        contactos[indice] = { nombre: nuevoNombre, rut: nuevoRut, alias: nuevoAlias, banco: nuevoBanco, cuentabancaria: nuevaCuentaBancaria };
        localStorage.setItem("contactos", JSON.stringify(contactos));
        actualizarVistasContactos();
        alert("Contacto actualizado.");
    }

}


