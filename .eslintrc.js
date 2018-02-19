module.exports = {
  'env': {
    'browser': false,
    'commonjs': true,
    'es6': true,
    'node': true
  },
  "parserOptions": {
    "ecmaVersion": 2017
  },
  'extends': 'eslint:recommended',
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ]
  }
};
