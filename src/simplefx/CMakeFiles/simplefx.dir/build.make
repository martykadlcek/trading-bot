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
include src/simplefx/CMakeFiles/simplefx.dir/depend.make

# Include the progress variables for this target.
include src/simplefx/CMakeFiles/simplefx.dir/progress.make

# Include the compile flags for this target's objects.
include src/simplefx/CMakeFiles/simplefx.dir/flags.make

src/simplefx/CMakeFiles/simplefx.dir/main.cpp.o: src/simplefx/CMakeFiles/simplefx.dir/flags.make
src/simplefx/CMakeFiles/simplefx.dir/main.cpp.o: src/simplefx/main.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/martin/devbot/mmbot/CMakeFiles --progress-num=$(CMAKE_PROGRESS_1) "Building CXX object src/simplefx/CMakeFiles/simplefx.dir/main.cpp.o"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/simplefx.dir/main.cpp.o -c /home/martin/devbot/mmbot/src/simplefx/main.cpp

src/simplefx/CMakeFiles/simplefx.dir/main.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/simplefx.dir/main.cpp.i"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/martin/devbot/mmbot/src/simplefx/main.cpp > CMakeFiles/simplefx.dir/main.cpp.i

src/simplefx/CMakeFiles/simplefx.dir/main.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/simplefx.dir/main.cpp.s"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/martin/devbot/mmbot/src/simplefx/main.cpp -o CMakeFiles/simplefx.dir/main.cpp.s

src/simplefx/CMakeFiles/simplefx.dir/main.cpp.o.requires:

.PHONY : src/simplefx/CMakeFiles/simplefx.dir/main.cpp.o.requires

src/simplefx/CMakeFiles/simplefx.dir/main.cpp.o.provides: src/simplefx/CMakeFiles/simplefx.dir/main.cpp.o.requires
	$(MAKE) -f src/simplefx/CMakeFiles/simplefx.dir/build.make src/simplefx/CMakeFiles/simplefx.dir/main.cpp.o.provides.build
.PHONY : src/simplefx/CMakeFiles/simplefx.dir/main.cpp.o.provides

src/simplefx/CMakeFiles/simplefx.dir/main.cpp.o.provides.build: src/simplefx/CMakeFiles/simplefx.dir/main.cpp.o


src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.o: src/simplefx/CMakeFiles/simplefx.dir/flags.make
src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.o: src/simplefx/tradingengine.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/martin/devbot/mmbot/CMakeFiles --progress-num=$(CMAKE_PROGRESS_2) "Building CXX object src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.o"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/simplefx.dir/tradingengine.cpp.o -c /home/martin/devbot/mmbot/src/simplefx/tradingengine.cpp

src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/simplefx.dir/tradingengine.cpp.i"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/martin/devbot/mmbot/src/simplefx/tradingengine.cpp > CMakeFiles/simplefx.dir/tradingengine.cpp.i

src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/simplefx.dir/tradingengine.cpp.s"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/martin/devbot/mmbot/src/simplefx/tradingengine.cpp -o CMakeFiles/simplefx.dir/tradingengine.cpp.s

src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.o.requires:

.PHONY : src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.o.requires

src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.o.provides: src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.o.requires
	$(MAKE) -f src/simplefx/CMakeFiles/simplefx.dir/build.make src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.o.provides.build
.PHONY : src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.o.provides

src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.o.provides.build: src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.o


src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.o: src/simplefx/CMakeFiles/simplefx.dir/flags.make
src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.o: src/simplefx/quotedist.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/martin/devbot/mmbot/CMakeFiles --progress-num=$(CMAKE_PROGRESS_3) "Building CXX object src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.o"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/simplefx.dir/quotedist.cpp.o -c /home/martin/devbot/mmbot/src/simplefx/quotedist.cpp

