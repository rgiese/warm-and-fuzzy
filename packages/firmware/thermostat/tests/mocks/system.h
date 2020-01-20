#pragma once

class MockSystem
{
public:
    MockSystem()
    {
    }

public:
    void reset()
    {
        printf(">>> System reset requested.");
    }
};

extern MockSystem System;