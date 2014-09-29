/*global define, $j*/

define(function() {
    'use strict';
    return {
        /**
         *
         * @param options {Object}
         * @param options.studentsdcid {Number}
         * @returns {*}
         */
        getParGuars: function (options) {
            return $j.get('https://psapitest.irondistrict.org/dbe/schema/search/U_STUDENT_CONTACTS3/studentsdcid==' + options.studentsdcid + '&leg_par_guar==1', function() {}, 'json');
        }
    };
});