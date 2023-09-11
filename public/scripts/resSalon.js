function dirigirTurnos() {
    window.location.href = '../resCancha.html';
}
  
function dirigirNosotros() {
    window.location.href = '../nosotros.html';
}
  
function dirigirInformacion() {
    window.location.href = '../informacion.html';
}
  
function obtenerUsuarioAutenticado() {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const email = user.email;
            const partesEmail = email.split('@');
            const usuario = partesEmail[0];
            const emailElemento = document.getElementById('mensaje-email');
            emailElemento.textContent = usuario;
        } else {
            console.log('No hay usuario autenticado.');
        }
        unsubscribe(); // Detenemos la escucha del cambio de estado para evitar llamadas innecesarias
    });
}

function cargarFormularioSalon() {
    const db = firebase.firestore();
    const salonRef = db.collection('turnos-salon');
    //const turnosRef = db.collection('turnos-canchas');

    const canchaabiertaInput = document.getElementById('canchaabierta'); // checkbox.checked devuelve true o false
    const canchatechadaInput = document.getElementById('canchatechada');
    const fechaInput = document.getElementById('fecha');
    const horaInput = document.getElementById('hora');
    
    const canchaabierta = canchaabiertaInput.checked;
    const canchatechada = canchatechadaInput.checked;
    const fecha = fechaInput.value;
    const hora = horaInput.value;
    const cliente = firebase.auth().currentUser.email;
    const id = Math.random();
    


    // Verificar si se ha seleccionado una fecha y una cancha
    if (!fecha || !hora || fecha == "" || hora == "") {
        alert('Debes seleccionar una fecha y una hora');
        return; // cortar la ejecucion de la funcion antes de que se guarde la reserva
    }

    // Mostrar segunda confirmación
    const confirmacion = confirm(`Desea confirmar la siguiente reserva?\nFecha: ${fecha} - Hora: ${hora}\nCancha abierta: ${canchaabierta ? 'Sí' : 'No'}\nCancha techada: ${canchatechada ? 'Sí' : 'No'}`);

    if (!confirmacion) {
        return; // cortar la ejecucion de la funcion antes de que se guarde la reserva si se presiono cancelar
    }

    //crear documento a guardar
    const turno = {
        canchaabierta: canchaabierta,
        canchatechada: canchatechada,
        fecha: fecha,
        hora: hora,
        cliente: cliente,
        id: id
    };

    salonRef
        .add(turno)
        .then(() => {
            console.log('Turno agregado correctamente');
            //limpiarFormulario();
            cargarReservasDisponibles(); // Actualizar las opciones de hora después de agregar un turno
            mostrarReservasUsuario(); // Actualizar la tabla de reservas del usuario
        })
        .catch((error) => {
            console.log('Error al agregar el turno: ' + error.message);
        });
    
    if (canchaabierta) {
        const horaNum1 = parseInt(hora, 10);
        const horaNum2 = horaNum1+1;
        const horaNum3 = horaNum1+2;

        const hora2 = horaNum2 + "";
        const hora3 = horaNum3 + "";

        agregarTurnosCanchas('abierta', cliente, fecha, hora, id);
        agregarTurnosCanchas('abierta', cliente, fecha, hora2, id);
        agregarTurnosCanchas('abierta', cliente, fecha, hora3, id);
    }

    if (canchatechada) {
        const horaNum1 = parseInt(hora, 10);
        const horaNum2 = horaNum1+1;
        const horaNum3 = horaNum1+2;

        const hora2 = horaNum2 + "";
        const hora3 = horaNum3 + "";

        agregarTurnosCanchas('techada', cliente, fecha, hora, id);
        agregarTurnosCanchas('techada', cliente, fecha, hora2, id);
        agregarTurnosCanchas('techada', cliente, fecha, hora3, id);
    }
}

function agregarTurnosCanchas(cancha, cliente, fecha, hora, id) {
    const db = firebase.firestore();
    const turnosRef = db.collection('turnos-canchas');

    const turno = {
        cancha: cancha,
        cliente: cliente,
        fecha: fecha,
        hora: hora,
        id: id
    }

    turnosRef
        .add(turno)
        .then(() => {
            console.log('turno cancha agregado');
        })
        .catch((error) =>{
            console.log('hubo un error: ' + error.message);
        })
}

