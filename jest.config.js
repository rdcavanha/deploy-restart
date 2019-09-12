module.exports = {
    roots: ['<rootDir>'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    testRegex: '(/__test__/.*|(\\.|/)(test))\\.ts$',
    moduleFileExtensions: ['ts', 'js', 'node'],
};
