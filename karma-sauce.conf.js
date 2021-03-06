var webpackConfig = require('./webpack.config.browser.js');
delete webpackConfig.plugins;
delete webpackConfig.output;

module.exports = function(config) {
  var customLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: '44'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '39'
    },
    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: '11'
    }
  };

  config.set({
    sauceLabs: {
      testName: 'kurdcoin-base',
      recordScreenshots: false,
      recordVideo: false
    },
    frameworks: ['mocha', 'sinon-chai'],
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),

    files: ['dist/kurdcoin-base.min.js', 'test/unit/**/*.js'],

    preprocessors: {
      'test/unit/**/*.js': ['webpack']
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      noInfo: true
    },

    singleRun: true,

    reporters: ['dots', 'saucelabs']
  });
};
