# Rail Samay 🚆
**The Accurate Time of Indian Railways**

A Dynamic ETA Forecasting System built for the Smart India Hackathon (SIH). 

## 📂 Project Architecture
This repository contains the complete Proof of Concept (PoC) divided into three micro-services:

1. **/backend**
   - **Tech:** Python, FastAPI, WebSockets
   - **Role:** The core ETA engine. Receives telemetry data, calculates dynamic ETA based on speed/distance/congestion, and broadcasts updates via WebSockets.

2. **/simulator**
   - **Tech:** Python
   - **Role:** Since live railway RTIS data is restricted, this simulator acts as a mock telemetry generator. It runs a loop to simulate trains moving on a track, sending live GPS and Speed data to the backend. It also features an "Event Injector" to simulate delays/congestion.

3. **/frontend** (To be initialized)
   - **Tech:** React.js, Tailwind CSS
   - **Role:** Contains two main portals:
     - `Passenger App`: Clean, simple UI for tracking your train's dynamic ETA.
     - `Control Room Dashboard`: Advanced dashboard for railway staff to monitor multiple trains, track delay propagation, and manage incidents.

## 🚀 Getting Started
*(Setup instructions will be added here as we build the components)*
