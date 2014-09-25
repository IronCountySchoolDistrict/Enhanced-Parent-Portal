/*global define, $j*/

define(function() {
    return {
        /**
         *
         * @param options {Object}
         * @param options.studentsdcid {Number}
         * @returns {*}
         */
        getContacts: function (options) {
            return $j.get('https://psapitest.irondistrict.org/dbe/schema/search/U_STUDENT_CONTACTS/studentsdcid==' + options.studentsdcid, function() {}, 'json');
        }
    };
});