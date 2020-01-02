#pragma once

class MockWiFi
{
public:
    MockWiFi()
    {
    }

public:
    char const* SSID() const
    {
        return "MockWiFi";
    }
};

extern MockWiFi WiFi;