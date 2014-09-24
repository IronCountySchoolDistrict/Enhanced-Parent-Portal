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
            return $j.get('https://psapitest.irondistrict.org/ws/schema/table/U_STUDENT_CONTACTS/studentsdcid==' + options.studentsdcid);
        }
    };
});