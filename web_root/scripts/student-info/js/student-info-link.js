/*global $j, psData*/
$j(function() {
   'use strict';

    var studentInInfoStaging;
    $j.getJSON('/admin/student-info-verify.html?studentsdcid=' + psData.studentDcid, function (resp) {

        var stuInfoTemplate = $j($j('#stu-info-verify-template').html());
        var insertSelector = $j('[href^="contacts/studentcontacts.html"]').parent();
        stuInfoTemplate.insertAfter(insertSelector);

        if (resp.studentInfoVerify) {
            $j('#student-verify-link').css({'font-weight': 'bold'});
        }
    }, 'json');
});
