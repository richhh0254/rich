module.exports = function (api) {
  api.cache(true);
  return {
    // 基础预设，必须包含
    presets: ['babel-preset-expo'],
    plugins: [
      // 如果你之前这里写了 'react-native-worklets/plugin'，请删除它
      // 只需要下面这一行，且它必须放在插件列表的最后一位
      'react-native-reanimated/plugin',
    ],
  };
