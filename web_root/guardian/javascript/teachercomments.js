/*global $j, psData*/

if (!(psPrefs.comments) ||
        (!(psData.isGuardianAndSSOEnabled) && !(psData.allowWebAccess))) {
    window.location.href = '/guardian/home_not_available.html';
}

(function() {
    'use strict';
    var psPrefs,
        psData,
        verTemplate,
        verSelect;

    psPrefs = $j.parseJSON($j('#ps-json').data().prefs);
    psData = $j.parseJSON($j('#ps-json').data().ps);

    verTemplate = $j($j('#version-template').html());
    verSelect = $j('activeNav');
    verTemplate.insertAfter(verSelect);
}());