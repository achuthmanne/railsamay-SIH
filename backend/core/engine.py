import json
import os
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def load_train_data(train_no: str):
    """Loads parsed JSON data for a specific train."""
    for f in os.listdir(DATA_DIR):
        if f.startswith(train_no) and f.endswith(".json"):
            with open(os.path.join(DATA_DIR, f), "r", encoding="utf-8") as file:
                return json.load(file)
    return None

def parse_time(time_str: str, base_year=2026):
    """Parses 'HH:MM | DD-MMM' into a datetime object."""
    if not time_str or time_str == "Source" or time_str == "Destination":
        return None
    try:
        # E.g., '18:15 | 11-Sep'
        return datetime.strptime(f"{time_str} {base_year}", "%H:%M | %d-%b %Y")
    except Exception as e:
        return None

def format_time(dt: datetime):
    """Formats datetime back to 'HH:MM | DD-MMM'."""
    if not dt:
        return ""
    return dt.strftime("%H:%M | %d-%b")

class RailwayEngine:
    def __init__(self):
        # Cache for loaded trains
        self.train_cache = {}

    def get_train(self, train_no):
        if train_no not in self.train_cache:
            data = load_train_data(train_no)
            if data:
                self.train_cache[train_no] = data
        return self.train_cache.get(train_no)

    def simulate_delay(self, train_no: str, station_code: str, delay_minutes: int):
        """
        Injects a delay at a specific station and recalculates downstream ETAs.
        Returns the updated route.
        """
        route = self.get_train(train_no)
        if not route:
            return {"error": "Train not found"}
            
        updated_route = []
        delay_applied = False
        
        for stop in route:
            new_stop = dict(stop)
            
            if stop.get("code") == station_code:
                delay_applied = True
                
            if delay_applied:
                # Recalculate arrival
                arr_dt = parse_time(stop.get("scheduled_arrival"))
                if arr_dt:
                    new_arr = arr_dt + timedelta(minutes=delay_minutes)
                    new_stop["expected_arrival"] = format_time(new_arr)
                    
                # Recalculate departure
                dep_dt = parse_time(stop.get("scheduled_departure"))
                if dep_dt:
                    new_dep = dep_dt + timedelta(minutes=delay_minutes)
                    new_stop["expected_departure"] = format_time(new_dep)
                    
                # Update status
                hours = delay_minutes // 60
                mins = delay_minutes % 60
                new_stop["status"] = f"Delay: {hours:02d}:{mins:02d}"
                
            updated_route.append(new_stop)
            
        return updated_route

    def scan_station_resources(self, station_code: str, train_no: str, new_arrival: str, new_departure: str, active_trains: list):
        """
        Scenario 5 Engine: Scans all platforms at a station for a given time window.
        Checks for overlap and clearance buffer across multiple trains.
        """
        # Parse the new required window for our delayed train
        req_arr = parse_time(new_arrival)
        req_dep = parse_time(new_departure)
        if not req_arr or not req_dep:
            return {"error": "Invalid time format"}
            
        # Add safety clearance buffer (e.g. 15 mins before and after)
        BUFFER_MINS = 15
        occupancy_start = req_arr - timedelta(minutes=BUFFER_MINS)
        occupancy_end = req_dep + timedelta(minutes=BUFFER_MINS)

        station_report = {
            "station": station_code,
            "train": train_no,
            "required_window": f"{format_time(req_arr)} to {format_time(req_dep)}",
            "platforms": {},
            "crew_status": "🟠 Readiness Check Required",
            "cleaning_status": "🟠 Reschedule Required",
            "conflicts": []
        }

        # Initialize mock platform states
        for pf in range(1, 11):
            station_report["platforms"][f"PF{pf}"] = {"status": "🟢 Feasible", "blocking_train": None}

        # Scan active trains in the network to see if they occupy BZA during our window
        for other_train in active_trains:
            if other_train == train_no:
                continue
                
            other_route = self.get_train(other_train)
            if not other_route:
                continue
                
            # Find when the other train is at the target station
            for stop in other_route:
                if stop.get("code") == station_code:
                    # Check overlap using expected/scheduled times
                    other_arr = parse_time(stop.get("expected_arrival") or stop.get("scheduled_arrival"))
                    other_dep = parse_time(stop.get("expected_departure") or stop.get("scheduled_departure"))
                    
                    if not other_arr or not other_dep:
                        continue
                        
                    # Math: Overlap exists if Max(Start1, Start2) < Min(End1, End2)
                    overlap_start = max(occupancy_start, other_arr)
                    overlap_end = min(occupancy_end, other_dep)
                    
                    if overlap_start < overlap_end:
                        # Conflict!
                        pf = stop.get("platform", "PF?")
                        station_report["conflicts"].append({
                            "train": other_train,
                            "platform": pf,
                            "conflict_window": f"{format_time(overlap_start)} to {format_time(overlap_end)}"
                        })
                        if pf in station_report["platforms"]:
                            station_report["platforms"][pf] = {
                                "status": "🔴 Conflict Risk",
                                "blocking_train": other_train
                            }
                        
        # Provide Smart Suggestion
        feasible_pfs = [pf for pf, data in station_report["platforms"].items() if data["status"] == "🟢 Feasible"]
        if feasible_pfs:
            station_report["ai_suggestion"] = f"Shift {train_no} to {feasible_pfs[0]}"
        else:
            station_report["ai_suggestion"] = f"No platforms available. Hold {train_no} outside station."
            
        return station_report

engine = RailwayEngine()
