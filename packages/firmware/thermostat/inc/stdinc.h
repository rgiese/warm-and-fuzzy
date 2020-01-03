#pragma once

#include <math.h>
#include <mutex>

// Generated files
#include "../generated/firmware_generated.h"

typedef Flatbuffers::Firmware::DaysOfWeek DaysOfWeek;
typedef Flatbuffers::Firmware::ThermostatAction ThermostatAction;
typedef Flatbuffers::Firmware::ThermostatSettingType ThermostatSettingType;

// Core definitions
#include "inc/CoreDefs.h"
#include "inc/Activity.h"

#include "inc/FixedStringBuffer.h"
#include "inc/FixedQueue.h"
#include "inc/QueuedPublisher.h"

// OneWire stack
#include "onewire/OneWireCRC.h"
#include "onewire/OneWireAddress.h"
#include "onewire/IOneWireGateway.h"
#include "onewire/OneWireGateway2484.h"
#include "onewire/OneWireTemperatureSensor.h"

// Helpers
#include "inc/Z85.h"

// Configuration
#include "inc/Configuration.h"

// Components
#include "inc/ThermostatSetpointScheduler.h"
#include "inc/Thermostat.h"

// Publishers
#include "publishers/StatusPublisher.h"
