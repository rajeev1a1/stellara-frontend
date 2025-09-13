const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

config.resolver.alias = {
  ...config.resolver.alias,
};

module.exports = config;