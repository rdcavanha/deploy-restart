module.exports = {
    roots: ['<rootDir>'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test))\\.ts$',
    moduleFileExtensions: ['ts', 'js', 'node'],
};
