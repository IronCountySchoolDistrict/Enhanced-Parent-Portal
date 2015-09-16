$j(document).ready(function () {
    $j('input#activeNav').after('<input id="activePageVersion" type="hidden" value="4.0"/>');

    var emailPref = '~[displaypref:email~(curschoolid)]';
    if (emailPref === '1') {
        window.location.href = '/guardian/home_not_available.html';
    }

});