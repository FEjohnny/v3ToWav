module.exports = {
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.ts'],
    moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts'],
};
