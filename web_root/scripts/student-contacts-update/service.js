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
        },

        /**
         * @param contactData {Object} - JSON-encoded contact data
         * @param contactRecordId {Number} Back-end id of the contact that is being edited
         */
        saveUpdateContact: function (contactData, contactRecordId) {
            return $j.ajax({
                type: 'PUT',
                url: 'https://psapitest.irondistrict.org/dbe/schema/U_STUDENT_CONTACTS3/' + contactRecordId,
                contentType: "application/json",
                data: contactData,
                dataType: 'json'
            });
        },

        /**
         *
         * @param contactData {Object}
         * @param studentsDcid {Number}
         */
        saveNewContact: function (contactData, studentsDcid) {

        }
    };
});