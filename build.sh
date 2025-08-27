#!/bin/sh
cd ../

# output 폴더 생성
mkdir -p output

# 대괄호를 이스케이프 처리해서 정확히 인식
cp -R ./\[MoodFlix-FrontEnd\]/* ./output/

# output 내용을 다시 원래 폴더로 복사
cp -R ./output/* ./\[MoodFlix-FrontEnd\]/
