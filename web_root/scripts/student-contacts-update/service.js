/*global define, $j*/

define(['config'], function(config) {
    'use strict';
    return {
        /**
         * Get all parent-guardian contacts for a student that have been approved.
         * @param options {Object}
         * @param options.studentsdcid {Number}
         * @returns {*}
         */
        getParGuars: function (options) {
            return $j.get(config.psApi + '/dbe/schema/search/' + config.studentContactsTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==1',
                function() {},
                'json'
            );
        },

        /**
         * Get all parent-guardian contacts for a student that are in the contacts staging table.
         * @param options {Object}
         * @param options.studentsdcid {Number}
         * @returns {*}
         */
        getParGuarsStaging: function (options) {
            return $j.get(config.psApi + '/dbe/schema/search/' + config.studentContactsStagingTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==1',
                function() {},
                'json'
            );
        },

        /**
         * Get all emergency contacts for a student that have been approved.
         * @param options {Object}
         * @param options.studentsdcid {Number}
         * @returns {*}
         */
        getEmergConts: function (options) {
            return $j.get(config.psApi + '/dbe/schema/search/' + config.studentContactsTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==0',
                function() {},
                'json'
            );
        },

        /**
         * Get all emergency contacts for a student that are in the contacts staging table.
         * @param options {Object}
         * @param options.studentsdcid {Number}
         * @returns {*}
         */
        getEmergContsStaging: function (options) {
            return $j.get(config.psApi + '/dbe/schema/search/' + config.studentContactsStagingTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==0',
                function() {},
                'json'
            );
        },

        /**
         *
         * @param contactData {Object} - JSON-encoded contact data
         * @param contactRecordId {Number} Back-end id of the contact that is being edited
         */
        updateStagingContact: function (contactData, contactRecordId) {
            return $j.ajax({
                type: 'PUT',
                url: config.psApi + '/dbe/schema/' + config.studentContactsStagingTable + '/' + contactRecordId,
                contentType: "application/json",
                data: contactData,
                dataType: 'json'
            });
        },

        /**
         *
         * @param contactData {Object}
         */
        newStagingContact: function (contactData) {
            return $j.ajax({
                type: 'POST',
                url: config.psApi + '/dbe/schema/' + config.studentContactsStagingTable,
                contentType: "application/json",
                data: contactData,
                dataType: 'json'
            });
        }
    };
});