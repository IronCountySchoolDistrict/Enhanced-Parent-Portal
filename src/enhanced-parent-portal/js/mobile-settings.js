$j("tr").removeClass("oddRow");
$j("tr").eq(0).closest("table").addClass("linkDescList");

// Insert after the Disable Mobile PS (Subs) link
$j("[name=UF-00900278565]").closest("tr").after(
	`<tr>
        <td class="bold">
        	Disable Mobile PS (Public)
        </td>
        <td align="center">
        	<input type="checkbox" name="[prefschool]mobiledisable_guardian" value="1">
        </td>
    </tr>`
);