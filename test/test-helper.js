if (typeof window === 'undefined') {
  require('babel-core/register');
  global.KurdCoinBase = require('../src/index');
  global.chai = require('chai');
  global.sinon = require('sinon');
  global.expect = global.chai.expect;
}
