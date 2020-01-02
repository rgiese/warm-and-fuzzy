#include "base.h"

#include "../inc/FixedQueue.h"


constexpr uint16_t cchItem_Max = 16;
constexpr uint16_t nItems_Max = 4;

std::string const string1("String1");
std::string const string2("String2");
std::string const string3("String3");
std::string const string4("String4");
std::string const string5("String5");

SCENARIO("FixedQueue works with evict-oldest (circular) policy", "[FixedQueue]")
{
    GIVEN("An empty queue")
    {
        FixedQueue<cchItem_Max, nItems_Max> testQueue;

        REQUIRE(testQueue.empty());
        REQUIRE(testQueue.size() == 0);
        REQUIRE(testQueue.capacity() == nItems_Max);

        WHEN("One item is pushed, then removed")
        {
            testQueue.push(string1.c_str());

            THEN("The queue is not empty")
            {
                REQUIRE(!testQueue.empty());
                REQUIRE(testQueue.size() == 1);
                REQUIRE(testQueue.capacity() == nItems_Max);
            }
            THEN("The correct item is at the front")
            {
                REQUIRE(testQueue.front() == string1);
            }

            testQueue.pop();

            THEN("The queue is empty again")
            {
                REQUIRE(testQueue.empty());
                REQUIRE(testQueue.size() == 0);
            }
        }

        WHEN("A different item is pushed, then removed")
        {
            testQueue.push(string2.c_str());

            THEN("The queue is not empty")
            {
                REQUIRE(!testQueue.empty());
                REQUIRE(testQueue.size() == 1);
                REQUIRE(testQueue.capacity() == nItems_Max);
            }
            THEN("The correct item is at the front")
            {
                REQUIRE(testQueue.front() == string2);
            }

            testQueue.pop();

            THEN("The queue is empty again")
            {
                REQUIRE(testQueue.empty());
                REQUIRE(testQueue.size() == 0);
            }
        }

        WHEN("The queue is filled to capacity")
        {
            testQueue.push(string1.c_str());
            testQueue.push(string2.c_str());
            testQueue.push(string3.c_str());
            testQueue.push(string4.c_str());

            THEN("The queue is at capacity")
            {
                REQUIRE(testQueue.size() == nItems_Max);
                REQUIRE(testQueue.size() == testQueue.capacity());
            }

            THEN("The first item is at the front")
            {
                REQUIRE(testQueue.front() == string1);
            }

            testQueue.pop();

            THEN("The next item is at the front")
            {
                REQUIRE(testQueue.front() == string2);
            }

            testQueue.pop();

            THEN("The next item is at the front")
            {
                REQUIRE(testQueue.front() == string3);
            }

            testQueue.pop();

            THEN("The next item is at the front")
            {
                REQUIRE(testQueue.front() == string4);
            }

            testQueue.pop();

            THEN("The queue is empty again")
            {
                REQUIRE(testQueue.empty());
            }
        }

        WHEN("The queue is filled beyond capacity")
        {
            testQueue.push(string1.c_str());
            testQueue.push(string2.c_str());
            testQueue.push(string3.c_str());
            testQueue.push(string4.c_str());
            testQueue.push(string5.c_str());

            THEN("The queue is at capacity")
            {
                REQUIRE(testQueue.size() == nItems_Max);
                REQUIRE(testQueue.size() == testQueue.capacity());
            }

            THEN("The first item is at the front")
            {
                REQUIRE(testQueue.front() == string2);
            }

            testQueue.pop();

            THEN("The next item is at the front")
            {
                REQUIRE(testQueue.front() == string3);
            }

            testQueue.pop();

            THEN("The next item is at the front")
            {
                REQUIRE(testQueue.front() == string4);
            }

            testQueue.pop();

            THEN("The next item is at the front")
            {
                REQUIRE(testQueue.front() == string5);
            }

            testQueue.pop();

            THEN("The queue is empty again")
            {
                REQUIRE(testQueue.empty());
            }
        }
        WHEN("The queue is partially filled, emptied, and refilled")
        {
            testQueue.push(string1.c_str());
            testQueue.push(string2.c_str());

            testQueue.pop();

            testQueue.push(string3.c_str());
            testQueue.push(string4.c_str());
            testQueue.push(string5.c_str());

            THEN("The first item is at the front")
            {
                REQUIRE(testQueue.front() == string2);
            }

            testQueue.pop();

            THEN("The next item is at the front")
            {
                REQUIRE(testQueue.front() == string3);
            }

            testQueue.pop();

            THEN("The next item is at the front")
            {
                REQUIRE(testQueue.front() == string4);
            }

            testQueue.pop();

            THEN("The next item is at the front")
            {
                REQUIRE(testQueue.front() == string5);
            }

            testQueue.pop();

            THEN("The queue is empty again")
            {
                REQUIRE(testQueue.empty());
            }
        }
    }
    GIVEN("An empty queue")
    {
        FixedQueue<cchItem_Max, nItems_Max> testQueue;

        REQUIRE(testQueue.empty());

        WHEN("An overly long item is added")
        {
            std::string longString("This is a very long string beyond our character limits.");
            testQueue.push(longString.c_str());

            THEN("The item was dropped")
            {
                REQUIRE(testQueue.empty());
            }
        }
    }
}

SCENARIO("FixedQueue works with keep-oldest (non-circular) policy", "[FixedQueue]")
{
    GIVEN("An empty queue")
    {
        FixedQueue<cchItem_Max, nItems_Max, false> testQueue;

        REQUIRE(testQueue.empty());

        WHEN("The queue is filled beyond capacity")
        {
            testQueue.push(string1.c_str());
            testQueue.push(string2.c_str());
            testQueue.push(string3.c_str());
            testQueue.push(string4.c_str());
            testQueue.push(string5.c_str());


            THEN("The queue is at capacity")
            {
                REQUIRE(testQueue.size() == nItems_Max);
                REQUIRE(testQueue.size() == testQueue.capacity());
            }

            THEN("The oldest item is still at the front")
            {
                REQUIRE(testQueue.front() == string1);
            }

            testQueue.pop();

            THEN("The next item is at the front")
            {
                REQUIRE(testQueue.front() == string2);
            }

            testQueue.pop();

            THEN("The next item is at the front")
            {
                REQUIRE(testQueue.front() == string3);
            }

            testQueue.pop();

            THEN("The next item is at the front")
            {
                REQUIRE(testQueue.front() == string4);
            }

            testQueue.pop();

            THEN("The queue is empty again")
            {
                REQUIRE(testQueue.empty());
            }
        }
    }
}
