import { simStore } from './frontend/src/store/SimulationStore.js';

let count = 0;
simStore.subscribe((trains, isSim) => {
    console.log(`Update ${count++}: isSim=${isSim}, trains=${trains.length}`);
    if (trains.length > 0) {
        console.log("Train 1 loc:", trains[0].currentLocation);
    }
});

simStore.setInitial([
    { no: '12626', currentLocation: 'A' },
    { no: '12621', currentLocation: 'B' }
]);

console.log("Starting...");
simStore.start([
    { no: '12626', currentLocation: 'A' },
    { no: '12621', currentLocation: 'B' }
]);
