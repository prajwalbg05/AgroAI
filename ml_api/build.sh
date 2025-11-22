#!/bin/bash
# Force Python 3.11 and use only binary wheels
pip install --only-binary :all: -r requirements.txt || pip install -r requirements.txt

