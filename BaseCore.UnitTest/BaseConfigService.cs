using Microsoft.Extensions.Configuration;
using System;

namespace BaseCore.UnitTest
{
    public class BaseConfigService
    {
        public readonly IConfiguration ConfigurationRoot;

        public BaseConfigService()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

            ConfigurationRoot = builder.Build();
        }
    }
}
