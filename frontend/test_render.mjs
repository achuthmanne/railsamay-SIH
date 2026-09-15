import React from 'react';
import { renderToString } from 'react-dom/server';
import PassengerTracking from './src/pages/PassengerTracking.jsx';

try {
    const html = renderToString(React.createElement(PassengerTracking));
    print("Render successful");
} catch (e) {
    console.error("Render failed:");
    console.error(e);
}
