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
            return $j.get('/ws/schema/table/U_STUDENT_CONTACTS?q=studentsdcid==' + options.studentsdcid + '&projection=*');
        }
    };
});