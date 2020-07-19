const JunhoPublishPlugin = require('./../lib/index');

module.exports = {
  publicPath: './',
  runtimeCompiler: true,
  devServer: {
    host: '0.0.0.0',
    port: '8030'
  },
  productionSourceMap: false,
  
  configureWebpack: config => {
    const configs = {};
    configs.plugins = [];
    configs.plugins.push(new JunhoPublishPlugin({
      domain: 'http://localhost:3001/receive',
      target: 'D:\\webpackPlugin\\pubt\\upload',
      receiveType: 'merge', // replace merge
    }));

    return configs;
  }
};
