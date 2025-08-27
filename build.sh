#!/bin/sh
cd ../

# output 폴더 생성
mkdir -p output

# 대괄호가 포함된 폴더를 문자열로 처리, *는 밖에서 확장
cp -R ./[MoodFlix-FrontEnd]/* ./output/
cp -R ./output/* ./[MoodFlix-FrontEnd]/
