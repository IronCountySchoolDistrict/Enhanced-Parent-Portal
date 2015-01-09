/*global $j*/
$j(function () {
    var loadingTemplate = $j($j('#parent-loading-template').html());
    var loadingSelector = $j('[href^="/admin/storedselections"]');
    loadingTemplate.insertAfter(loadingSelector);

    var deferredAjax = [];
    deferredAjax.push($j.ajax({
        type: 'GET',
        url: '/admin/student-info-verify-count.html',
        dataType: 'json'
    }));
    deferredAjax.push($j.ajax({
        type: 'GET',
        url: '/admin/student-contacts-verify-count.html',
        dataType: 'json'
    }));
    $j.when.apply($j, deferredAjax).done(function (studentInfoCount, studentContactsCount) {

        var insertSelector = $j('[href^="/admin/storedselections"]');

        var stuInfoResp = studentInfoCount[0];
        var stuContactsResp = studentContactsCount[0];

        if (stuInfoResp.studentInfoCount !== '0') {
            var infoCount = stuInfoResp.studentInfoCount;

            var studentInfoVerifyLink = $j($j('#student-info-verify-template').html());
            studentInfoVerifyLink.insertAfter(insertSelector);

            var studentInfoVerifyText = studentInfoVerifyLink.text();
            studentInfoVerifyLink.text(studentInfoVerifyText + ' (' + infoCount + ')');

            loadingTemplate.remove();

            $j('#student-info-verify-link').on('click', function(event) {
                event.preventDefault();
                // Make sure the student info verify page is shown when parent verify link is clicked
                $j.get('/admin/students/studentinfochange.html?frn=~(studentfrn)', function(getEvent) {
                    window.location.href = '/admin/students/home.html?selectstudent=U_Students_Extension.STUDENT_INFO_VERIFY=1';
                });
            })
        } else {
            loadingTemplate.remove();

            $j('<span>Student Info Verify (0)</span>').insertAfter(insertSelector);
        }

        if (stuContactsResp.studentContactsCount !== '0') {
            var contactsCount = stuContactsResp.studentContactsCount;

            var studentContactsVerifyLink = $j($j('#student-contacts-verify-template').html());
            studentContactsVerifyLink.insertAfter(insertSelector);

            var studentContactsVerifyText = studentContactsVerifyLink.text();
            studentContactsVerifyLink.text(studentContactsVerifyText + ' (' + contactsCount + ')');

            loadingTemplate.remove();

            $j('#student-contacts-verify-link').on('click', function(event) {
                event.preventDefault();
                // Make sure the student info verify page is shown when parent verify link is clicked
                $j.get('/admin/students/studentinfochange.html?frn=~(studentfrn)', function(getEvent) {
                    window.location.href = '/admin/students/home.html?selectstudent=U_Students_Extension.parent_verify=1';
                });
            })
        } else {
            loadingTemplate.remove();
            $j('<span>Student Contacts Verify (0)</span>').insertAfter(insertSelector);
        }
    }, 'json');
});