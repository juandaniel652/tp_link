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

    for (let h = this.agenda.horaInicio; h < this.agenda.horaFin; h++) {
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

          // --- filtrado de turnos según técnico seleccionado ---
          const filtroTec = this.agenda.tecnicoFiltro || ''; // '' significa todos
          const turnoExistente = this.agenda.turnos.find(t =>
            t.fecha.replace(/\//g, '-') === fStr &&
            t.hora.padStart(5, '0') === hStr &&
            (!filtroTec || t.tecnico === filtroTec)
          );

          const btn = document.createElement('button');
          btn.dataset.hora = hStr;
          btn.dataset.fecha = fStr;
          btn.dataset.tecnico = filtroTec || 'Todos';

          if (turnoExistente) {
            btn.textContent = turnoExistente.cliente;
            btn.disabled = true;
            btn.classList.add('btn-ocupado');
            btn.dataset.tooltip = `Cliente: ${turnoExistente.cliente}`;
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
