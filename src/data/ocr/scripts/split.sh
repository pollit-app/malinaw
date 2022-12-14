#!/bin/bash

PREFIX="./src/data/ocr/tmp"
convert -density 300 -trim "$PREFIX/bill.pdf" -colorspace Gray -quality 100 -sharpen -x1.0 "$PREFIX/bill-%04d.png"