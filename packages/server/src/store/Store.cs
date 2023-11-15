namespace WarmAndFuzzy
{
    public class Store
    {
        // Content
        public ServerConfiguration ServerConfiguration { get; }
        public DeviceConfigurations DeviceConfigurations { get; }

        // Singleton
        public static Store Instance
        {
            get
            {
                if (instance == null)
                {
                    throw new Exception("Store referenced before initialization");
                }

                return instance;
            }
        }

        private static Store? instance = null;

        // Initialization
        private Store(ServerConfiguration serverConfiguration, DeviceConfigurations deviceConfigurations)
        {
            ServerConfiguration = serverConfiguration;
            DeviceConfigurations = deviceConfigurations;
        }

        public static void Initialize(string serverConfigurationFileName)
        {
            ServerConfiguration serverConfiguration = ServerConfiguration.ReadFromFile(serverConfigurationFileName);

            string deviceConfigurationsFileName = Path.Combine([Path.GetDirectoryName(serverConfigurationFileName) ?? ".", serverConfiguration.DeviceConfigurationsFile]);

            DeviceConfigurations deviceConfigurations = DeviceConfigurations.ReadFromFile(deviceConfigurationsFileName);

            instance = new Store(serverConfiguration, deviceConfigurations);
        }
    }
}