class Store {
  constructor() {
    this.isSimulating = false;
    this.trains = [];
    this.listeners = [];
    this.timeoutIds = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l([...this.trains], this.isSimulating));
  }

  setInitial(trains) {
    if (!this.isSimulating) {
        this.trains = trains;
        this.notify();
    }
  }

  start(baseTrains) {
    if (this.isSimulating) return;
    this.isSimulating = true;

    let startTrains = this.trains.length > 0 ? this.trains : baseTrains;

    // Helper to clear existing
    this.stop();
    this.isSimulating = true;

    // T=0s
    this.trains = startTrains.map(t => {
      if (t.no === '12626') return { ...t, delayMinutes: 0, delayStr: 'On Time', status: 'On Time', currentLocation: 'Departed ET (Itarsi)', scenarioFlags: [] };
      if (t.no === '12621') return { ...t, delayMinutes: 0, delayStr: 'On Time', status: 'On Time', currentLocation: 'Departed BPQ (Balharshah)', scenarioFlags: [] };
      return t;
    });
    this.notify();

    this.timeoutIds.push(setTimeout(() => {
      this.trains = this.trains.map(t => {
        if (t.no === '12626') return { ...t, currentLocation: 'Passing TEO (Teegaon)' };
        if (t.no === '12621') return { ...t, delayMinutes: 10, delayStr: '+ 10m', status: 'Delayed', currentLocation: 'Passing MJRI (Majri)' };
        return t;
      });
      this.notify();
    }, 4000));

    this.timeoutIds.push(setTimeout(() => {
      this.trains = this.trains.map(t => {
        if (t.no === '12626') return { ...t, delayMinutes: 30, delayStr: '+ 30m', status: 'Delayed', currentLocation: 'Passing PAR (Pandhurna)' };
        if (t.no === '12621') return { ...t, delayMinutes: 0, delayStr: 'On Time', status: 'Delay Covered', currentLocation: 'Passing SEGM (Sevagram)' };
        return t;
      });
      this.notify();
    }, 8000));

    this.timeoutIds.push(setTimeout(() => {
      this.trains = this.trains.map(t => {
        if (t.no === '12626') return { ...t, delayMinutes: 60, delayStr: '+ 60m', status: 'Severely Delayed', currentLocation: 'Passing KATL (Katol)' };
        if (t.no === '12621') return { ...t, currentLocation: 'Passing SNI (Sindi)' };
        return t;
      });
      this.notify();
    }, 12000));

    this.timeoutIds.push(setTimeout(() => {
      this.trains = this.trains.map(t => {
        if (t.no === '12626') return { ...t, delayMinutes: 90, delayStr: '+ 90m', status: 'Severely Delayed', currentLocation: 'Passing KSWR (Kalmeshwar)' };
        if (t.no === '12621') return { ...t, currentLocation: 'Passing GMG (Gumgaon)' };
        return t;
      });
      this.notify();
    }, 16000));

    this.timeoutIds.push(setTimeout(() => {
      this.trains = this.trains.map(t => {
        if (t.no === '12626') return { ...t, delayMinutes: 120, delayStr: '+ 120m', status: 'Severely Delayed', currentLocation: 'Passing GNQ (Godhani)', scenarioFlags: ['CONFLICT_SOURCE'] };
        if (t.no === '12621') return { ...t, currentLocation: 'Passing AJNI (Ajni)', scenarioFlags: ['CONFLICT_TARGET'] };
        return t;
      });
      this.isSimulating = false;
      this.notify();
    }, 20000));
  }

  stop() {
    this.timeoutIds.forEach(clearTimeout);
    this.timeoutIds = [];
    this.isSimulating = false;
    this.notify();
  }
}

export const simStore = new Store();
