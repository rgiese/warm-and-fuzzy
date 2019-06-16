#include <stdio.h>

#include <iostream>
#include <string>

// Stand-ins for Particle definitions
typedef unsigned short uint16_t;

// Headers to be tested
#include "../thermostat/inc/FixedQueue.h"

#define VERIFY(x, expectedResult) \
    { \
        auto const fResult = (x); \
        if (fResult != expectedResult) \
        { \
            std::cout << "Test failed (" << __FILE__ << "#" << __LINE__ << "): " << #x << ": got " << fResult << ", expected " << expectedResult << std::endl; \
            return false; \
        } \
    } \

bool testFixedQueue()
{
    constexpr uint16_t cchItem_Max = 16;
    constexpr uint16_t nItems_Max = 4;
    
    std::string const string1("String1");
    std::string const string2("String2");
    std::string const string3("String3");
    std::string const string4("String4");
    std::string const string5("String5");

    {
        // Test evict-oldest = true (default) policy
        FixedQueue<cchItem_Max, nItems_Max> testQueue;

        // Verify empty queue
        VERIFY(testQueue.empty(), true);
        VERIFY(testQueue.size(), 0);
        VERIFY(testQueue.capacity(), nItems_Max);


        // Add one item
        testQueue.push(string1.c_str());

        VERIFY(testQueue.empty(), false);
        VERIFY(testQueue.size(), 1);
        VERIFY(testQueue.capacity(), nItems_Max);

        VERIFY(testQueue.front(), string1);

        // Pop item
        testQueue.pop();

        // Verify empty queue
        VERIFY(testQueue.empty(), true);
        VERIFY(testQueue.size(), 0);


        // Add different item
        testQueue.push(string2.c_str());

        VERIFY(testQueue.empty(), false);
        VERIFY(testQueue.size(), 1);

        VERIFY(testQueue.front(), string2);

        // Pop item
        testQueue.pop();

        // Verify empty queue
        VERIFY(testQueue.empty(), true);


        // Fill queue to depth
        testQueue.push(string1.c_str());
        testQueue.push(string2.c_str());
        testQueue.push(string3.c_str());
        testQueue.push(string4.c_str());

        VERIFY(testQueue.size(), 4);

        // Pop queue
        VERIFY(testQueue.front(), string1);
        testQueue.pop();

        VERIFY(testQueue.front(), string2);
        testQueue.pop();

        VERIFY(testQueue.front(), string3);
        testQueue.pop();

        VERIFY(testQueue.front(), string4);
        testQueue.pop();

        // Verify empty queue
        VERIFY(testQueue.empty(), true);


        // Fill queue beyond depth
        testQueue.push(string1.c_str());
        testQueue.push(string2.c_str());
        testQueue.push(string3.c_str());
        testQueue.push(string4.c_str());
        testQueue.push(string5.c_str());

        VERIFY(testQueue.size(), 4);

        // Pop queue
        VERIFY(testQueue.front(), string2);
        testQueue.pop();

        VERIFY(testQueue.front(), string3);
        testQueue.pop();

        VERIFY(testQueue.front(), string4);
        testQueue.pop();

        VERIFY(testQueue.front(), string5);
        testQueue.pop();

        // Verify empty queue
        VERIFY(testQueue.empty(), true);


        // Fill queue partially, pop, fill more
        testQueue.push(string1.c_str());
        testQueue.push(string2.c_str());

        testQueue.pop();

        testQueue.push(string3.c_str());
        testQueue.push(string4.c_str());
        testQueue.push(string5.c_str());

        // Pop queue
        VERIFY(testQueue.front(), string2);
        testQueue.pop();

        VERIFY(testQueue.front(), string3);
        testQueue.pop();

        VERIFY(testQueue.front(), string4);
        testQueue.pop();

        VERIFY(testQueue.front(), string5);
        testQueue.pop();

        // Verify empty queue
        VERIFY(testQueue.empty(), true);


        // Add over-long string
        std::string longString("This is a very long string beyond our character limits.");
        testQueue.push(longString.c_str());

        VERIFY(testQueue.empty(), true);
    }

    {
        // Test evict-oldest = false policy
        FixedQueue<cchItem_Max, nItems_Max, false> testQueue;

        // Fill queue beyond depth, no eviction
        testQueue.push(string1.c_str());
        testQueue.push(string2.c_str());
        testQueue.push(string3.c_str());
        testQueue.push(string4.c_str());
        testQueue.push(string5.c_str());

        VERIFY(testQueue.size(), 4);

        // Pop queue
        VERIFY(testQueue.front(), string1);
        testQueue.pop();

        VERIFY(testQueue.front(), string2);
        testQueue.pop();

        VERIFY(testQueue.front(), string3);
        testQueue.pop();

        VERIFY(testQueue.front(), string4);
        testQueue.pop();

        // Verify empty queue
        VERIFY(testQueue.empty(), true);
    }

    return true;
}

int main()
{
    if (!testFixedQueue())
    {
        return -1;
    }

    printf("Tests passed.\n");
    
    return 0;
}