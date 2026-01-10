module.exports = function (api) {
  api.cache(true);

  const isTest = process.env.NODE_ENV === 'test';

  const presets = isTest
    ? ['babel-preset-expo']
    : [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'];

  const plugins = isTest ? [] : ['react-native-reanimated/plugin'];

  return {
    presets,
    plugins,
  };
};
