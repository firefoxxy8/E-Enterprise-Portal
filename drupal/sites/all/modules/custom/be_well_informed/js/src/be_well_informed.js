// Polyfill for Array.from()
// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method
      // of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}

if (!String.prototype.codePointAt) {
  String.prototype.codePointAt = function (pos) {
    pos = isNaN(pos) ? 0 : pos;
    var str = String(this),
      code = str.charCodeAt(pos),
      next = str.charCodeAt(pos + 1);
    // If a surrogate pair
    if (0xD800 <= code && code <= 0xDBFF && 0xDC00 <= next && next <= 0xDFFF) {
      return ((code - 0xD800) * 0x400) + (next - 0xDC00) + 0x10000;
    }
    return code;
  };
}

function html_encode(string) {
  var ret_val = '';
  for (var i = 0; i < string.length; i++) {
    if (string.codePointAt(i) > 127) {
      ret_val += '&#' + string.codePointAt(i) + ';';
    } else {
      ret_val += string.charAt(i);
    }
  }
  return ret_val;
}

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

toggleSection = function() {
  var $this = $(this);
  var $arrow = $(this).find('i');

  $this.toggleClass('open close')
  // Reset all other arrows to right (default)
  /*$('.ui-accordion-header').not($(this)).find('i').removeClass('fa-caret-down').addClass('fa-caret-right');
   if ($arrow.hasClass("fa-caret-right")) {
   $arrow.removeClass('fa-caret-right').addClass('fa-caret-down');
   } else {
   $arrow.removeClass('fa-caret-down').addClass('fa-caret-right');
   }*/
  resizeModal()
}

function resizeModal() {
  jQuery('#be-well-informed-modal-state-form').dialog({
    position: {'my': 'center', 'at': 'center'}
  });
  $state_form = jQuery('.be-well-informed-modal-state-form')
  if ($state_form.length && $state_form.css('top').replace('px', '') < 1) {
    jQuery('.be-well-informed-modal-state-form').css('top', 0)
  }
}

// Check Radio Mapping for checked radio values.
function checkRadioInputs(radioMapping) {
  var $ = jQuery;
  var $radioInput;
  $.each(radioMapping, function(symbol, radioName) {
    $radioInput = $("input[name='" + radioName + "']:checked");
    if ($radioInput.length > 0) {
      radioMapping[symbol] = $radioInput.val();
    } else {
      delete radioMapping[symbol];
    }
  });
  return radioMapping;
}

// Handle Serialized Form data for Be Well Informed consumption
function formatFormData(formData, convertNulls) {
  // Check for Ecoli/Total Coliform radio buttons
  // Map input Names to Unit names so we can set the presence attribute in the form
  var presenceRadioInputs = {Ecoli: 'Ecoli_G', Bac: 'Bac_G'}
  presenceRadioInputs = checkRadioInputs(presenceRadioInputs);

  Object.keys(formData).reduce(function(previous, current, cIndex, keys) {
    var previousKeys = [];
    if (typeof previous[keys[cIndex]] == 'object') {
      previousKeys = Object.keys(previous[keys[cIndex]]);
    }

    // Standardize all values to Type Ints. If the value is NULL or blank, send -9999
    if ((previousKeys.indexOf('Value') > -1) ) {
      // Check if presence radio has been inputed and set balue
      if (previous[keys[cIndex]].Symbol in presenceRadioInputs) {
        previous[keys[cIndex]].Presence = presenceRadioInputs[previous[keys[cIndex]].Symbol];
      }
      if (convertNulls) {
        if (!isNaN(previous[keys[cIndex]].Value) && previous[keys[cIndex]].Value != "") {
          previous[keys[cIndex]].Value = parseFloat(previous[keys[cIndex]].Value);
        } else {
          previous[keys[cIndex]].Value = -9999;
        }
      } else {
        if (previous[keys[cIndex]].Symbol in presenceRadioInputs && (previous[keys[cIndex]].Presence == "present" || previous[keys[cIndex]].Presence == "absent")) {
          if (previous[keys[cIndex]].Value == "") {
            previous[keys[cIndex]].Value = -9999;
          }
        }
        else if ((previousKeys.indexOf('Value') > -1 && previous[keys[cIndex]].Value == "")) {
          delete previous[keys[cIndex]];
        }
      }
    }
    else if (['object'].indexOf(typeof previous[keys[cIndex]]) > -1) {
      previous[keys[cIndex]] = previousKeys.reduce(arguments.callee, previous[keys[cIndex]])
      if (Object.keys(previous[keys[cIndex]]).length == 0) {
        delete previous[keys[cIndex]];
      }
    }
    return previous
  }, formData);
  return formData;
}

