cmake_minimum_required(VERSION 3.10)

project(Tests)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

set(CMAKE_SKIP_INSTALL_ALL_DEPENDENCY true)

add_executable(Tests main.cpp)

