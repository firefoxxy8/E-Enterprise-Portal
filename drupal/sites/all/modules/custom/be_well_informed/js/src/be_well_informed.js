function showElementOutOfMany($wrapper_to_show, $common_selector) {
  $common_selector.hide();
  $wrapper_to_show.show();
  resizeModal()
}

jQuery.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  jQuery.each(a, function() {
    objRoot = this.name.replace(/]/g, '')
      .split(/\[/g)
      .reduce(function(previous, current, cIndex, original) {
        var newObject = {}
        var property = original[original.length - 1 - cIndex]
        newObject[property] = previous
        return newObject;
      }, this.value);

    jQuery.extend(true, o, objRoot);
  });
  return o;
};

function resizeModal() {
  jQuery('#be-well-informed-modal').dialog({
    position: { 'my': 'center', 'at': 'center' }
  });
  if(jQuery('.be-well-informed-modal').css('top').replace('px', '') < 1){
    jQuery('.be-well-informed-modal').css('top', 0)
  }
}

function checkValues(previous, current, cIndex, keys) {
  var previousKeys = Object.keys(previous[keys[cIndex]])

  if ((previousKeys.indexOf('Value') > -1 && previous[keys[cIndex]].Value == "")) {
    delete previous[keys[cIndex]];
  }
  else if (['object'].indexOf(typeof previous[keys[cIndex]]) > -1) {
    previous[keys[cIndex]] = previousKeys.reduce(checkValues, previous[keys[cIndex]])
    if (Object.keys(previous[keys[cIndex]]).length == 0) {
      delete previous[keys[cIndex]];
    }
  }
  return previous
}

var sampleData = function() {};

/**
 * Clear form inputs and hide warning messages
 */
function resetBWIForm() {
  var $form = $('#water_analysis_results_form');
  $form.parsley().reset();
  $form.find('input[type=number]').val('');
  $form.find('input[type=radio]').prop('checked', false);
  $form.find('select option').prop('selected', false);
  $('.bs-callout-info').toggleClass('hidden', true);
  $('.bs-callout-warning').toggleClass('hidden', true);
}