function cargarReservasDisponibles() {
    const fechaInput = document.getElementById('fecha');
    const horaSelect = document.getElementById('hora');
    //const canchaabierta = document.getElementById('canchaabierta');
    //const canchatechada = document.getElementById('canchatechada');
 
    const fecha = fechaInput.value;
    const hora = horaSelect.value;
    console.log(hora);

    const db = firebase.firestore();
    //const turnosRef = db.collection('turnos-canchas');
    const salonRef = db.collection('turnos-salon');
    
    salonRef
        .where('fecha', '==', fecha)
        .get()
        .then((querySnapshot) => {
            const horasOcupadas = [];
            querySnapshot.forEach((doc) => {
                //console.log((doc.data().fecha) == fecha)
                const horaOcupada = parseInt(doc.data().hora);
                horasOcupadas.push(horaOcupada);
                horasOcupadas.push((horaOcupada+1));
                horasOcupadas.push((horaOcupada+2));
                horasOcupadas.push((horaOcupada-1));
                horasOcupadas.push((horaOcupada-2));
                /* agrego a la lista de horas ocupadas la hora de inicio del turno que ya esta en la bd, las dos
                horas siguientes, que va a estar ocupado por ese mismo turno, y las dos horas anteriores,
                ya que son las que estaran ocupadas por el turno que se quiere sacar, que necesita tener
                3 horas de disponibilidad desde el inicio hasta el otro */
            });
            
            const selectHora = document.getElementById('hora');
            selectHora.innerHTML = '';
            
            for (let i = 12; i <= 22; i++) {
                if (!horasOcupadas.includes(i)) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.text = i;
                    selectHora.appendChild(option);
                }
            }
            selectHora.value = hora;
        })
        .catch((error) => {
            console.log('Error al cargar los turnos disponibles:', error);
        });
    
    const horaNum1 = parseInt(hora, 10);
    const horaNum2 = horaNum1+1;
    const horaNum3 = horaNum1+2;

    const hora2 = horaNum2 + "";
    const hora3 = horaNum3 + "";
    
    deshabilitarCheckboxTechada(fecha, hora, hora2, hora3);
    deshabilitarCheckboxAbierta(fecha, hora, hora2, hora3);
    console.log(horaSelect.value);
    horaSelect.value = hora;
    console.log(horaSelect.value);
    
}

async function deshabilitarCheckboxTechada(fecha, hora, hora2, hora3) {
    const disponibilidadHora1 = await consultarTurnos('techada', fecha, hora);
    console.log(disponibilidadHora1 === true);
  
    const disponibilidadHora2 = await consultarTurnos('techada', fecha, hora2);
    console.log(disponibilidadHora2 === true);
  
    const disponibilidadHora3 = await consultarTurnos('techada', fecha, hora3);
    console.log(disponibilidadHora3 === true);

    if (disponibilidadHora1 === true || disponibilidadHora2 === true || disponibilidadHora3 === true) {
        canchatechada.checked = false;
        canchatechada.disabled = true;
    } else {
        canchatechada.disabled = false;
    }
}

async function deshabilitarCheckboxAbierta(fecha, hora, hora2, hora3) {
    const disponibilidadHora1 = await consultarTurnos('abierta', fecha, hora);
    console.log(disponibilidadHora1 === true);
  
    const disponibilidadHora2 = await consultarTurnos('abierta', fecha, hora2);
    console.log(disponibilidadHora2 === true);
  
    const disponibilidadHora3 = await consultarTurnos('abierta', fecha, hora3);
    console.log(disponibilidadHora3 === true);

    if (disponibilidadHora1 === true || disponibilidadHora2 === true || disponibilidadHora3 === true) {
        canchaabierta.checked = false;
        canchaabierta.disabled = true;
    } else {
        canchaabierta.disabled = false;
    }
}

async function consultarTurnos(cancha, fecha, hora) {
    const db = firebase.firestore();
    const turnosRef = db.collection('turnos-canchas');

    const querySnapshot = await turnosRef
        .where('cancha', '==', cancha)
        .where('fecha', '==', fecha)
        .where('hora', '==', hora)
        .get();

    if (querySnapshot.empty) {
        return false;
    } else {
        return true;
    }
}

