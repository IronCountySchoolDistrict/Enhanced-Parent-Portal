/*global $j*/
$j(function() {
    var config = {
        // PowerSchool Point of Contact server, which will talk with the PS REST API.
        "psPoc": "https://psit.irondistrict.org",

        // Student Contacts Database Extension Table Name
        "stuInfoDbe": "u_student_info"
    };

    var studentInInfoStaging;
    $j.get(config['psPoc'] + '/student-info/staging/' + psData.studentDcid, function (resp) {

        // Check if student has staging record
        if (resp.record.length === 0) {
            studentInInfoStaging = false;
        } else {
            studentInInfoStaging = true;
        }
    }, 'json');

    var stuInfoTemplate = $j($j('#stu-info-verify-template').html());
    var insertSelector = $j('[href^="contacts/studentcontacts.html"]').parent();
    stuInfoTemplate.insertAfter(insertSelector);

    if (studentInInfoStaging) {
        $j('#student-verify-link').css({'font-weight': 'bold'});
    }
});
