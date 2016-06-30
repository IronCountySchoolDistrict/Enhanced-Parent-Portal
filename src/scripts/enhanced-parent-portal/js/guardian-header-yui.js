import $ from 'jquery';

export function main() {
  var prtSchSelect = $j('#print-school');
  var prtSchString = '~(studentname)<br>~';
  prtSchSelect.prepend(prtSchString);

  var eppDisabledPref = '~[displaypref:eppdisabledl~(curschoolid)]';
  if (eppDisabledPref === '1') {
    var downloadSelect = $j('[href="studentdata.xml?ac=download"]');
    downloadSelect.remove();
  }

  $j('#legal').append('<span id="spanEPPVersion" >Enhanced Parent Portal Customization by PDS.</span>');
  var pageVersion = 'Unknown/Stock';
  if ($j('#activePageVersion').length !== 0) {
    pageVersion = $j('#activePageVersion').val();
  }
  $j('#PDS-EPP-details').append('<strong>Current Page Version:</strong> ' + pageVersion);
  $j('#spanEPPVersion').click(function() {
    $j('#PDS-EPP-details').show().dialog({
      title: 'EPP Version Details',
      width: 450
    });
  });

  // Add EPP links
  var lastNavLi = $j('#nav-main li').last();
  var eppTemplate = $j($j('#epp-template').html());
  eppTemplate.insertAfter(lastNavLi);

  // Remove PowerSchool Information Link, which is replaced with EPP School Information link
  $j('a:contains("School Information")').eq(0).remove();

  // Remove stock PowerSchool nav-main navigation links if preference is set to disable those links.
  if (!psData.showGradesAttendance) {
    $j('#nav-main li:contains("Grades and Attendance")').remove();
  }
  if (!psData.showHistoricalGrades) {
    $j('#nav-main li:contains("Grade History")').remove();
  }
  if (!psData.showAttendance) {
    $j('#nav-main li:contains("Attendance History")').remove();
  }
  if (!psData.showEmail) {
    $j('#nav-main li:contains("Email Notification")').remove();
  }
  if (!psData.showComments) {
    $j('#nav-main li:contains("Teacher Comments")').remove();
  }
  if (!psData.showBulletin) {
    $j('#nav-main li:contains("School Bulletin")').remove();
  }
  if (!psData.showSchedule) {
    $j('#nav-main li:contains("Class Registration")').remove();
  }
  if (!psData.showBalance) {
    $j('#nav-main li:contains("Balance")').remove();
  }
  if (!psData.showCalendars) {
    $j('#nav-main li:contains("My Calendars")').remove();
  }

  // Set correct selected class
  if (window.location.pathname.indexOf('accesslog') !== -1) {
    $j('#nav-main li:contains("Access Logs")').attr('class', 'selected');
  } else if (window.location.pathname.indexOf('parentdemographics') !== -1) {
    $j('#nav-main li:contains("Demographic Change")').attr('class', 'selected');
  } else if (window.location.pathname.indexOf('discipline') !== -1) {
    $j('#nav-main li:contains("Discipline")').attr('class', 'selected');
  } else if (window.location.pathname.indexOf('graduation') !== -1) {
    $j('#nav-main li:contains("Graduation Progress")').attr('class', 'selected');
  } else if (window.location.pathname.indexOf('honorroll') !== -1) {
    $j('#nav-main li:contains("Honor Roll")').attr('class', 'selected');
  } else if (window.location.pathname.indexOf('studentsched') !== -1) {
    $j('#nav-main li:contains("My Schedule")').attr('class', 'selected');
  } else if (window.location.pathname.indexOf('schoolinfo') !== -1) {
    $j('#nav-main li:contains("School Information")').attr('class', 'selected');
  } else if (window.location.pathname.indexOf('testscore') !== -1) {
    $j('#nav-main li:contains("Test Scores")').attr('class', 'selected');
  }
}