(function($) {

  sampleData =  function(sample) {
    if(!sample) {
      sample = {"CityName":"Anonymous","RoutineContaminants":{"As":{"Symbol":"As","Name":"Arsenic","Value":".048","Unit":"mg/L"},"Cl":{"Symbol":"Cl","Name":"Chloride","Value":"5.2","Unit":"mg/L"},"Cu":{"Symbol":"Cu","Name":"Copper","Value":".104","Unit":"mg/L"},"CuSt":{"Symbol":"CuSt","Name":"Copper, Stagnant","Value":".636","Unit":"mg/L"},"Fl":{"Symbol":"Fl","Name":"Fluoride","Value":".8","Unit":"mg/L"},"Har":{"Symbol":"Har","Name":"Hardness as CaCO3","Value":"34.1","Unit":"mg/L"},"Fe":{"Symbol":"Fe","Name":"Iron","Value":"0","Unit":"mg/L"},"Pb":{"Symbol":"Pb","Name":"Lead","Value":"0","Unit":"mg/L"},"PbSt":{"Symbol":"PbSt","Name":"Lead, Stagnant","Value":".010","Unit":"mg/L"},"Mn":{"Symbol":"Mn","Name":"Manganese","Value":"0","Unit":"mg/L"},"NO3":{"Symbol":"NO3","Name":"Nitrate-N","Value":".99","Unit":"mg/L"},"NO2":{"Symbol":"NO2","Name":"Nitrite-N","Value":"0","Unit":"mg/L"},"ph":{"Symbol":"ph","Name":"pH","Value":"6.62","Unit":"units"},"Na":{"Symbol":"Na","Name":"Sodium","Value":"9.24","Unit":"mg/L"}},"Bac_G":"rdb_Bac_False","Ecoli_G":"rdb_Ecoli_False","RadionuclideContaminants":{"Rn":{"Symbol":"Rn","Name":"Radon","Value":"2194","Unit":"pCi/L"},"U":{"Symbol":"U","Name":"Uranium","Value":"8","Unit":"μg/L"},"AGA":{"Symbol":"AGA","Name":"Gross Alpha","Value":"7.3","Unit":"pCi/L"}}};
    }

    for(var cat in sample){
      if(typeof sample[cat] == 'object'){
        for(var field in sample[cat]){
          if(typeof sample[cat][field] == 'object') {
            for(var prop in sample[cat][field]){
              var selector = '[name="' + cat + '[' + field + '][' + prop + ']"]';
              $(selector).val(sample[cat][field][prop]);
            }
          }
        }
      }
      else {
        var selector = '[name="' + cat + '"]';
        $(selector+'[type=radio][value="'+sample[cat]+'"]').prop('checked', true)
        $('select'+selector).val(sample[cat])
      }
    }
  }
  var default_datatable_result_details_options = {
    dom: 't',
    bLengthChange: false,
    bAutoWidth: false,
    bSort: false,
    columnDefs: [
      {className: "be-well-results-first-column", "targets": [0]}
    ],
    createdRow: function(row, data, dataIndex) {
      // Add data-title attributes to row
      $(row).find('td:eq(0)').attr('data-title', 'Result');
      $(row).find('td:eq(1)').attr('data-title', 'Element');
      $(row).find('td:eq(2)').attr('data-title', 'Your Entry');
      $(row).find('td:eq(3)').attr('data-title', 'Limit');
      $(row).find('td:eq(4)').attr('data-title', 'About Your Well Water');
    },
    paging: false
  };

  var default_datatable_result_summary_options = {
    dom: 't',
    bLengthChange: false,
    bAutoWidth: false,
    bSort: false,
    columnDefs: [
      {className: "be-well-results-first-column", "targets": [0]}
    ],
    createdRow: function(row, data, dataIndex) {
      // Add data-title attributes to row
      $(row).find('td:eq(0)').attr('data-title', 'Result');
      $(row).find('td:eq(1)').attr('data-title', 'Element');
      $(row).find('td:eq(2)').attr('data-title', 'Your Entry');
      $(row).find('td:eq(3)').attr('data-title', 'Limit');
      $(row).find('td:eq(4)').attr('data-title', 'About Your Well Water');
    },
    paging: false
  };

  Parsley.addValidator('checkChildren', {
    messages: {en: 'You must correctly give value or choose a whether the microbe was present!'},
    requirementType: 'integer',
    validate: function(_value, requirement, instance) {
      for (var i = 1; i <= requirement; i++)
        if (i == 1 && instance.$element.find('input').val() // If block-1 has any value in the input box
          || i == 2 && instance.$element.find('[type=radio]:checked').length) { // or if block-2 has any radio buttons checked
          return true; // One section is filled, this check is valid
        }
      return false; // No section is filled, this validation fails
    }
  });

  $('#be-well-informed-modal')
    .html(Drupal.settings.be_well_informed.modal)
    .dialog({
      modal: true,
      width: "auto",
      position: { 'my': 'center', 'at': 'center' },
      dialogClass: 'be-well-informed-modal',
      autoOpen: false,
      create: function(event, ui) {
        var $form = $('#water_analysis_results_form');
        $form
          .parsley({
            inputs: Parsley.options.inputs + ',[data-parsley-check-children]'
          })
          .on('field:validated', function() {
            var ok = $('.parsley-error').length === 0;
            $('.bs-callout-info').toggleClass('hidden', !ok);
            $('.bs-callout-warning').toggleClass('hidden', ok);
          })
          .on('form:submit', function() {
            return false; // Don't submit form for this demo
          });

        $('#water_analysis_reset').click(function() {
          resetBWIForm();
          resizeModal()
        });

        $("#be-well-informed-accordion").prop('data-min-width', $("#be-well-informed-accordion").width())
        // Makeshift accordion like widget
        $('#be-well-informed-accordion .head').click(function() {
          $(this).find('i').toggleClass('fa-caret-down fa-caret-right')
          $(this).next().toggle();
          var min = $("#be-well-informed-accordion").prop('data-min-width');
          var cWidth = $(this).width()
          if(cWidth > min){
            $("#be-well-informed-accordion").prop('data-min-width', cWidth).css({"min-width":cWidth})
          }
          resizeModal()
          return false;
        });

      }
    })

  $('#bwi-check-water-btn').click(function() {
    $('#be-well-informed-modal').dialog("open")
    resizeModal()
  });

  $('#be-well-informed-modal').on('click', '#water_analysis_submit', function() {
    var $form = $('#water_analysis_results_form');
    // If the form does not validate do not submit data.
    if (!$form.parsley().validate()) {
      return false;
    }

    var $loading_wrapper = $('#be-well-informed-loading-wrapper');
    var $results_wrapper = $('#be-well-informed-results-wrapper');
    var $all_wrappers = $('.be-well-informed-modal-wrapper');
    var formData = $form.serializeObject();
    showElementOutOfMany($loading_wrapper, $all_wrappers);
    $.ajax({
      url: 'be_well_informed/form_submission',
      method: 'POST',
      data: Object.keys(formData).reduce(checkValues, formData),
      success: function(be_well_response_json) {
        if (!be_well_response_json.error) {
          // hide the treatment section by default
          $('treatment-header, .treatment-content').addClass('hide')

          // Use two separate instances of Datatable configs for both datatables
          default_datatable_result_details_options.data = be_well_response_json.data.result_summary;
          default_datatable_result_summary_options.data = be_well_response_json.data.result_summary;

          $('#be-well-informed-results-table').DataTable(default_datatable_result_summary_options);

          $('#be-well-informed-result-details-table').DataTable(default_datatable_result_details_options);
          showElementOutOfMany($results_wrapper, $all_wrappers);

          // Loop through and add trs to the summary table. Datatable does not support colspan
          var result;
          var row_index = 1;
          $.each(be_well_response_json.data.result_details, function(index, detail_obj) {
            result = detail_obj.result;
            if (detail_obj.data_array.length > 0) {
              for (var i = 0; i < detail_obj.data_array.length; i++) {
                if (detail_obj.data_array[i] !== '') {
                  $('#be-well-informed-result-details-table')
                    .find('tr:eq(' + (row_index + index) + ')')
                    .after('<tr><td class="bwi-detail-td ' + result + '" colspan="5">' + detail_obj.data_array[i] + '</td></tr>');
                  row_index++;
                }
              }
            }
          });

          // 1) if we have values in the be_well_response_json.TreatmentSteps show the treatment steps section
          if(be_well_response_json.TreatmentSteps && be_well_response_json.TreatmentSteps.length > 0){
            $('treatment-header, .treatment-content').removeClass('hide')

            // update title to include all contaminats that have TreatmentMessages != ''
            var title = ''
            for(contaminate in be_well_response_json.ResultEvaluations){
              if(be_well_response_json.ResultEvaluations[contaminate].TreatmentMessages){

              }
            }
            // update the steps labels to properly show the needed steps
            // update visibility of steps and their instructions
          }


        }
        else {
          showElementOutOfMany($results_wrapper, $all_wrappers);
        }
        resizeModal();
      }
    });

  });

  /**
   * Close Listener on BWI Modal
   * -  Destroy Datatables
   * -  Cancel Pending Form submission
   */
  $('#be-well-informed-modal').on('dialogclose', function() {
    var $form_wrapper = $('#be-well-informed-form-wrapper');
    var $all_wrappers = $('.be-well-informed-modal-wrapper');

    $('#be-well-informed-results-table').DataTable().destroy();
    $('#be-well-informed-result-details-table').DataTable().destroy();
    showElementOutOfMany($form_wrapper, $all_wrappers);
    resizeModal()
  });

  $('#be-well-informed-modal').on('click', '.ui-accordion-header', function() {
    var $arrow = $(this).find('i');
    // Reset all other arrows to right (default)
    $('.ui-accordion-header').not($(this)).find('i').removeClass('fa-caret-down').addClass('fa-caret-right');
    if ($arrow.hasClass("fa-caret-right")) {
      $arrow.removeClass('fa-caret-right').addClass('fa-caret-down');
    } else {
      $arrow.removeClass('fa-caret-down').addClass('fa-caret-right');
    }
    resizeModal()
  });

})(jQuery);
