import { getTrainsForContext } from './trainConfig';

export class SimulationEngine {
  constructor(division) {
    this.division = division;
    this.trains = getTrainsForContext(division);
    this.liveData = [];
  }

  async initialize() {
    this.liveData = [];
    
    for (let train of this.trains) {
      try {
        const response = await fetch(train.file);
        const routeData = await response.json();
        
        // Default Baseline States (Pre-Scenario Triggers)
        let currentLocation = routeData[Math.floor(routeData.length / 2)]?.name || 'In Transit';
        let delayStr = 'On Time';
        let delayMinutes = 0;
        let scheduleTime = '12:00';
        let status = 'On Time';

        // Custom Initializations based on Division & Trains
        if (train.no === '12621') { currentLocation = 'Balharshah (BPQ)'; scheduleTime = '13:45'; delayMinutes = 10; delayStr = '+ 10m'; status = 'Delayed'; }
        if (train.no === '12626') { currentLocation = 'Itarsi Jn (ET)'; scheduleTime = '11:45'; delayMinutes = 90; delayStr = '+ 90m'; status = 'Severely Delayed'; }
        if (train.no === '22439') { currentLocation = 'Jalandhar Cantt (JRC)'; scheduleTime = '11:15'; }
        if (train.no === '20833') { currentLocation = 'Khammam (KMT)'; scheduleTime = '10:00'; }
        if (train.no === '12615') { currentLocation = 'Tenali Jn (TEL)'; scheduleTime = '00:45'; }
        if (train.no === '20805') { currentLocation = 'Visakhapatnam (VSKP)'; scheduleTime = '--:--'; status = 'Not Started'; delayStr = '--'; }

        this.liveData.push({
          ...train,
          route: routeData,
          currentLocation,
          scheduleTime,
          delayMinutes,
          delayStr,
          status,
          scenarioFlags: [] // To hold AI annotations (e.g., 'Conflict Detected', 'Cascading Impact')
        });
      } catch (err) {
        console.error(`Failed to load data for train ${train.no}`, err);
      }
    }
    
    return [...this.liveData];
  }

  // CORE SCENARIO INJECTION LOGIC
  // This foundation allows the UI to trigger the 5 master scenarios flawlessly.
  
  injectScenario(scenarioId) {
    let updatedData = [...this.liveData];

    switch(scenarioId) {
      case 1:
        // Scenario 1: NGP Operational Conflict (12621 vs 12626)
        updatedData = updatedData.map(t => {
          if (t.no === '12626') {
            return { ...t, delayMinutes: 120, delayStr: '+ 02:00', status: 'Delayed', currentLocation: 'Approaching NGP', scenarioFlags: ['CONFLICT_SOURCE'] };
          }
          if (t.no === '12621') {
            return { ...t, currentLocation: 'Approaching NGP', scenarioFlags: ['CONFLICT_TARGET'] };
          }
          return t;
        });
        break;

      case 2:
        // Scenario 2: PTKC Smart Platform Assignment
        updatedData = updatedData.map(t => {
          if (t.no === '22439') {
            return { ...t, delayMinutes: 75, delayStr: '+ 01:15', status: 'Delayed', currentLocation: 'Approaching PTKC', scenarioFlags: ['PF_CONFLICT_SOURCE'] };
          }
          if (t.no === '12919') {
            return { ...t, currentLocation: 'At PTKC (PF2)', scenarioFlags: ['PF_OCCUPIED'] };
          }
          return t;
        });
        break;

      case 3:
      case 4:
        // Scenario 4: Network-Aware Cascading Impact (Khammam-Warangal)
        updatedData = updatedData.map(t => {
          if (t.no === '20833') {
            return { ...t, delayMinutes: 45, delayStr: '+ 00:45', status: 'Stopped', currentLocation: 'KM-112 (Khammam Out)', scenarioFlags: ['INCIDENT_SOURCE'] };
          }
          if (t.no === '18045') {
            return { ...t, delayMinutes: 30, delayStr: '+ 00:30', status: 'Regulated', currentLocation: 'Khammam (KMT)', scenarioFlags: ['CASCADING_IMPACT'] };
          }
          if (['17205', '17207', '12511'].includes(t.no)) {
            return { ...t, status: 'On Time', scenarioFlags: ['ROUTE_CLEAR'] };
          }
          return t;
        });
        break;

      case 5:
        // Scenario 5: BZA Station Resource Planning
        updatedData = updatedData.map(t => {
          if (t.no === '12615') {
            return { ...t, delayMinutes: 90, delayStr: '+ 01:30', status: 'Delayed', currentLocation: 'Approaching BZA', scenarioFlags: ['RESOURCE_SCAN_REQ'] };
          }
          return t;
        });
        break;
        
      default:
        break;
    }
    
    this.liveData = updatedData;
    return this.liveData;
  }
}
