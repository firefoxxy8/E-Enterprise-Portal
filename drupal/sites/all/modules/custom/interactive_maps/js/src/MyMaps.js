if (typeof createWayPoint == 'function') {
  createWayPoint('interactive-maps-actions', iMapsLoad);
}
else {
  iMapsLoad();
}

function iMapsLoad() {
  (function ($) {
    $("#myMapsFiltering").tabs();
    $('#myMapsFiltering').find('.ui-corner-top').on('click', function (ev) {
      $(this).focus();
    });

    $(document).on("eportal-grid-engine:element-resize", function (e, grid, $elementToResize) {
      if ($elementToResize.find('#interactive-maps-actions').length) {
        resizeThumbs();
      }
    });


    var mapsets = Drupal.settings.interactive_maps.mapsets,
      filterType = "mapsAll",
      countThese = "all",
      activeTab = "myMapsFilterAll",
    // Put agency-specific filtering tags here
      noaatag = 'tags:"oceans"',
      countScrolls = 0,
      focusThumb = 0,
      numItemsVisible = 0,
      numThumbs = 0,
      stopAtScrolls = 0,
      totThumbnails = 0,
      reloadDebounce = debounce(function () {
        $('.jcarousel').jcarousel('reload').jcarousel('scroll', 0);
      }, 300);

    //If user is a state_admin, add the "Add agency maps" link
    if (Drupal.settings.userrole === 'state_admin') {
      var galleryLinkTarget = $('#numThumbnails').find('.widget-note');
      galleryLinkTarget.append('<a href="/agency-map-list" id="manage-maps" class="favorites-ignore last">Manage agency map collections</a>');
    }
    var $jcarousel = $('.jcarousel');
    //Opening UL only created in init of gallery
    var $ul = $('<ul>', {'class': 'thumb'});
    $jcarousel.html($ul);

    //Query all AGOL endpoints given from mapsets JSON
    query_AGOL(mapsets);
    $jcarousel.jcarousel();
    var $jcarouselNext = $('.jcarousel-control-next');
    var $jcarouselPrev = $('.jcarousel-control-prev');

    /********************jcarousel event listeners***********************/
    $jcarousel
      .on('jcarousel:visiblein', 'li', function (event, carousel) {
        // if this has .load-thumbnail, then active
        if ($(this).hasClass('load-thumbnail')) {
          $(this).addClass('active');
          $(this).find(".ellipsis").dotdotdot({watch: "window"});
        }
      })
      .on('jcarousel:visibleout', 'li', function (event, carousel) {
        $(this).removeClass('active');
      })
      .on('jcarousel:animateend', function (event, carousel) {
        // Animation has settled, load the images
        $("img.lazy").lazyload();
      })
      .on('jcarousel:animate', function (event, carousel) {
        $('.load-thumbnail.active').find(".ellipsis").dotdotdot({watch: "window"});
      });

    $("#myMapsFiltering").on("tabsbeforeactivate", function (event, tab) {
      countScrolls = 0;
      activeTab = tab.newTab.attr('id');
      filterType = tab.newTab.find('a').attr('id');
      filterMyMapsGallery(filterType);
      $('.load-thumbnail.active').find(".ellipsis").dotdotdot({watch: "window"});
    });

    /*****************************functions******************************/
    function firstIsActive() {
      var firstActive = $jcarousel.jcarousel('first').index(),
        currentActive = $jcarousel.find('.load-thumbnail').eq(0).index();
      if (firstActive === currentActive) {
        $jcarouselPrev.addClass('inactive');
      }
    }

    // Helper function for updating offset values as the objects resize
    function updateJCarouselButton($button, offset) {
      $button
      // cleanup event listeners
        .unbind('jcarouselcontrol:active').unbind('jcarouselcontrol:inactive')
      // Apply new events
        .on('jcarouselcontrol:active', function () {
          $(this).removeClass('inactive');
        })
        .on('jcarouselcontrol:inactive', function () {
          $(this).addClass('inactive');
        })
        .jcarouselControl({
          target: offset
        });
    }


    function resizeThumbs() {
      if ($jcarousel) {
        var width = 0;
        var $jcarouselThumbs = $jcarousel.find('li');
        //Set max number of items displayed to be 5, with less
        //visible based on current browser width
        var innerWidth = $jcarousel.innerWidth();
        if (innerWidth >= 1100) {
          width = (innerWidth / 5) - 4;
          numThumbs = 5;
        } else if (innerWidth >= 850) {
          width = (innerWidth / 4) - 4;
          numThumbs = 4;
        } else if (innerWidth >= 600) {
          width = (innerWidth / 3) - 4;
          numThumbs = 3;
        } else if (innerWidth >= 350) {
          width = (innerWidth / 2) - 4;
          numThumbs = 2;
        }
        if (width) {
          $jcarouselThumbs.css('width', Math.ceil(width) + 'px');
        }
        $jcarousel.find('.load-thumbnail').removeClass('active').slice(0, numThumbs).addClass('active');

        // Update our buttons with the proper targets
        updateJCarouselButton($jcarouselPrev, '-=' + numThumbs);
        updateJCarouselButton($jcarouselNext, '+=' + numThumbs);
        reloadDebounce();
      }
    }

    function filterMyMapsGallery(filterType) {
      var listItems = $('.jcarousel ul li');
      listItems.removeClass('active hide-thumbnail').addClass('load-thumbnail');
      listItems.each(function (li) {
        //reset gallery to show all items before applying filter
        $(this).show();
        var itemTags = $(this).find('a').data('tags').toLowerCase();
        // When switching tabs, need to explicitly set thumbnails to display none and/or CSS class to hide them
        // Then add load-thumbnail to the remaining items
        // If faster to use else versus listItems.filter, then can adjust
        switch (filterType) {
          // NOTE:  All maps includes more than just Air, Water, and Land where tags don't match our queries
          case 'mapsAll':
            listItems.filter(':visible').addClass('load-thumbnail');
            var countThese = 'all';
            //nothing to do because all items are showing
            break;
          case 'mapsAir':
            var countThese = 'air';
            if ((itemTags.indexOf('air') === -1 && itemTags.indexOf('oaqps') === -1) || (itemTags.indexOf('impair') > -1)) {
              $(this).removeClass('load-thumbnail').addClass('hide-thumbnail');
            }
            break;
          case 'mapsWater':
            var countThese = 'water';
            if (itemTags.indexOf('water') === -1 && itemTags.indexOf('ocean') === -1) {
              $(this).removeClass('load-thumbnail').addClass('hide-thumbnail');
            }
            break;
          case 'mapsLand':
            var countThese = 'land';
            if (itemTags.indexOf('land') === -1 && itemTags.indexOf('rcra') === -1) {
              $(this).removeClass('load-thumbnail').addClass('hide-thumbnail');
            }
            break;
        }
      });
      updateTotalNumberOfMapsShowing(countThese);
      firstIsActive();
      resizeThumbs();
    }

    //query AGOL/GPO REST API for publicly shared web mapping applications
    function query_AGOL(mapsets) {
      $.each(mapsets, function (index, mapset) {
        var agency_specific_tags = "";
        mapset.id = mapset.url.match(/\/\/(.*).maps.arcgis.com/)[1];
        if (mapset.id === "noaa") {
          agency_specific_tags = noaatag;
        }
        $.ajax({
          type: 'GET',
          url: mapset.url + '/sharing/rest/search',
          //later to implement tag search or similar for
          //filtering based on dynamic criteria
          data: {
            q: 'orgid:' + mapset.orgid + ' ' + agency_specific_tags + ' -type:"Code Attachment" -type:"Featured Items" -type:"Symbol Set" -type:"Color Set" -type:"Windows Viewer Add In" -type:"Windows Viewer Configuration" (type:"Web Mapping Application" OR type:"Mobile Application")',
            f: 'json',
            num: '100'
          },
          dataType: 'JSON',
          mapset: mapset,
          success: function (resultJson, status, xhr) {
            setupMyMapsGalleryWithThumbs(resultJson, this.mapset);
          }
        }).fail(function (xhr, status) {
          if (status === "error") {
            return "Sorry but there was an error: " + xhr.status + " " + xhr.statusText;
          }
        });
      });
    }

    function build_map_items(data, mapset) {
      //Added filter for user 'jquacken_EPA' because all of that user's WMAs are not maps - they are how-to guides
      //Check for hyperlinks to most likely apps that are internal only (non default ports of 80, 443)
      var hyperlinkValid;
      if (this.url.indexOf('http') > -1 && this.url !== null) {
        var linkArr = (this.url.split("://"));
        //checks if hyperlink contains port designator
        if ((linkArr[1].indexOf(':') > -1)) {
          hyperlinkValid = false;
        } else {
          hyperlinkValid = true;
        }
      } else {
        hyperlinkValid = false;
      }

      if (this.thumbnail != 'thumbnail/ago_downloaded.png' && this.thumbnail !== null && this.description !== null && this.owner != 'jquacken_EPA' && hyperlinkValid === true) {
        var itemTags = this.tags.toString();
        thumbnailNum = $('.load-thumbnail').length + 1;
        //numGoodResults += 1;
        var thumbnailURL = mapset.url + "/sharing/rest/content/items/" + this.id + "/info/" + this.thumbnail;
        //Descriptions can contain or not contain HTML markup, to let JQuery's .text() work, we just add the p tags to all descriptions
        //and all tags are remove with .text(), including descriptions which has no HTML markup which would normally throw an error
        var desc = "<p>" + this.description + "</p>";
        //check if hyperlink is hosted on maps.arcgis.com, if it is, switch URL to HTTPS
        var origURL = this.url;
        var hyperlinkURL;
        if ((origURL.indexOf('http://') > -1) && (origURL.indexOf('maps.arcgis.com') > -1)) {
          //replace with HTTPS since we know maps.arcgis.com support SSL/TLS
          hyperlinkURL = origURL.replace('http://', 'https://');
        } else {
          hyperlinkURL = origURL;
        }

        var $li = $('<li class="load-thumbnail">').append(
          $('<div>', {
            'class': 'thumbitem-border'
          }).append(
            $('<a>', {
              'class': 'thumbhyperlink',
              'data-accessinfo': mapset.alias,
              'data-contactemail': mapset.contactemail,
              'data-tags': itemTags,
              'href': hyperlinkURL,
              'title': this.title,
              'target': '_blank'
            }).append(
              $('<img>', {
                'class': 'thumbnailImg lazy',
                'data-original': thumbnailURL, // Use temporary source as placeholder so all thumbs are not loaded at once.
                'alt': this.title,
                'title': this.title,
                'aria-describedby': 'thumbnail-desc-' + mapset.id + '-' + thumbnailNum + ' ' + 'thumbnail-source-' + mapset.id + '-' + thumbnailNum + ' ' + 'thumbnail-contact-' + thumbnailNum
              })
            ),
            $('<p>', {
              'data-toggle': 'tooltip',
              'class': 'ee-bootstrap-tooltip mapAppTitle ellipsis',
              'title': this.title,
              'html': this.title
            }),
            //the description element can contain HTML markup so use .text to un-format the string
            //Omaha has no descriptions in their publicly shared WMAs
            $('<p>', {
              'data-toggle': 'tooltip',
              'class': 'ee-bootstrap-tooltip mapAppDesc ellipsis',
              'id': 'thumbnail-desc-' + mapset.id + '-' + thumbnailNum,
              'title': truncate($(desc).text(), 1000),
              'html': $(desc).text(),
              'tabindex': '0'
            }),
            $('<p>', {
              'data-toggle': 'tooltip',
              'class': 'ee-bootstrap-tooltip mapAppSource ellipsis',
              id: 'thumbnail-source-' + mapset.id + '-' + thumbnailNum,
              'title': mapset.alias,
              'html': mapset.alias
            }),
            $('<p>', {
              'data-toggle': 'tooltip',
              'class': 'mapAppContact',
              id: 'thumbnail-contact-' + mapset.id + '-' + thumbnailNum,
              'title': mapset.contactemail,
              'html': '<a href="mailto:' + mapset.contactemail + '">' + mapset.contactemail + '</a>'
            })
          )
        );
        return $li;
      }
      return false;
    }

    //create the MyMaps thumbnail gallery from the AGOL API query results
    function setupMyMapsGalleryWithThumbs(data, mapset) {
      var $lis = [];
      var $tempLi;
      for (var i = 0; i < data.results.length; i++) {
        $tempLi = build_map_items.apply(data.results[i], [data, mapset]);
        if ($tempLi) {
          $lis.push($tempLi);
        }
      }
      $('.jcarousel ul').append($lis);
      var countThese = 'all';
      filterMyMapsGallery(countThese);
      // Initial image load
      $("img.lazy").lazyload();
    }

    function updateTotalNumberOfMapsShowing(countThese) {
      var carouselToCount = '#' + countThese + '-maps-carousel .thumb > li.load-thumbnail';

      numItemsVisible = $(carouselToCount).length;
      $("#map-count").html(numItemsVisible.toString());
    }

    function truncate(text, maxLength) {
      if (text.length <= maxLength) {
        return text;
      }
      var truncated = text.substr(0, maxLength);
      var spaceIndex = truncated.lastIndexOf(' ');
      if (spaceIndex === -1) {
        return truncated + '...';
      }
      return truncated.substring(0, spaceIndex) + '...';
    }

    function debounce(func, wait, immediate) {
      var timeout;
      return function () {
        var context = this, args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };

    //better keyboard accessibility, allow keyboard left and right arrows to navigate gallery
    var $jcarouselThumbnail = $jcarousel.find('.load-thumbnail.active a');
    $jcarouselThumbnail.on('focus', function () {
      $jcarouselThumbnail.on('keyup', function (ev) {
        ev.stopImmediatePropagation();
        var key = ev.which || ev.keyChar || ev.keyCode;
        if (key === 27) {
          $jcarousel.focus();
        } else if (key === 37) {
          // If count scrolls is 0, do not scroll left/previous, do not subtract
          // If count scrolls is > 0, then scroll left/previous
          if (!$jcarouselPrev.hasClass('inactive')) {
            $jcarouselPrev.trigger('click');
          }
          $jcarouselThumbnail.eq(0).focus();
        } else if (key === 39) {
          // If count scrolls is less than the max # of scrolls, scroll right/next
          // If count scrolls is > 0, then scroll to previous thumbnails
          if (!$jcarouselNext.hasClass('inactive')) {
            $jcarouselNext.trigger('click');
          }
          $jcarouselThumbnail.eq(0).focus();
        }
      });
    });

    $jcarousel.on('focus', function () {
      $jcarousel.on('keyup', function (e) {
        e.stopImmediatePropagation();
        var key = e.which || e.keyChar || e.keyCode;
        stopAtScrolls = numItemsVisible - 1;
        if (key === 37) {
          // If count scrolls is 0, do not scroll left/previous, do not subtract
          // If count scrolls is > 0, then scroll left/previous
          if (!$jcarouselPrev.hasClass('inactive')) {
            $jcarouselPrev.trigger('click');
            $jcarousel.focus();
          }
        } else if (key === 39) {
          // If count scrolls is less than the max # of scrolls, scroll right/next
          // If count scrolls is > 0, then scroll to previous thumbnails
          if (!$jcarouselNext.hasClass('inactive')) {
            $jcarouselNext.trigger('click');
            $jcarousel.focus();
          }
        } else if (key === 27) {
          var focusTab = '#' + activeTab;
          $(focusTab).focus();
        }
      });
    });

  })(jQuery);
}