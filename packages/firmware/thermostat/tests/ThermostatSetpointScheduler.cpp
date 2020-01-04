#include "base.h"

// Default values for the (legacy) core configuration (vs. settings)
static ThermostatAction const sc_DefaultAllowedActions = ThermostatAction::Cool;
static float const sc_DefaultSetPointHeat = 20;
static float const sc_DefaultSetPointCool = 24;

static void applySyntheticConfiguration(Configuration& configuration)
{
    flatbuffers::FlatBufferBuilder flatbufferBuilder(1024);
    {
        auto const configurationRoot = Flatbuffers::Firmware::CreateThermostatConfigurationDirect(
            flatbufferBuilder,
            Configuration::buildTemperature(0.5f),
            600,
            0,
            sc_DefaultAllowedActions,
            Configuration::buildTemperature(sc_DefaultSetPointHeat),
            Configuration::buildTemperature(sc_DefaultSetPointCool),
            nullptr);

        flatbufferBuilder.Finish(configurationRoot);
    }

    char rgEncodedConfiguration[1024];
    uint16_t cchEncodedConfiguration = Z85::EncodeBytes(rgEncodedConfiguration,
                                                        countof(rgEncodedConfiguration),
                                                        flatbufferBuilder.GetBufferPointer(),
                                                        flatbufferBuilder.GetSize());

    REQUIRE(cchEncodedConfiguration != 0);

    REQUIRE(configuration.SubmitUpdate(rgEncodedConfiguration, cchEncodedConfiguration) ==
            Configuration::ConfigUpdateResult::Accepted);

    REQUIRE(configuration.AcceptPendingUpdates());
}

SCENARIO("Thermostat setpoints scheduler works", "[ThermostatSetpointScheduler]")
{
    GIVEN("A blank configuration")
    {
        Configuration configuration;
        applySyntheticConfiguration(configuration);

        REQUIRE(configuration.rootConfiguration().allowedActions() == ThermostatAction::Cool);
        REQUIRE(Configuration::getTemperature(configuration.rootConfiguration().setPointHeat_x100()) ==
                sc_DefaultSetPointHeat);
        REQUIRE(Configuration::getTemperature(configuration.rootConfiguration().setPointCool_x100()) ==
                sc_DefaultSetPointCool);

        ThermostatSetpointScheduler scheduler;

        WHEN("Current time is zero")
        {
            THEN("A blank setting is returned")
            {
                ThermostatSetpoint setpoint = scheduler.getCurrentThermostatSetpoint(configuration);

                REQUIRE(setpoint.SetPointHeat == 20);
                REQUIRE(setpoint.SetPointCool == 24);
                REQUIRE(setpoint.AllowedActions == ThermostatAction::Cool);
            }
        }
    }
}