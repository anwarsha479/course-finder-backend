#!/bin/bash

# Set the display environment variable for headless Chromium (if needed)
export DISPLAY=:99

# Install Python dependencies from requirements.txt
pip install -r requirements.txt

# Run the scraping scripts (assuming these scripts use headless Chromium)
python3 linkedin.py
python3 pluralsight.py
