import $ from 'jquery';

export function main() {
  var template = $($('#requests-template').html());
  var select = $(':input').eq(3).parent().parent();
  template.insertAfter(select);
}
