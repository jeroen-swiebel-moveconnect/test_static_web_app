// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
    process.env.NO_PROXY = 'localhost, 0.0.0.0/4201, 0.0.0.0/9876';
    process.env.no_proxy = 'localhost, 0.0.0.0/4201, 0.0.0.0/9876';
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage-istanbul-reporter'),
            require('karma-sonarqube-reporter'),
            require('karma-junit-reporter'),
            require('@angular-devkit/build-angular/plugins/karma')
        ],
        files: ['https://code.jquery.com/jquery-1.11.2.min.js'],
        client: {
            clearContext: true
        },
        coverageIstanbulReporter: {
            dir: require('path').join(__dirname, '../coverage'),
            reports: ['html', 'lcovonly'],
            fixWebpackSourcePaths: true
        },
        junitReporter: {
            outputDir: '../junitresults/', // results will be saved as $outputDir/$browserName.xml
            outputFile: 'JUNITRESULTS_FOR_JENKINS.xml', // if included, results will be saved as $outputDir/$browserName/$outputFile
            // suite: 'frontEnd', // suite will become the package name attribute in xml testsuite element
            useBrowserName: false // add browser name to report and classes names
            //nameFormatter: undefined, // function (browser, result) to customize the name attribute in xml testcase element
            //classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element
            // xmlVersion: null // use '1' if reporting to be per SonarQube 6.2 XML format
        },
        sonarqubeReporter: {
            basePath: 'src/app', // test files folder
            filePattern: '**/*spec.ts', // test files glob pattern
            encoding: 'utf-8', // test files encoding
            outputFolder: 'coverage', // report destination
            legacyMode: false, // report for Sonarqube < 6.2 (disabled)
            reportName: 'testExecution.xml'
        },
        reporters: ['sonarqube', 'junit'],
        browsers: ['ChromeHeadless'],
        customLaunchers: {
            HeadlessChrome: {
                base: 'ChromeHeadless'
                // ,
                // flags: ['--no-sandbox']
            }
        },
        port: 9876,
        browserNoActivityTimeout: 120000,
        browserDisconnectTimeout: 120000,
        pingTimeout: 120000,
        colors: false,
        logLevel: config.LOG_DEBUG,
        singleRun: true // Karma captures browsers, runs the tests and exits
    });
};
