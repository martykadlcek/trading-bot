# CMAKE generated file: DO NOT EDIT!
# Generated by "Unix Makefiles" Generator, CMake Version 3.10

# Delete rule output on recipe failure.
.DELETE_ON_ERROR:


#=============================================================================
# Special targets provided by cmake.

# Disable implicit rules so canonical targets will work.
.SUFFIXES:


# Remove some rules from gmake that .SUFFIXES does not remove.
SUFFIXES =

.SUFFIXES: .hpux_make_needs_suffix_list


# Suppress display of executed commands.
$(VERBOSE).SILENT:


# A target that is always out of date.
cmake_force:

.PHONY : cmake_force

#=============================================================================
# Set environment variables for the build.

# The shell in which to execute make rules.
SHELL = /bin/sh

# The CMake executable.
CMAKE_COMMAND = /usr/bin/cmake

# The command to remove a file.
RM = /usr/bin/cmake -E remove -f

# Escaping for special characters.
EQUALS = =

# The top-level source directory on which CMake was run.
CMAKE_SOURCE_DIR = /home/martin/devbot/mmbot

# The top-level build directory on which CMake was run.
CMAKE_BINARY_DIR = /home/martin/devbot/mmbot

# Include any dependencies generated for this target.
include src/storage_broker/CMakeFiles/storage_broker.dir/depend.make

# Include the progress variables for this target.
include src/storage_broker/CMakeFiles/storage_broker.dir/progress.make

# Include the compile flags for this target's objects.
include src/storage_broker/CMakeFiles/storage_broker.dir/flags.make

src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.o: src/storage_broker/CMakeFiles/storage_broker.dir/flags.make
src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.o: src/storage_broker/main.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/martin/devbot/mmbot/CMakeFiles --progress-num=$(CMAKE_PROGRESS_1) "Building CXX object src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.o"
	cd /home/martin/devbot/mmbot/src/storage_broker && /usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/storage_broker.dir/main.cpp.o -c /home/martin/devbot/mmbot/src/storage_broker/main.cpp

src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/storage_broker.dir/main.cpp.i"
	cd /home/martin/devbot/mmbot/src/storage_broker && /usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/martin/devbot/mmbot/src/storage_broker/main.cpp > CMakeFiles/storage_broker.dir/main.cpp.i

src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/storage_broker.dir/main.cpp.s"
	cd /home/martin/devbot/mmbot/src/storage_broker && /usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/martin/devbot/mmbot/src/storage_broker/main.cpp -o CMakeFiles/storage_broker.dir/main.cpp.s

src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.o.requires:

.PHONY : src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.o.requires

src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.o.provides: src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.o.requires
	$(MAKE) -f src/storage_broker/CMakeFiles/storage_broker.dir/build.make src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.o.provides.build
.PHONY : src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.o.provides

src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.o.provides.build: src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.o


# Object files for target storage_broker
storage_broker_OBJECTS = \
"CMakeFiles/storage_broker.dir/main.cpp.o"

# External object files for target storage_broker
storage_broker_EXTERNAL_OBJECTS =

bin/brokers/storage_broker: src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.o
bin/brokers/storage_broker: src/storage_broker/CMakeFiles/storage_broker.dir/build.make
bin/brokers/storage_broker: src/brokers/libbrokers_common.a
bin/brokers/storage_broker: src/imtjson/src/imtjson/libimtjson.a
bin/brokers/storage_broker: src/server/src/simpleServer/libsimpleServer.a
bin/brokers/storage_broker: src/storage_broker/CMakeFiles/storage_broker.dir/link.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --bold --progress-dir=/home/martin/devbot/mmbot/CMakeFiles --progress-num=$(CMAKE_PROGRESS_2) "Linking CXX executable ../../bin/brokers/storage_broker"
	cd /home/martin/devbot/mmbot/src/storage_broker && $(CMAKE_COMMAND) -E cmake_link_script CMakeFiles/storage_broker.dir/link.txt --verbose=$(VERBOSE)

# Rule to build all files generated by this target.
src/storage_broker/CMakeFiles/storage_broker.dir/build: bin/brokers/storage_broker

.PHONY : src/storage_broker/CMakeFiles/storage_broker.dir/build

src/storage_broker/CMakeFiles/storage_broker.dir/requires: src/storage_broker/CMakeFiles/storage_broker.dir/main.cpp.o.requires

.PHONY : src/storage_broker/CMakeFiles/storage_broker.dir/requires

src/storage_broker/CMakeFiles/storage_broker.dir/clean:
	cd /home/martin/devbot/mmbot/src/storage_broker && $(CMAKE_COMMAND) -P CMakeFiles/storage_broker.dir/cmake_clean.cmake
.PHONY : src/storage_broker/CMakeFiles/storage_broker.dir/clean

src/storage_broker/CMakeFiles/storage_broker.dir/depend:
	cd /home/martin/devbot/mmbot && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /home/martin/devbot/mmbot /home/martin/devbot/mmbot/src/storage_broker /home/martin/devbot/mmbot /home/martin/devbot/mmbot/src/storage_broker /home/martin/devbot/mmbot/src/storage_broker/CMakeFiles/storage_broker.dir/DependInfo.cmake --color=$(COLOR)
.PHONY : src/storage_broker/CMakeFiles/storage_broker.dir/depend

