/*global require*/

require.config({
    baseUrl: '/guardian',
    paths: {
        // app modules
        studentInfo: 'javascript/student-info',
        validate: 'javascript/validate'
    }
});

require(['studentInfo', 'validate'], function (studentInfo, validate) {
    'use strict';
    studentInfo.main();
    validate.main();
});