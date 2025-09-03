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

    let horaInicio = this.agenda.horaInicio;
    let horaFin = this.agenda.horaFin;

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

          const divBloques = document.createElement('div');
          divBloques.classList.add('bloques-container');
          td.appendChild(divBloques);

          this.agenda.turnos.forEach(turno => {
            if (turno.fecha.replace(/\//g, '-') === fStr) {
              if (!filtroTec || (Array.isArray(turno.tecnicos) && turno.tecnicos.includes(filtroTec))) {
                const bloquesTurno = Number(turno.t?.toString().replace('T','')) || 1;
                const [horaTurno, minTurno] = turno.hora.split(':').map(Number);

                for (let b = 0; b < bloquesTurno; b++) {
                  const totalMin = horaTurno * 60 + minTurno + b * 15;
                  const hh = Math.floor(totalMin / 60);
                  const mm = totalMin % 60;
                  const bloqueHora = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

                  if (bloqueHora === hStr) {
                    const wrapper = document.createElement('div');
                    wrapper.classList.add('bloque-turno');

                    const btn = document.createElement('button');
                    btn.textContent = turno.cliente;
                    btn.disabled = true;
                    btn.classList.add('btn-ocupado');
                    btn.style.backgroundColor = turno.color || '#1E90FF';

                    const sub = document.createElement("div");
                    sub.classList.add("sub-etiqueta");
                    if (turno.estado === "Confirmado") {
                      sub.textContent = "OK";
                      sub.classList.add("ok");
                    } else if (turno.estado === "Rechazado") {
                      sub.textContent = "NOK";
                      sub.classList.add("nok");
                    } else if (turno.estado === "Reprogramado") {
                      sub.textContent = "REPRO";
                      sub.classList.add("repro");
                    }

                    // Tooltip dinámico
                    btn.addEventListener("mouseenter", () => {
                      let tooltip = document.createElement("div");
                      tooltip.classList.add("tooltip");
                      const tecnicoStr = Array.isArray(turno.tecnicos) ? turno.tecnicos.join(", ") : "";
                      tooltip.innerHTML = `
                        <strong>Cliente:</strong> ${turno.cliente}<br>
                        <strong>Técnico:</strong> ${tecnicoStr}<br>
                        <strong>T:</strong> ${turno.t}<br>
                        <strong>Rango:</strong> ${turno.rango}<br>
                        <strong>Estado:</strong> ${turno.estado}
                      `;
                      document.body.appendChild(tooltip);

                      const moveHandler = (e) => {
                        tooltip.style.top = e.pageY + 15 + "px";
                        tooltip.style.left = e.pageX + 15 + "px";
                      };

                      btn.addEventListener("mousemove", moveHandler);

                      btn.addEventListener("mouseleave", () => {
                        tooltip.remove();
                        btn.removeEventListener("mousemove", moveHandler);
                      });
                    });

                    wrapper.appendChild(btn);
                    if (turno.estado) wrapper.appendChild(sub);
                    divBloques.appendChild(wrapper);
                  }
                }
              }
            }
          });

          if (divBloques.childElementCount === 0) {
            const btnLibre = document.createElement('button');
            btnLibre.textContent = '+';
            btnLibre.classList.add('btn-libre');
            btnLibre.onclick = () => this.agenda.asignarTurno(fStr, hStr);
            divBloques.appendChild(btnLibre);
          }

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