src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/simplefx.dir/quotedist.cpp.i"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/martin/devbot/mmbot/src/simplefx/quotedist.cpp > CMakeFiles/simplefx.dir/quotedist.cpp.i

src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/simplefx.dir/quotedist.cpp.s"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/martin/devbot/mmbot/src/simplefx/quotedist.cpp -o CMakeFiles/simplefx.dir/quotedist.cpp.s

src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.o.requires:

.PHONY : src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.o.requires

src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.o.provides: src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.o.requires
	$(MAKE) -f src/simplefx/CMakeFiles/simplefx.dir/build.make src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.o.provides.build
.PHONY : src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.o.provides

src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.o.provides.build: src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.o


src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.o: src/simplefx/CMakeFiles/simplefx.dir/flags.make
src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.o: src/simplefx/quotestream.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/martin/devbot/mmbot/CMakeFiles --progress-num=$(CMAKE_PROGRESS_4) "Building CXX object src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.o"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/simplefx.dir/quotestream.cpp.o -c /home/martin/devbot/mmbot/src/simplefx/quotestream.cpp

src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/simplefx.dir/quotestream.cpp.i"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/martin/devbot/mmbot/src/simplefx/quotestream.cpp > CMakeFiles/simplefx.dir/quotestream.cpp.i

src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/simplefx.dir/quotestream.cpp.s"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/martin/devbot/mmbot/src/simplefx/quotestream.cpp -o CMakeFiles/simplefx.dir/quotestream.cpp.s

src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.o.requires:

.PHONY : src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.o.requires

src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.o.provides: src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.o.requires
	$(MAKE) -f src/simplefx/CMakeFiles/simplefx.dir/build.make src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.o.provides.build
.PHONY : src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.o.provides

src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.o.provides.build: src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.o


src/simplefx/CMakeFiles/simplefx.dir/market.cpp.o: src/simplefx/CMakeFiles/simplefx.dir/flags.make
src/simplefx/CMakeFiles/simplefx.dir/market.cpp.o: src/simplefx/market.cpp
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --progress-dir=/home/martin/devbot/mmbot/CMakeFiles --progress-num=$(CMAKE_PROGRESS_5) "Building CXX object src/simplefx/CMakeFiles/simplefx.dir/market.cpp.o"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++  $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -o CMakeFiles/simplefx.dir/market.cpp.o -c /home/martin/devbot/mmbot/src/simplefx/market.cpp

src/simplefx/CMakeFiles/simplefx.dir/market.cpp.i: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Preprocessing CXX source to CMakeFiles/simplefx.dir/market.cpp.i"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -E /home/martin/devbot/mmbot/src/simplefx/market.cpp > CMakeFiles/simplefx.dir/market.cpp.i

src/simplefx/CMakeFiles/simplefx.dir/market.cpp.s: cmake_force
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green "Compiling CXX source to assembly CMakeFiles/simplefx.dir/market.cpp.s"
	cd /home/martin/devbot/mmbot/src/simplefx && /usr/bin/c++ $(CXX_DEFINES) $(CXX_INCLUDES) $(CXX_FLAGS) -S /home/martin/devbot/mmbot/src/simplefx/market.cpp -o CMakeFiles/simplefx.dir/market.cpp.s

src/simplefx/CMakeFiles/simplefx.dir/market.cpp.o.requires:

.PHONY : src/simplefx/CMakeFiles/simplefx.dir/market.cpp.o.requires

src/simplefx/CMakeFiles/simplefx.dir/market.cpp.o.provides: src/simplefx/CMakeFiles/simplefx.dir/market.cpp.o.requires
	$(MAKE) -f src/simplefx/CMakeFiles/simplefx.dir/build.make src/simplefx/CMakeFiles/simplefx.dir/market.cpp.o.provides.build
.PHONY : src/simplefx/CMakeFiles/simplefx.dir/market.cpp.o.provides

