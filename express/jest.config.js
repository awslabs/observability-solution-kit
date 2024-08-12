export default {
  verbose: true,
  testMatch: ['<rootDir>/test/**/*.test.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(d3|internmap|delaunator|robust-predicates))'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  coverageThreshold: {
    global: {
      lines: 70,
    },
  },
};
