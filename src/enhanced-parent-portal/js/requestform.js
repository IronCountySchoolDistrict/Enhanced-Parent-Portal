/*global $j*/
var headerTemplate = $j($j('#header-template').html());
var select = $j('h1').eq(0);
select.html(headerTemplate);

var schedulePref = '~[displaypref:schedule~[gpv:nextschool]';
if (schedulePref === '1') {
    var formAction = 'requests~[if#2.pref.schedule~[gpv:nextschool]=1]approved[/if#2].html?schedulerequestyearid=~(schedule.yearidfuture)';
    $j('#reqform').attr('action', formAction);

    var requestsTemplate = $j($j('#requests-template').html());
    var requestsSelect = $j('#reqform .group');
    requestsTemplate.insertAfter(requestsSelect);
}

// TODO: Refactor this so any page that needs the version-template added to the page can call the same script.
var verTemplate = $j($j('#version-template').html());
var verSelect = $j('#activeNav');
verTemplate.insertAfter(verSelect);