#!/bin/bash

filename=$1

# Assume single block of text
tesseract "$filename" stdout -l eng+fil --dpi 150 --psm 4