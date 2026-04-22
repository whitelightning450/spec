import smbus
import numpy as np
from imusensor.MPU9250 import MPU9250
import os
import time
import json
import traceback
from datetime import datetime, timedelta
import pandas as pd

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)
BASE_DIR_1UP = os.path.abspath(os.path.join(BASE_DIR, os.pardir))
print (BASE_DIR_1UP)
MAIN_CONFIG = os.path.join(BASE_DIR_1UP, 'config.json')

address = 0x68
bus = smbus.SMBus(1)
imu = MPU9250.MPU9250(bus, address)
imu.begin()
imu.loadCalibDataFromFile(os.path.join(BASE_DIR, "calib.json"))

def read_imu(imu):
    """
    Read the IMU sensor and compute the orientation.
    
    Args:
    imu (IMU): The IMU sensor object.
    
    Returns:
    float: The pitch angle in degrees. 
    float: The roll angle in degrees.
    """
    imu.readSensor()
    imu.computeOrientation()
    ipitch, iroll, iyaw = imu.pitch, imu.roll, imu.yaw
    # Add 90 degrees to pitch as we define nadir = 0
    return ((ipitch + 90), (iroll), (iyaw + 90))

def update_save_json(tare):
    """Update config.json with tare vals while keeping existing data."""
    if os.path.exists(MAIN_CONFIG):
        with open(MAIN_CONFIG, "r") as f:
            data = json.load(f)
    else:
        data = {}  # If the file does not exist, start with an empty dictionary

    # Update or add the tare field
    data["tare"] = tare

    # Write the updated data back to save.json
    with open(MAIN_CONFIG, "w") as f:
        json.dump(data, f, indent=4)


pitch_list = []
roll_list = []

for i in range(100):
    pitch, roll, _ = read_imu(imu)
    print (pitch, roll)
    pitch_list.append(pitch)
    roll_list.append(roll)
    time.sleep(0.3)

pitch_avg = np.average(pitch_list)
roll_avg = np.average(roll_list)
pitch_std = np.std(pitch_list)
roll_std = np.std(roll_list)
print ("pitch_avg = ", pitch_avg)
print ("roll_avg = ", roll_avg)

print ("pitch_std = ", pitch_std)
print ("roll_std = ", roll_std)

pitch_tare = pitch_avg - 90
roll_tare = roll_avg 

print ("Pitch tare = ",pitch_tare," Roll tare = ",roll_tare)

tare = {"pitch_tare": pitch_tare, "roll_tare": roll_tare}

# write to config.json for use in app.py/read_imu
try:
    update_save_json(tare)
    print ("Tare values saved successfully to config.json")
except Exception:
    traceback.print_exc()