var sampleData = function() {};

/**
 * Clear form inputs and hide warning messages
 */
function resetBWIForm() {
  var $ = jQuery;
  var $form = $('#water_analysis_results_form');
  $form.parsley().reset();
  $form.find('input[type=number]').val('');
  $form.find('input[type=radio]').prop('checked', false);
  $form.find('select option').prop('selected', false);
  $('.bs-callout-info').toggleClass('hidden', true);
  $('.bs-callout-warning').toggleClass('hidden', true);
}

function bwi_log() {
  if(Drupal.settings.be_well_informed.debug_mode) {
    console.log.apply(this, Array.prototype.concat(['be_well_informed/form_submission'], Array.from(arguments)));
  }
}

(function($) {
  var sampleSetIndex = 0;
  // Flag for converting Null or blank inputs to -9999
  var convertNulls = false;
  var cityName;
  sampleData = function(sample) {
    // lets us cycle through different sets of test data
    if (!sample) {
      // different handy test cases
      sampleSet = [
        {"CityName":"Anonymous","RoutineContaminants":{"As":{"Symbol":"As","Name":"Arsenic","Value":0.3,"Unit":"mg/L"},"Cl":{"Symbol":"Cl","Name":"Chloride","Value":260,"Unit":"mg/L"},"Cu":{"Symbol":"Cu","Name":"Copper","Value":-9999,"Unit":"mg/L"},"CuSt":{"Symbol":"CuSt","Name":"Copper, Stagnant","Value":-9999,"Unit":"mg/L"},"Fl":{"Symbol":"Fl","Name":"Fluoride","Value":-9999,"Unit":"mg/L"},"Har":{"Symbol":"Har","Name":"Hardness as CaCO3","Value":-9999,"Unit":"mg/L"},"Fe":{"Symbol":"Fe","Name":"Iron","Value":0.05,"Unit":"mg/L"},"Pb":{"Symbol":"Pb","Name":"Lead","Value":-9999,"Unit":"mg/L"},"PbSt":{"Symbol":"PbSt","Name":"Lead, Stagnant","Value":-9999,"Unit":"mg/L"},"Mn":{"Symbol":"Mn","Name":"Manganese","Value":0.03,"Unit":"mg/L"},"NO3":{"Symbol":"NO3","Name":"Nitrate-N","Value":-9999,"Unit":"mg/L"},"NO2":{"Symbol":"NO2","Name":"Nitrite-N","Value":-9999,"Unit":"mg/L"},"pH":{"Symbol":"pH","Name":"pH","Value":-9999,"Unit":"units"},"Na":{"Symbol":"Na","Name":"Sodium","Value":-9999,"Unit":"mg/L"}},"BacterialContaminants":{"Bac":{"Symbol":"Bac","Name":"Total Coliform","Value":-9999,"Unit":"CFU/100 mL"},"Ecoli":{"Symbol":"Ecoli","Name":"E. Coli","Value":-9999,"Unit":"CFU/100 mL"}},"RadionuclideContaminants":{"Rn":{"Symbol":"Rn","Name":"Radon","Value":-9999,"Unit":"pCi/L"},"Ur":{"Symbol":"Ur","Name":"Uranium","Value":-9999,"Unit":"mg/L"},"AGA":{"Symbol":"AGA","Name":"Gross Alpha","Value":-9999,"Unit":"pCi/L"}},"InteractivePromptResponses":{"0":{"InteractionIdentifier":"Cl_True","Symbol":"Cl","Interaction":"true"}}},
        {"CityName":"Anonymous","RoutineContaminants":{"pH":{"Symbol":"pH","Name":"pH","Value":"6","Unit":"units"}, "Cu":{"Symbol":"Cu","Name":"Copper","Value":"0.3","Unit":"mg/L"}}},
        {"CityName":"Anonymous","RoutineContaminants":{"As":{"Symbol":"As","Name":"Arsenic","Value":"0.007","Unit":"mg/L"},"Har":{"Symbol":"Har","Name":"Hardness as CaCO3","Value":"100","Unit":"mg/L"},"Fe":{"Symbol":"Fe","Name":"Iron","Value":"0.5","Unit":"mg/L"},"Mn":{"Symbol":"Mn","Name":"Manganese","Value":"0.01","Unit":"mg/L"}}},
        {"CityName":"Amherst","RoutineContaminants":{"As":{"Symbol":"As","Name":"Arsenic","Value":"1234","Unit":"mg/L"},"Cl":{"Symbol":"Cl","Name":"Chloride","Value":"1234","Unit":"mg/L"},"Cu":{"Symbol":"Cu","Name":"Copper","Value":"1234","Unit":"mg/L"},"CuSt":{"Symbol":"CuSt","Name":"Copper, Stagnant","Value":"1234","Unit":"mg/L"},"Fl":{"Symbol":"Fl","Name":"Fluoride","Value":"1234","Unit":"mg/L"},"Har":{"Symbol":"Har","Name":"Hardness as CaCO3","Value":"1234","Unit":"mg/L"},"Fe":{"Symbol":"Fe","Name":"Iron","Value":"1234","Unit":"mg/L"},"Pb":{"Symbol":"Pb","Name":"Lead","Value":"1234","Unit":"mg/L"},"PbSt":{"Symbol":"PbSt","Name":"Lead, Stagnant","Value":"1234","Unit":"mg/L"},"Mn":{"Symbol":"Mn","Name":"Manganese","Value":"1234","Unit":"mg/L"},"NO3":{"Symbol":"NO3","Name":"Nitrate-N","Value":"1234","Unit":"mg/L"},"NO2":{"Symbol":"NO2","Name":"Nitrite-N","Value":"1234","Unit":"mg/L"},"pH":{"Symbol":"pH","Name":"pH","Value":"6.1","Unit":"units"},"Na":{"Symbol":"Na","Name":"Sodium","Value":"1234","Unit":"mg/L"}},"BacterialContaminants":{"Bac":{"Symbol":"Bac","Name":"Total Coliform","Value":"1234","Unit":"CFU/100 mL"},"Ecoli":{"Symbol":"Ecoli","Name":"E. Coli","Value":"1234","Unit":"CFU/100 mL"}},"Bac_G":"rdb_Bac_True","Ecoli_G":"rdb_Ecoli_True","RadionuclideContaminants":{"Rn":{"Symbol":"Rn","Name":"Radon","Value":"4321","Unit":"pCi/L"},"Ur":{"Symbol":"Ur","Name":"Uranium","Value":"4321","Unit":"mg/L"},"AGA":{"Symbol":"AGA","Name":"Gross Alpha","Value":"4321","Unit":"pCi/L"}},"InteractivePromptResponses":{"0":{"InteractionIdentifier":"Cl_True","Symbol":"Cl"},"1":{"InteractionIdentifier":"Har_True","Symbol":"Har"}}},
        {"CityName":"Portsmouth","RoutineContaminants":{"As":{"Symbol":"As","Name":"Arsenic","Value":"45","Unit":"mg/L"},"Cl":{"Symbol":"Cl","Name":"Chloride","Value":"2","Unit":"mg/L"},"Cu":{"Symbol":"Cu","Name":"Copper","Value":"54","Unit":"mg/L"},"CuSt":{"Symbol":"CuSt","Name":"Copper, Stagnant","Value":"5","Unit":"mg/L"},"Fl":{"Symbol":"Fl","Name":"Fluoride","Value":"22","Unit":"mg/L"},"Har":{"Symbol":"Har","Name":"Hardness as CaCO3","Value":"1234","Unit":"mg/L"},"Fe":{"Symbol":"Fe","Name":"Iron","Value":"87","Unit":"mg/L"},"Pb":{"Symbol":"Pb","Name":"Lead","Value":"43","Unit":"mg/L"},"PbSt":{"Symbol":"PbSt","Name":"Lead, Stagnant","Value":"1234","Unit":"mg/L"},"Mn":{"Symbol":"Mn","Name":"Manganese","Value":"1234","Unit":"mg/L"},"NO3":{"Symbol":"NO3","Name":"Nitrate-N","Value":"1234","Unit":"mg/L"},"NO2":{"Symbol":"NO2","Name":"Nitrite-N","Value":"1234","Unit":"mg/L"},"pH":{"Symbol":"pH","Name":"pH","Value":"6.1","Unit":"units"},"Na":{"Symbol":"Na","Name":"Sodium","Value":"1234","Unit":"mg/L"}},"BacterialContaminants":{"Bac":{"Symbol":"Bac","Name":"Total Coliform","Value":"1234","Unit":"CFU/100 mL"},"Ecoli":{"Symbol":"Ecoli","Name":"E. Coli","Value":"1234","Unit":"CFU/100 mL"}},"Bac_G":"rdb_Bac_True","Ecoli_G":"rdb_Ecoli_True","RadionuclideContaminants":{"Rn":{"Symbol":"Rn","Name":"Radon","Value":"4321","Unit":"pCi/L"},"Ur":{"Symbol":"Ur","Name":"Uranium","Value":"4321","Unit":"mg/L"},"AGA":{"Symbol":"AGA","Name":"Gross Alpha","Value":"4321","Unit":"pCi/L"}},"InteractivePromptResponses":{"0":{"InteractionIdentifier":"Cl_True","Symbol":"Cl"},"1":{"InteractionIdentifier":"Har_True","Symbol":"Har"}}},
        {"CityName":"Anonymous","RoutineContaminants":{"As":{"Symbol":"As","Name":"Arsenic","Value":"1","Unit":"mg/L"}}},
        {"CityName":"Amherst","BacterialContaminants":{"Bac":{"Symbol":"Bac","Name":"Total Coliform","Value":"1","Unit":"CFU/100 mL"}}},
        {"CityName": "Anonymous", "Bac_G": "rdb_Bac_True"},
        {"CityName":"Salem","RoutineContaminants":{"As":{"Symbol":"As","Name":"Arsenic","Value":"11","Unit":"mg/L"},"Cl":{"Symbol":"Cl","Name":"Chloride","Value":"4","Unit":"mg/L"},"Cu":{"Symbol":"Cu","Name":"Copper","Value":"54","Unit":"mg/L"},"CuSt":{"Symbol":"CuSt","Name":"Copper, Stagnant","Value":"5","Unit":"mg/L"},"Har":{"Symbol":"Har","Name":"Hardness as CaCO3","Value":"27","Unit":"mg/L"},"Fe":{"Symbol":"Fe","Name":"Iron","Value":"87","Unit":"mg/L"},"Pb":{"Symbol":"Pb","Name":"Lead","Value":"43","Unit":"mg/L"},"PbSt":{"Symbol":"PbSt","Name":"Lead, Stagnant","Value":"54","Unit":"mg/L"},"Mn":{"Symbol":"Mn","Name":"Manganese","Value":"1234","Unit":"mg/L"},"pH":{"Symbol":"pH","Name":"pH","Value":"6.1","Unit":"units"},"Na":{"Symbol":"Na","Name":"Sodium","Value":"9","Unit":"mg/L"}},"BacterialContaminants":{"Bac":{"Symbol":"Bac","Name":"Total Coliform","Value":"5","Unit":"CFU/100 mL"},"Ecoli":{"Symbol":"Ecoli","Name":"E. Coli","Value":"3","Unit":"CFU/100 mL"}},"Bac_G":"rdb_Bac_True","Ecoli_G":"rdb_Ecoli_True","RadionuclideContaminants":{"Rn":{"Symbol":"Rn","Name":"Radon","Value":"56","Unit":"pCi/L"},"Ur":{"Symbol":"Ur","Name":"Uranium","Value":"12","Unit":"mg/L"},"AGA":{"Symbol":"AGA","Name":"Gross Alpha","Value":"98","Unit":"pCi/L"}},"InteractivePromptResponses":{"0":{"InteractionIdentifier":"Cl_True","Symbol":"Cl"},"1":{"InteractionIdentifier":"Har_True","Symbol":"Har"}}},
        {"CityName":"Anonymous","BacterialContaminants":{"Ecoli":{"Symbol":"Ecoli","Name":"E. Coli","Value":"0","Unit":"CFU/100 mL"}}},
        {"CityName":"Anonymous","RoutineContaminants":{"Cl":{"Symbol":"Cl","Name":"Chloride","Value":"250","Unit":"mg/L"}}},
        {"CityName":"Anonymous","RoutineContaminants":{"Har":{"Symbol":"Har","Name":"Hardness as CaCO3","Value":"150","Unit":"mg/L"}}},
        {"CityName":"Anonymous","RoutineContaminants":{"Fe":{"Symbol":"Fe","Name":"Iron","Value":".3","Unit":"mg/L"}}},
        {"CityName":"Anonymous","RoutineContaminants":{"Mn":{"Symbol":"Mn","Name":"Manganese","Value":".05","Unit":"mg/L"}}},
        {"CityName":"Anonymous","RoutineContaminants":{"pH":{"Symbol":"pH","Name":"pH","Value":"8","Unit":"units"}}},
        {"CityName":"Anonymous","RadionuclideContaminants":{"AGA":{"Symbol":"AGA","Name":"Gross Alpha","Value":"15","Unit":"pCi/L"}}}
      ]
      sample = sampleSet[sampleSetIndex]
      sampleSetIndex = ++sampleSetIndex % sampleSet.length
    }

    resetBWIForm();

    for (var cat in sample) {
      if (typeof sample[cat] == 'object') {
        for (var field in sample[cat]) {
          if (typeof sample[cat][field] == 'object') {
            for (var prop in sample[cat][field]) {
              if(prop == 'Unit') {
                var selector = '[name="' + cat + '[' + field + '][' + prop + ']"] option[value="'+sample[cat][field][prop]+'"]';
                $(selector).prop('selected', true);
              }
              else {
                var selector = '[name="' + cat + '[' + field + '][' + prop + ']"]';
                $(selector).val(sample[cat][field][prop]);
              }
            }
          }
        }
      }
      else {
        var selector = '[name="' + cat + '"]';
        $(selector + '[type=radio][value="' + sample[cat] + '"]').prop('checked', true)
        $('select' + selector).val(sample[cat])
      }
    }
  }

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
    $('#water_analysis_reset').removeClass('invisible')
    showElementOutOfMany($form_wrapper, $all_wrappers);
    $('#entry-tab').text('Entry');
    $('#edit-bwi-results').hide();
    resizeModal();
    $("html, body").animate({scrollTop: $('.pane-be-well-informed').offset().top}, 500);
  });

})(jQuery);
