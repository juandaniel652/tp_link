// turnos.state.js

export class TurnosState {
  constructor() {
    this.state = {
      fechaSeleccionada: null,
      turnos: [],
      loading: false,
      error: null
    };

    this.listeners = [];
  }

  // --------------------
  // Subscriptions
  // --------------------

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    const snapshot = this.getState();
    this.listeners.forEach(listener => listener(snapshot));
  }

  getState() {
    return structuredClone(this.state);
  }

  // --------------------
  // Mutations
  // --------------------

  setLoading(value) {
    this.state.loading = value;
    this.notify();
  }

  setError(error) {
    this.state.error = error;
    this.notify();
  }

  clearError() {
    this.state.error = null;
    this.notify();
  }

  setFecha(fecha) {
    this.state.fechaSeleccionada = fecha;
    this.notify();
  }

  setTurnos(turnos) {
    this.state.turnos = [...turnos];
    this.notify();
  }

  addTurno(turno) {
    this.state.turnos = [...this.state.turnos, turno];
    this.notify();
  }

  reset() {
    this.state = {
      fechaSeleccionada: null,
      turnos: [],
      loading: false,
      error: null
    };
    this.notify();
  }
}