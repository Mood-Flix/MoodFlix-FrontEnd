#!/bin/sh
cd ../

# output 폴더 생성
mkdir -p output

# 대괄호를 문자열로 처리
cp -R './[MoodFlix-FrontEnd]/*' ./output
cp -R ./output './[MoodFlix-FrontEnd]/'
