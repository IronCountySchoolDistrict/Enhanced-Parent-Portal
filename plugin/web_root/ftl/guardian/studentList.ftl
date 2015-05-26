<#if studentList?? >
    <ul id="students-list">
        <#list studentList as obj>
	        <li <#if selectedStudentId==obj.id> class="selected"</#if>>
	              <a href="javascript:switchStudent(${(obj.id?c)!""});">${(obj.firstName!"")?html}</a>
	        </li>
	     </#list>
	</ul>				
</#if>

<#-- The div is closed by guardian_header.txt 1-->

<input type="hidden" id="parentName" value="${(guardian.firstName!"")?html} ${(guardian.middleName!"")?html} ${(guardian.lastName!"")?html}">
    <#-- PA-448: A form to hold a hidden input html value to indicate the currently selected student id.
        Submitting a form with currently selected student id as a hidden input will prevent clear display of student id in the url -->
        <form id="switch_student_form" action="${(currentResource!"home.html")?js_string}" method="post">
            <input type="hidden" name="selected_student_id"/>
        </form>


    <#-- Script to set the selected_student_id and submit the form to retrieve data belonging to the currently selected student
        Consolidating all the logic related to switching the student into this ftl will improve code readability" -->
    <script type="text/javascript">
        function switchStudent(studentId){
           var switchStudentForm = document.getElementById('switch_student_form');
           switchStudentForm.selected_student_id.value=studentId;
           switchStudentForm.submit();
        }
    </script>
