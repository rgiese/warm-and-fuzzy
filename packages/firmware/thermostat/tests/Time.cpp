#include "base.h"

SCENARIO("Time mocks work correctly with timezone conversions", "[Time]")
{
    GIVEN("A global time value")
    {
        WHEN("Time is set to zero")
        {
            Time.testSetUTCTime(0);

            THEN("Time is zero")
            {
                REQUIRE(Time.now() == 0);
            }
        }

        WHEN("Time is set to Sunday 2pm")
        {
            Time.testSetLocalTime(ParticleDayOfWeek::Sunday, 14, 0);

            THEN("It is Sunday 2pm")
            {
                REQUIRE(Time.weekday(Time.now()) == static_cast<int>(ParticleDayOfWeek::Sunday));
                REQUIRE(Time.hour(Time.now()) == 14);
                REQUIRE(Time.minute(Time.now()) == 0);
            }
        }

        WHEN("Time is set to Sunday midnight")
        {
            Time.testSetLocalTime(ParticleDayOfWeek::Sunday, 0, 0);

            THEN("It is still far ahead of the first hundred thousand UTC seconds we use for basic UTC-only tests")
            {
                REQUIRE(Time.now() > 100000);
            }
        }
    }
}