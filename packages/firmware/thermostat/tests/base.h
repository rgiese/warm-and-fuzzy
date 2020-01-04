#include <stdio.h>

#include <cstdarg>
#include <cstring>
#include <ctime>
#include <iostream>
#include <iomanip>
#include <string>
#include <vector>

// Test framework
#include "../../external/catch.hpp"

// Mocks
#include "mocks/types.h"
#include "mocks/constants.h"

#include "mocks/eeprom.h"
#include "mocks/io.h"
#include "mocks/locks.h"
#include "mocks/particle.h"
#include "mocks/serial.h"
#include "mocks/system.h"
#include "mocks/time.h"
#include "mocks/wifi.h"
#include "mocks/wire.h"

// Code-under-test
#include "inc/stdinc.h"

// Helpers
#include "SyntheticConfiguration.h"
