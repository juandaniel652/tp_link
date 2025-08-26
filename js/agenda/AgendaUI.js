export class AgendaUI {
  constructor(agenda) {
    this.agenda = agenda;
  }

  crearEncabezado() {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');

    const thHora = document.createElement('th');
    thHora.textContent = 'Hora';
    thHora.classList.add('hora');
    tr.appendChild(thHora);

    for (let i = 0; i < this.agenda.numDias; i++) {
      const fechaDia = new Date(this.agenda.fechaInicioSemana);
      fechaDia.setDate(fechaDia.getDate() + i);
      const th = document.createElement('th');
      th.textContent = fechaDia.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit'
      });
      tr.appendChild(th);
    }

    thead.appendChild(tr);
    return thead;
  }

  crearCuerpo() {
    const tbody = document.createElement('tbody');

    // --- Determinamos rango horario AM/PM ---
    let horaInicio = this.agenda.horaInicio;
    let horaFin = this.agenda.horaFin;

    if (this.agenda.rangoSeleccionado === "AM") {
      horaInicio = 9;
      horaFin = 13;
    } else if (this.agenda.rangoSeleccionado === "PM") {
      horaInicio = 14;
      horaFin = 18;
    }

    for (let h = horaInicio; h < horaFin; h++) {
      for (let m = 0; m < 60; m += this.agenda.minutosBloque) {
        const tr = document.createElement('tr');
        const tdHora = document.createElement('td');
        tdHora.classList.add('hora');

        const hFin = h + Math.floor((m + this.agenda.minutosBloque) / 60);
        const mFin = (m + this.agenda.minutosBloque) % 60;
        tdHora.textContent = `${this.agenda.formatHora(h, m)} - ${this.agenda.formatHora(hFin, mFin)}`;
        tr.appendChild(tdHora);

        for (let d = 0; d < this.agenda.numDias; d++) {
          const td = document.createElement('td');
          const fechaDia = new Date(this.agenda.fechaInicioSemana);
          fechaDia.setDate(fechaDia.getDate() + d);

          const fStr = fechaDia.toISOString().split('T')[0];
          const hStr = this.agenda.pad(h) + ':' + this.agenda.pad(m);

          const filtroTec = this.agenda.tecnicoFiltro || '';

          // --- Verificamos si este bloque está ocupado por algún turno considerando T ---
          let bloqueOcupado = false;
          let clienteAsignado = '';
          let tecnicoAsignado = '';

          this.agenda.turnos.forEach(turno => {
            if ((!filtroTec || turno.tecnico === filtroTec) && turno.fecha.replace(/\//g,'-') === fStr) {
              const bloquesTurno = parseInt(turno.t?.replace('T','')) || 1;
              const [horaTurno, minTurno] = turno.hora.split(':').map(Number);
              for (let b = 0; b < bloquesTurno; b++) {
                const totalMin = horaTurno*60 + minTurno + b*15;
                const hh = Math.floor(totalMin/60);
                const mm = totalMin%60;
                const bloqueHora = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
                if (bloqueHora === hStr) {
                  bloqueOcupado = true;
                  clienteAsignado = turno.cliente;
                  tecnicoAsignado = turno.tecnico;
                }
              }
            }
          });

          const btn = document.createElement('button');
          btn.dataset.hora = hStr;
          btn.dataset.fecha = fStr;
          btn.dataset.tecnico = filtroTec || 'Todos';

          if (bloqueOcupado) {
            btn.textContent = clienteAsignado;
            btn.disabled = true;
            btn.classList.add('btn-ocupado');
            btn.dataset.tooltip = `Cliente: ${clienteAsignado} || Técnico: ${tecnicoAsignado}`;
          } else {
            btn.textContent = '+';
            btn.dataset.tooltip = 'Bloque libre';
            btn.disabled = false;
            btn.classList.add('btn-libre');
            btn.onclick = () => this.agenda.asignarTurno(fStr, hStr);
          }

          td.appendChild(btn);
          tr.appendChild(td);
        }

        tbody.appendChild(tr);
      }
    }

    return tbody;
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const table = document.createElement('table');
    table.appendChild(this.crearEncabezado());
    table.appendChild(this.crearCuerpo());

    container.appendChild(table);
  }
}
