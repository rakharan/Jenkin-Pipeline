// jest.config.js

module.exports = {
    preset: 'ts-jest', // Use the ts-jest preset to enable Jest to work with TypeScript
    testEnvironment: 'node', // The environment in which the tests should be run
    
    // **CRITICAL**: This section tells Jest to generate a test report in the JUnit XML format.
    // The Jenkinsfile specifically looks for the 'junit.xml' file to display test results.
    reporters: [
      'default'
    ]
  };