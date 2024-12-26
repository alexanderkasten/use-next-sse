module.exports = {
  presets: ['@babel/typescript', ['@babel/env', {loose: false}], ['@babel/react', { runtime: 'automatic' }]],
  plugins: [['@babel/proposal-class-properties']]
};
