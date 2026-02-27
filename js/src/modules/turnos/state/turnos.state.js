// turnos.state.js

export class TurnosState {
  constructor() {
    this.initialState = {
      fechaSeleccionada: null,
      turnos: [],
      loading: false,
      error: null // string simple, no objeto Error
    };

    this.state = structuredClone(this.initialState);
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

  update(patch) {
    this.state = {
      ...this.state,
      ...patch
    };
    this.notify();
  }

  setLoading(value) {
    this.update({ loading: value });
  }

  setError(error) {
    const message = error?.message ?? String(error);
    this.update({ error: message });
  }

  clearError() {
    this.update({ error: null });
  }

  setFecha(fecha) {
    this.update({ fechaSeleccionada: fecha });
  }

  setTurnos(turnos) {
    this.update({ turnos: [...turnos] });
  }

  addTurno(turno) {
    this.update({ turnos: [...this.state.turnos, turno] });
  }

  cancelTurno(id) {
      this.update({
        turnos: this.state.turnos.map(t =>
          t.id === id
            ? { ...t, estado: "cancelado" }
            : t
        )
      });
    }

  reset() {
    this.state = structuredClone(this.initialState);
    this.notify();
  }

  // --------------------
  // Derived State
  // --------------------

  hasTurnos() {
    return this.state.turnos.length > 0;
  }

  isEmpty() {
    return !this.state.loading && this.state.turnos.length === 0;
  }
}