/*global $j*/
$j(function () {
    var loadingTemplate = $j($j('#parent-loading-template').html());
    var loadingSelector = $j('[href^="/admin/storedselections"]');
    loadingTemplate.insertAfter(loadingSelector);

    $j.getJSON('/admin/student-info-verify-count.html', function(studentInfoCountResp) {
        var insertSelector = $j('[href^="/admin/storedselections"]');


        if (studentInfoCountResp.studentInfoCount !== '0') {
            var infoCount = studentInfoCountResp.studentInfoCount;

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


    });
});