function mostrarReservasUsuario() {
    const tablaTurnos = document.getElementById('tabla-reservas');
    const bodyTablaReservas = document.getElementById('body-tabla-reservas');
    const usuario = firebase.auth().currentUser;
  
    if (usuario) {
      const userEmail = usuario.email;
      const db = firebase.firestore();
      const turnosRef = db.collection('turnos-salon');
  
      turnosRef
        .where('cliente', '==', userEmail)
        .get()
        .then((querySnapshot) => {
          // Limpiamos el contenido actual de la tabla
          bodyTablaReservas.innerHTML = '';
  
          //const fechaActual = new Date(); // Obtener la fecha actual
  
          const reservas = []; // Array para almacenar las reservas futuras
  
          querySnapshot.forEach((doc) => {
            const reserva = doc.data();
  
            // Validar si la fecha de la reserva ya pasó
            if (validarFechaPasada(reserva.fecha)) {
              return; // Ignorar la reserva que ya pasó
            }
  
            const [dia, mes, anio] = reserva.fecha.split('/');
            const hora = reserva.hora; // La hora ya es un número entero
  
            reserva.fecha = buildDate(anio, mes, dia, hora); // Construir la fecha y hora a partir de los datos
            reserva.id = doc.id; // Asignar el valor del doc.id al campo "id" del objeto "reserva"
  
            reservas.push(reserva); // Agregar la reserva futura al array de reservas
          });
  
          // Ordenar las reservas por fecha y hora (de los más próximos a los más lejanos)
          reservas.sort((a, b) => a.fecha - b.fecha);
  
          // Mostrar las reservas ordenadas en la tabla
          reservas.forEach((reserva) => {
            const fila = document.createElement('tr');
            const celdaFecha = document.createElement('td');
            const celdaHora = document.createElement('td');
            const celdaCanchaAbierta = document.createElement('td');
            const celdaCanchaTechada = document.createElement('td');
            const celdaEliminar = document.createElement('td'); // Celda para el botón de eliminar
  
            celdaFecha.textContent = reserva.fecha.toLocaleDateString(); // Convertir la fecha a formato legible
            celdaHora.textContent = reserva.hora;
            celdaCanchaAbierta.textContent = reserva.canchaabierta ? 'Sí' : 'No';
            celdaCanchaTechada.textContent = reserva.canchatechada ? 'Sí' : 'No';
  
            const botonEliminar = document.createElement('button');
            botonEliminar.innerHTML = '<i class="fas fa-trash-alt"></i>';
            botonEliminar.className = 'boton-eliminar'; // Agrega una clase CSS al botón
            botonEliminar.addEventListener('click', () => {
              eliminarReserva(reserva.id); // Llamada a la función para eliminar la reserva
            });
  
            celdaEliminar.appendChild(botonEliminar);
  
            fila.appendChild(celdaFecha);
            fila.appendChild(celdaHora);
            fila.appendChild(celdaCanchaAbierta);
            fila.appendChild(celdaCanchaTechada);
            fila.appendChild(celdaEliminar); // Agregamos la celda del botón de eliminar a la fila
  
            bodyTablaReservas.appendChild(fila);
          });
  
          // Mostramos la tabla
          tablaTurnos.style.display = 'table';
        })
        .catch((error) => {
          console.log('Error al obtener las reservas del usuario:', error);
        });
    } else {
      // No hay usuario autenticado, ocultamos la tabla
      tablaTurnos.style.display = 'none';
    }
}
  
function eliminarReserva(docId) {
    const confirmacion = confirm('¿Deseas eliminar la reserva seleccionada?');
  
    if (confirmacion) {
      const db = firebase.firestore();
      const salonRef = db.collection('turnos-salon');
      const turnosRef = db.collection('turnos-canchas');
  
      salonRef
        .doc(docId)
        .get()
        .then((doc) => {
          const id = doc.data().id;
  
          // Eliminar los turnos de la colección "turnos-canchas" con el mismo id
          turnosRef
            .where('id', '==', id)
            .get()
            .then((querySnapshot) => {
              const batch = db.batch();
  
              querySnapshot.forEach((doc) => {
                const turnoRef = turnosRef.doc(doc.id);
                batch.delete(turnoRef);
              });
  
              return batch.commit();
            })
            .then(() => {
              console.log('Turnos eliminados');
  
              // Eliminar la reserva del salón de la colección "turnos-salon"
              salonRef
                .doc(docId)
                .delete()
                .then(() => {
                  console.log('Reserva borrada');
                  cargarReservasDisponibles();
                  mostrarReservasUsuario(); // Actualizar la tabla de reservas del usuario
                })
                .catch((error) => {
                  console.log('Error al borrar la reserva:', error);
                });
            })
            .catch((error) => {
              console.log('Error al eliminar los turnos:', error);
            });
        })
        .catch((error) => {
          console.log('Error al obtener el documento de la reserva:', error);
        });
    }
}

function validarFechaPasada(fechaString) {
    const fechaActual = new Date();
    const [dia, mes, anio] = fechaString.split('/');
  
    // Ten en cuenta que el objeto Date espera el mes en base 0, por lo que restamos 1 al mes
    const fechaReserva = new Date(anio, mes - 1, dia);
  
    // Comparamos solo el día, mes y año sin tener en cuenta la hora
    fechaActual.setHours(0, 0, 0, 0);
    fechaReserva.setHours(0, 0, 0, 0);
  
    return fechaReserva < fechaActual;
}

function buildDate(year, month, day, hour) {
    const date = new Date(year, month - 1, day);
    date.setHours(hour);
    return date;
}