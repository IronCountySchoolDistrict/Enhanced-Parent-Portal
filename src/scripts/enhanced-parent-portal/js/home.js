import $ from 'jquery';

export function main() {
  var headerTemplate = $('#header-template').html();
  var headerSelect = $('h1');
  headerSelect.after(headerTemplate);
  headerSelect.remove();

  var verTemplate = $('#version-template').html();
  var verSelect = $('activeNav');
  verSelect.after(verTemplate);
}
