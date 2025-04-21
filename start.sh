#!/bin/bash

# Set the display environment variable for headless Chromium (if needed)
export DISPLAY=:99

# Update package list and install Chromium and Chromedriver
apt-get update
apt-get install -y chromium chromium-driver

# Install Python dependencies
pip install -r requirements.txt

# Run the scraping scripts (assuming these scripts use headless Chromium)
python3 linkedin.py
python3 pluralsight.py
