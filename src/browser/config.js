/**
 * Load app configurations.
 *
 * Since it may be loaded directly from the renderer process,
 * without passing trhough a transpiler, this file must use ES5.
 */

const fs = require('fs');
const path = require('path');
const defaultsDeep = require('lodash.defaultsdeep');
const sqlectron = require('sqlectron-core');

let config;

exports.get = function getConfiguration() {
  if (config) {
    return config;
  }

  const args = (process.argv || []);
  const argsConfig = {
    devMode: args.indexOf('--dev') !== -1,
  };

  const basePath = path.resolve(__dirname, '..', '..');
  const packageConfig = readJSON(path.resolve(basePath, 'package.json'));

  sqlectron.config.prepareSync();
  const appConfig = sqlectron.config.getSync();
  const configPath = sqlectron.config.path();

  // use NODE_ENV for renderer process
  // but if that is not defined then use --dev arg
  const isDev = process.env.NODE_ENV !== 'production' || argsConfig.devMode;

  const defaultConfig = {
    path: configPath,
    log: {
      console: isDev,
      file: false,
      level: appConfig.level || (process.env.DEBUG ? 'debug' : 'error'),
      path: configPath.replace('.json', '.log'),
    },
  };

  config = defaultsDeep(
    appConfig,
    packageConfig,
    argsConfig,
    defaultConfig
  );

  return config;
};


function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
