module.exports = {
    clearMocks: true,
    moduleFileExtensions: ['ts', 'js'],
    roots: ['.'],
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    // setupFilesAfterEnv: ['jest-extended'],
    globals: {
        'ts-jest': {
            diagnostics: false,
        },
    },
    // globalSetup: '<rootDir>/tests/global-setup.ts',
    // globalTeardown: './src/tests/global-teardown.ts',
};
