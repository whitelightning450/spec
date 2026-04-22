import smbus
import numpy as np
from imusensor.MPU9250 import MPU9250
import os
"""
Script Description:
This Python script demonstrates the calibration process for an MPU9250 sensor (IMU: Inertial Measurement Unit) using the imusensor library. It calibrates the accelerometer and magnetometer (compass) and saves the calibration data to a file. Additionally, it loads the calibration data from the file and verifies its correctness.

Components:
1. MPU9250 Initialization and Calibration:
   - The script initializes the MPU9250 sensor object with the provided address using the smbus library.
   - It performs accelerometer calibration using the calibrateAccelerometer() method and prints a success message.
   - Magnetometer calibration is performed using the calibrateMagApprox() method, followed by printing a calibration success message.
   - The script retrieves calibration parameters such as accelerometer scale, accelerometer bias, gyro bias, magnetometer readings, and magnetometer bias.
   - Calibration data is saved to a JSON file using the saveCalibDataToFile() method, and a success message is printed.
   - NOTE: magnetometer calibration is only needed for the yaw angle and is not performed for SPEC

2. Calibration Data Verification:
   - The script loads the calibration data from the saved JSON file using the loadCalibDataFromFile() method.
   - It compares the loaded calibration data with the original calibration parameters to ensure correctness.
   - If all calibration parameters match, a message confirming proper calibration loading is printed.

Purpose:
This script serves as a demonstration of calibration procedures for an MPU9250 sensor. Calibration is crucial for accurate sensor readings, especially in applications such as orientation estimation, motion tracking, and navigation.
"""
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# Set BASE_DIR to the main_repo directory
BASE_DIR = os.path.dirname(CURRENT_DIR)
print ("base_dir = ", BASE_DIR)

address = 0x68
bus = smbus.SMBus(1)
imu = MPU9250.MPU9250(bus, address)

# Calibration of Accelerometer
imu.begin()
imu.caliberateAccelerometer()
print('Accelerate calib success')

# Magnetometer calibration is not necessary unless using the yaw angle.
# # Calibration of Magnetometer
# print ("Calibration of magnetometer starting in 10 seconds. Move the SPEC unit in a figure 8, making sure to rotate through all the roll and pitch angles. \n"
#       "The magnetometer data is only used for the yaw angle, which SPEC does not currently use. This calibration is here for completeness.")
# time.sleep(10)

# imu.caliberateMagApprox()
# print('mag calibrated')

# Retrieve Calibration Parameters
accelscale = imu.Accels
accelBias = imu.AccelBias
gyroBias = imu.GyroBias
# mags = imu.Mags
# magBias = imu.MagBias

print ("imu.Accels, imu.AccelBias = ", accelscale, accelBias)
# Save Calibration Data to File
imu.saveCalibDataToFile(os.path.join(BASE_DIR, "calib.json"))
print ("path sent in to save function = ",os.path.join(BASE_DIR, "calib.json"))
print('calib data saved')

# Load Calibration Data from File
imu.loadCalibDataFromFile(os.path.join(BASE_DIR, "calib.json"))

# Verify Loaded Calibration Data
if np.array_equal(accelscale, imu.Accels) & np.array_equal(accelBias, imu.AccelBias): #& \
# np.array_equal(mags, imu.Mags) & np.array_equal(magBias, imu.MagBias) & \
# np.array_equal(gyroBias, imu.GyroBias):
    print("calib loaded properly")