src/simplefx/CMakeFiles/simplefx.dir/market.cpp.o.provides.build: src/simplefx/CMakeFiles/simplefx.dir/market.cpp.o


# Object files for target simplefx
simplefx_OBJECTS = \
"CMakeFiles/simplefx.dir/main.cpp.o" \
"CMakeFiles/simplefx.dir/tradingengine.cpp.o" \
"CMakeFiles/simplefx.dir/quotedist.cpp.o" \
"CMakeFiles/simplefx.dir/quotestream.cpp.o" \
"CMakeFiles/simplefx.dir/market.cpp.o"

# External object files for target simplefx
simplefx_EXTERNAL_OBJECTS =

bin/brokers/simplefx: src/simplefx/CMakeFiles/simplefx.dir/main.cpp.o
bin/brokers/simplefx: src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.o
bin/brokers/simplefx: src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.o
bin/brokers/simplefx: src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.o
bin/brokers/simplefx: src/simplefx/CMakeFiles/simplefx.dir/market.cpp.o
bin/brokers/simplefx: src/simplefx/CMakeFiles/simplefx.dir/build.make
bin/brokers/simplefx: src/brokers/libbrokers_common.a
bin/brokers/simplefx: src/server/src/simpleServer/libsimpleServer.a
bin/brokers/simplefx: src/imtjson/src/imtjson/libimtjson.a
bin/brokers/simplefx: src/simplefx/CMakeFiles/simplefx.dir/link.txt
	@$(CMAKE_COMMAND) -E cmake_echo_color --switch=$(COLOR) --green --bold --progress-dir=/home/martin/devbot/mmbot/CMakeFiles --progress-num=$(CMAKE_PROGRESS_6) "Linking CXX executable ../../bin/brokers/simplefx"
	cd /home/martin/devbot/mmbot/src/simplefx && $(CMAKE_COMMAND) -E cmake_link_script CMakeFiles/simplefx.dir/link.txt --verbose=$(VERBOSE)

# Rule to build all files generated by this target.
src/simplefx/CMakeFiles/simplefx.dir/build: bin/brokers/simplefx

.PHONY : src/simplefx/CMakeFiles/simplefx.dir/build

src/simplefx/CMakeFiles/simplefx.dir/requires: src/simplefx/CMakeFiles/simplefx.dir/main.cpp.o.requires
src/simplefx/CMakeFiles/simplefx.dir/requires: src/simplefx/CMakeFiles/simplefx.dir/tradingengine.cpp.o.requires
src/simplefx/CMakeFiles/simplefx.dir/requires: src/simplefx/CMakeFiles/simplefx.dir/quotedist.cpp.o.requires
src/simplefx/CMakeFiles/simplefx.dir/requires: src/simplefx/CMakeFiles/simplefx.dir/quotestream.cpp.o.requires
src/simplefx/CMakeFiles/simplefx.dir/requires: src/simplefx/CMakeFiles/simplefx.dir/market.cpp.o.requires

.PHONY : src/simplefx/CMakeFiles/simplefx.dir/requires

src/simplefx/CMakeFiles/simplefx.dir/clean:
	cd /home/martin/devbot/mmbot/src/simplefx && $(CMAKE_COMMAND) -P CMakeFiles/simplefx.dir/cmake_clean.cmake
.PHONY : src/simplefx/CMakeFiles/simplefx.dir/clean

src/simplefx/CMakeFiles/simplefx.dir/depend:
	cd /home/martin/devbot/mmbot && $(CMAKE_COMMAND) -E cmake_depends "Unix Makefiles" /home/martin/devbot/mmbot /home/martin/devbot/mmbot/src/simplefx /home/martin/devbot/mmbot /home/martin/devbot/mmbot/src/simplefx /home/martin/devbot/mmbot/src/simplefx/CMakeFiles/simplefx.dir/DependInfo.cmake --color=$(COLOR)
.PHONY : src/simplefx/CMakeFiles/simplefx.dir/depend

