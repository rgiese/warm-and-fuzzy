#pragma once

class MockSerial
{
public:
    MockSerial()
    {
    }

public:
    void println(char const* const szData)
    {
        puts(szData);
        puts("\n");
    }

    void printlnf(char const* const szFormat, ...)
    {
        va_list args;
        va_start(args, szFormat);

        vprintf(szFormat, args);
        puts("\n");

        va_end(args);
    }
};

extern MockSerial Serial;