module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        chrome: '88'
      }
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-transform-async-to-generator',
    '@babel/plugin-transform-runtime'
  ]
};
