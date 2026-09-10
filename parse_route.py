import json
import sys
from datetime import datetime

def parse_data(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        raw_lines = [l.strip() for l in f.readlines() if l.strip()]
    
    # Filter out noise lines that can appear randomly
    lines = [l for l in raw_lines if l not in ["Train current position", "Coach Position", "Upcoming Station"]]

    stations = []
    last_stopping_idx = -1
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Detect Source Station dynamically using SRC
        if line == "SRC":
            code = lines[i+1]
            name = lines[i+2]
            pf_str = lines[i+3].replace("*", "").strip()
            
            # Find the departure time for the source
            k = i + 4
            sched_dep = ""
            exp_dep = ""
            while k < len(lines) and lines[k] != "Scheduled":
                k += 1
            if k < len(lines):
                sched_dep = lines[k+1]
                if k + 2 < len(lines) and (lines[k+2] == "Expected *" or lines[k+2] == "Actual"):
                    exp_dep = lines[k+3]
                else:
                    exp_dep = sched_dep
            else:
                sched_dep = "Source"
                exp_dep = "Source"
                
            stations.append({
                "type": "stopping",
                "code": code,
                "name": name.title(),
                "platform": pf_str if "PF" in pf_str else "-",
                "distance": 0.0,
                "scheduled_arrival": "Source",
                "scheduled_departure": sched_dep, 
                "expected_arrival": "Source",
                "expected_departure": exp_dep,
                "status": "On Time"
            })
            last_stopping_idx = len(stations) - 1
            i += 4
            continue

        # Detect Scheduled Block (Can be Arrival for next stop OR Departure for previous stop)
        if line == "Scheduled":
            sched_time = lines[i+1]
            
            expected_time = sched_time
            status = "On Time"
            
            offset = 2
            if i + offset < len(lines) and (lines[i+offset] == "Expected *" or lines[i+offset] == "Actual"):
                expected_time = lines[i+offset+1]
                offset += 2
                
            status = lines[i+offset]
            
            # If the status is 'Delay: ...', keep it, else if it's 'On Time' keep it
            # Sometime 'Train current position' gets in the way later, but 'status' should be grabbed here

            
            # Look ahead to determine if it's an Arrival or Departure block
            j = i + offset + 1
            is_departure_block = True
            
            while j < len(lines):
                # If we see Kms (of a stopping station) before another Scheduled/Non-Stopping, it's an Arrival block
                if "Kms" in lines[j] and "Arrival Time" not in lines[j]:
                    is_departure_block = False
                    break
                # If we hit the next block marker, it must be a departure block
                if lines[j] == "Scheduled" or lines[j] == "Non-Stopping" or "Arrival Time" in lines[j] or lines[j] == "DSTN" or lines[j] == "Upcoming Station":
                    is_departure_block = True
                    break
                j += 1
            
            if is_departure_block:
                # This scheduled block gives the departure time of the LAST stopping station
                if last_stopping_idx != -1:
                    stations[last_stopping_idx]["scheduled_departure"] = sched_time
                    stations[last_stopping_idx]["expected_departure"] = expected_time
                    # Calculate true halt duration
                    arr_str = stations[last_stopping_idx]["scheduled_arrival"]
                    if arr_str != "Source":
                        try:
                            # Use a fixed year (e.g. 2026) to avoid DeprecationWarning and handle leap years
                            arr_dt = datetime.strptime(arr_str + " 2026", "%H:%M | %d-%b %Y")
                            dep_dt = datetime.strptime(sched_time + " 2026", "%H:%M | %d-%b %Y")
                            stations[last_stopping_idx]["halt_duration_mins"] = int((dep_dt - arr_dt).total_seconds() / 60)
                        except Exception as e:
                            stations[last_stopping_idx]["halt_duration_mins"] = 0
            else:
                # This scheduled block gives the arrival time of a NEW stopping station
                k = i + offset + 1
                while k < len(lines) and "Kms" not in lines[k]:
                    k += 1
                if k < len(lines):
                    try:
                        dist = float(lines[k].replace("Kms", "").strip())
                        pf_str = lines[k-1].replace("*", "").strip()
                        # Some names might have 'Upcoming Station' or 'Coach Position' injected
                        name_idx = k - 2
                        if lines[name_idx] == "Upcoming Station" or lines[name_idx] == "Coach Position":
                            name_idx -= 1
                            pf_str = lines[k-2].replace("*", "").strip()
                        name = lines[name_idx]
                        code = lines[name_idx - 1]
                        
                        # Sometimes PF is missing entirely, check if code makes sense
                        if not ("PF" in pf_str or pf_str.isdigit()):
                            # It means pf_str is actually the name, and name is the code
                            name = pf_str
                            code = lines[name_idx]
                            pf_str = "-"

                        stations.append({
                            "type": "stopping",
                            "code": code,
                            "name": name.title(),
                            "platform": pf_str if "PF" in pf_str else "-",
                            "distance": dist,
                            "scheduled_arrival": sched_time,
                            "scheduled_departure": "", # Filled later
                            "expected_arrival": expected_time,
                            "expected_departure": "",
                            "status": status
                        })
                        last_stopping_idx = len(stations) - 1
                    except Exception as e:
                        pass
            
            i += offset + 1
            continue

        # Parse Non-Stopping Individual Station
        if line == "Non-Stopping" and i + 3 < len(lines) and "Kms" in lines[i+3]:
            code = lines[i+1]
            name = lines[i+2]
            dist_str = lines[i+3]
            arr_str = lines[i+4] if i+4 < len(lines) else ""
            dep_str = lines[i+5] if i+5 < len(lines) else ""
            
            if "Arrival Time:" in arr_str:
                try:
                    dist = float(dist_str.replace("Kms", "").strip())
                    departure = dep_str.split("Departure Time:")[1].strip() if "Departure Time:" in dep_str else ""
                    if code != "Non-Stopping":
                        stations.append({
                            "type": "non-stopping",
                            "code": code,
                            "name": name.title(),
                            "distance": dist,
                            "arrival_time": arr_str.split("Arrival Time:")[1].strip(),
                            "departure_time": departure
                        })
                except:
                    pass
                i += 5
                continue
        
        i += 1
        
    # Clean up Destination station
    if stations and stations[-1]["code"] == "NDLS":
        stations[-1]["scheduled_departure"] = "Destination"
        stations[-1]["expected_departure"] = "Destination"
        stations[-1]["halt_duration_mins"] = 0

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(stations, f, indent=4)
        
    print(f"Successfully parsed {len(stations)} stations from {input_file} -> {output_file}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python parse_route.py <input.txt> <output.json>")
    else:
        parse_data(sys.argv[1], sys.argv[2])
