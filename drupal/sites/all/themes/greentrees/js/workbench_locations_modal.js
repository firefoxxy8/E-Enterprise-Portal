(function ($) {

$(document).ready(function(){
	// Instantiate previous with primary location
	var previous_selection = $('#location-select').val();
	$('input[type=radio]#' + previous_selection).attr('checked', true);
		
	if ($('#locations-modal').length > 0) {
		$('#dialog-all-locations').dialog({
			modal: true,
			autoOpen: false,
			width: 'auto',
			height: 'auto',
			dialogClass: "locations-modal",
			buttons: [
				{
					text: 'View',
					class: ' ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only',
					click: function() {
						var selection_array = $(':radio[name=location-radio]:checked').val().split('|');
						var selection_value = selection_array[0];
						var selection_name = selection_array[1];
						locationSelect(selection_value, selection_name);
						$('#dialog-all-locations').dialog('close');
						// $(':radio[name=location-radio]:checked').attr('checked', false);
					}
				},
				{	text : "Cancel",
					class: ' ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only',
					click: function() {
						$('#location-select').val(previous_selection);
						$('#dialog-all-locations').dialog('close');
					}	
				}
			]
		});
		$('#locations-modal').click(function() {
			$('#dialog-all-locations').dialog('open');
		})
	}
	
	function locationSelect(selection_value, selection_name) {
		// If selected from modal and exists in select box, just change value
		if ($('#location-select option[value=' + selection_value + ']').length > 0) {
			$('#location-select').val(selection_value);
			$('#location-select').trigger('change');
		}
		else { // add value to select, remove last select value
			$("#location-select").prepend("<option value='" + selection_value + "'>" + selection_name + "</option>");
			$('#location-select option:nth-child(10)').remove();
			$('#location-select').val(selection_value);
			$('#location-select').trigger('change');
		}
	}
	
	// Update Session
	$('body').on('change', '#location-select', function(e) {
		if ($(this).val() == 'view_more') {
			e.preventDefault();
			$('#locations-modal').trigger('click');
		}
		else {
			previous_selection = $(this).val();
			$('input[type=radio]#' + previous_selection).attr('checked', true); // Update modal with selected values
			$.post("/default_location_zip", {zip: $(this).val(), name: $(this).find('option:selected').text()});
		}
	});


	$(window).resize(function(){
	  $( "#dialog-all-locations" ).dialog( "option", "position", { my: "center", at: "center", of: window } );
	});
	
	});

})(jQuery);