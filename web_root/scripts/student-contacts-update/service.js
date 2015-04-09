/*global define, $j*/

define(['config'], function(config) {
    'use strict';
    return {
        getParGuars: function (options) {
            return $j.getJSON(config.psApi + '/api/schema/search/' + config.studentContactsTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==1');
        },
        getParGuarsStaging: function (options) {
            return $j.getJSON(config.psApi + '/api/schema/search/' + config.studentContactsStagingTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==1');
        },
        getEmergConts: function (options) {
            return $j.getJSON(config.psApi + '/api/schema/search/' + config.studentContactsTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==0');
        },
        getEmergContsStaging: function (options) {
            return $j.getJSON(config.psApi + '/api/schema/search/' + config.studentContactsStagingTable + '/studentsdcid==' + options.studentsdcid + ';legal_guardian==0');
        },

        /**
         *
         * @param contactData {Object} - JSON-encoded contact data
         * @param contactRecordId {Number} Back-end id of the contact that is being edited
         */
        updateStagingContact: function (contactData, contactRecordId) {
            return $j.ajax({
                type: 'PUT',
                url: config.psApi + '/api/schema/' + config.studentContactsStagingTable + '/' + contactRecordId,
                contentType: "application/json",
                data: contactData,
                dataType: 'json'
            });
        },

        /**
         *
         * @param contactData {Object} - JSON-encoded contact data
         * @param contactRecordId {Number} Back-end id of the contact that is being edited
         */
        updateEmailStagingContact: function (contactData, contactRecordId) {
            return $j.ajax({
                type: 'PUT',
                url: config.psApi + '/api/schema/' + config.studentContactsEmailStagingTable + '/' + contactRecordId,
                contentType: "application/json",
                data: contactData,
                dataType: 'json'
            });
        },

        /**
         *
         * @param contactData {Object} - JSON-encoded contact data
         * @param contactRecordId {Number} Back-end id of the contact that is being edited
         */
        updatePhoneStagingContact: function (contactData, contactRecordId) {
            return $j.ajax({
                type: 'PUT',
                url: config.psApi + '/api/schema/' + config.studentContactsPhoneStagingTable + '/' + contactRecordId,
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
                url: config.psApi + '/api/schema/' + config.studentContactsStagingTable,
                contentType: "application/json",
                data: contactData,
                dataType: 'json'
            });
        },

        setStagingContactDcid: function(contactData, contactId) {
            return $j.ajax({
                type: 'PUT',
                url: config.psApi + '/api/schema/' + config.studentContactsStagingTable + '/' + contactId,
                contentType: "application/json",
                data: contactData,
                dataType: 'json'
            });
        },

        /**
         *
         * @param contactData {Object}
         */
        newEmailStagingContact: function (contactData) {
            return $j.ajax({
                type: 'POST',
                url: config.psApi + '/api/schema/' + config.studentContactsEmailStagingTable,
                contentType: "application/json",
                data: contactData,
                dataType: 'json'
            });
        },

        /**
         *
         * @param contactData {Object}
         */
        newPhoneStagingContact: function (contactData) {
            return $j.ajax({
                type: 'POST',
                url: config.psApi + '/api/schema/' + config.studentContactsPhoneStagingTable,
                contentType: "application/json",
                data: contactData,
                dataType: 'json'
            });
        }
    };
});