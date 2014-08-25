/*global $j,require,_*/
require(['underscore'], function() {
    'use strict';
    var notAvailableTemplate,
        contentSelect,
        gradeData,
        data,
        renderedTemplate,
        psPrefs,
        psData,
        scoresTemplate;

    // Remove the original content from the DOM.
    $j('h1').nextAll().andSelf().not('#cust-content-footer').remove();

    // Hide the .box-round div that contains the custom-content-footer insertion point.
    // This div is the first result in the following selector.
    $j('.box-round').css({'display': 'none'});

    contentSelect = $j('#nav-secondary');

    psPrefs = $j.parseJSON($j('#ps-data').data().prefs);
    psData = $j.parseJSON($j('#ps-data').data().ps);

    if (psPrefs.ppscores === '1') {
        notAvailableTemplate = $j($j('#not-available-template').html());
        notAvailableTemplate.insertAfter(contentSelect);
    } else {
        scoresTemplate = $j('#scores-template').html();

        gradeData = psData.gradeData;
        if (gradeData === '--') {
            data = '&nbsp;';
        } else {
            data = psData.percentGradeData;
        }
        renderedTemplate = _.template(scoresTemplate, {data: data});

        // _.template returns a string, so we need to make it a jquery object so we can call insertAfter on it.
        $j(renderedTemplate).insertAfter(contentSelect);
    }
});