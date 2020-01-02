#define CATCH_CONFIG_MAIN  // This tells Catch to provide a main() - only do this here
#include "base.h"

TEST_CASE("Tests execute", "[basics]")
{
    REQUIRE(1 == 1);
}
