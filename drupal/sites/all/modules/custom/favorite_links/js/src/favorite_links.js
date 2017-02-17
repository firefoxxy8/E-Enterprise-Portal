// @see http://stackoverflow.com/a/14582229
// Only allows urls starting with https// or http://, then validates structure used
function isURL(str) {
    if (typeof str == "undefined") {
        return false;
    } else {
        var pattern = new RegExp('^(https?:\\/\\/)' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return pattern.test(str);
    }
}

(function ($) {

    var focus_link_id;
    var findLink;
    var findQtip;

    function reloadView() {
        $('#reload_favorite_links').trigger('click');
    }

    function load_links(async_setting) {
        $('#load_more').hide();
        $.ajax({
            url: Drupal.settings.basePath + 'load_links',
            method: 'GET',
            async: async_setting,
            data: {json: true},
            success: function (data) {
                var data = $.parseJSON(data);
                if (data.url_data != 'false') {
                    favorite_urls = data.urls;
                    favorite_url_mapping = data.url_mapping;
                    id_label_mapping = data.label_mapping;
                }
            }
        });
    }

    function processDataTablePageAnchors() {
        $('.dataTables_wrapper .resource-title a').each(function () {
            var linkControl = new FavoriteLink($(this));
            linkControl.setUrl($(this).attr('href'));
            linkControl.setTitle($(this).text());
            linkControl.qtip_postion = {
                my: 'left center',  // Position my top left...
                at: 'right center', // at the bottom right of...
                target: $(this) // my target
            };
            linkControl.addFavoriteButton();
        });
    }

    function processPageAnchors() {
        var ignore_panels = ['.pane-views-cdx-facility-management-block', '.pane-views-progress-tracker-block-1', '.pane-views-to-do-block-1'];
        // process img links
        $('.panel-pane:not(' + ignore_panels.join(',') + ') img').each(function () {
            if (isURL($(this).closest('a').attr('href'))
                && !$(this).closest('a').hasClass('about-widget')
                && !$(this).closest('a').hasClass('processed-favorite')) {
                var linkControl = new FavoriteLink($(this));
                linkControl.addFavoriteButton();
            }
        });
        // process anchor tags
        $('.panel-pane:not(' + ignore_panels.join(',') + ') a:not(.favorites-ignore, .menu-link, .skip-link, .paginate_button, [href^=mailto], [href^=javascript], .remove-link, .about-widget)').each(function () {
            if (
                $(this).text().length > 0
                && isURL($(this).closest('a').attr('href'))
                && !$(this).hasClass('about-widget')
                && !$(this).hasClass('favorite-law')
                && !$(this).hasClass('processed-favorite')
            ) {
                var linkControl = new FavoriteLink($(this));
                linkControl.setUrl($(this).attr('href'));
                linkControl.setTitle($(this).text());
                linkControl.qtip_postion = {
                    my: 'left center',  // Position my top left...
                    at: 'right center', // at the bottom right of...
                    target: $(this) // my target
                };
                linkControl.addFavoriteButton();
            }
        });
    }

// Show tooltip on <a> element, but only when
// focused and Shift key pressed.
    function triggerQtip(findLink, hideQtip) {
        try {
            if (hideQtip == true) {
                $(findLink).trigger('mouseover');
                findQtip = '#' + $(findLink).attr('aria-describedby');
                return findQtip;
            }
            else {
                $(findLink).trigger('mouseout');
            }
        }
        catch (err) {
            //console.log("Error on triggerQtip: " + err);
        }
    }

    function refocusLink(focus_link_id) {
        if (focus_link_id != "") {
            $('#favorite_links-ajax-wrapper').find(focus_link_id).focus();
        }
        else {
            $('#favorite_links-ajax-wrapper').find('.favorites-ignore').focus();
        }
    }

    function processFavoriteLink(button, action, unparsed_url, label) {
        var id;
        var old_link = false;
        var url;
        if ($.isNumeric(unparsed_url)) {
            id = unparsed_url;
            old_link = true;
            url = 'id';
        }
        else {
            url = unparsed_url; //encodeURIComponent(unparsed_url);
        }
        $.ajax({
            url: Drupal.settings.basePath + 'process_favorite_link',
            type: 'POST',
            async: false,
            data: {url: url, action: action, title: label, id: id},
            success: function (data) {
                button.unbind("click");
                if (action == 'add') {
                    reloadView();
                    load_links(false);
                    button.removeClass('add_link new_link old_link filled empty')
                        .attr('title', 'Remove favorite')
                        .addClass('remove_link old_link filled')
                        .attr('id', favorite_url_mapping[unparsed_url] + '__favorite_link');
                    button.next('.sr-only').text('Favorited. Press Ctrl + D to unfavorite');
                }
                else {
                    if (button.hasClass('in-widget')) {
                        unparsed_url = $(button).closest('tr').find('a').attr('href');
                        var row = $(button).closest('tr');
                        var row_num = row[0].rowIndex - 1;
                        //Count # rows in table, subtract for first row that's a holder
                        var row_total = $('#favorite_links-ajax-wrapper').find('table').find('tbody').children('tr').length - 1;

                        //If current row isn't last row, focus next row favorite
                        if (row_num < row_total) {
                            var next_link = row.next().find('a');
                            focus_link_id = "#" + next_link[0].id;
                        }
                        //If no next rows, focus previous row favorite
                        else if (row_num == row_total && row_total != 1) {
                            var previous_link = row.prev().find('a');
                            focus_link_id = (row_num == 0 && row_total == 0) ? "#favorite_links-ajax-wrapper" : "#" + previous_link[0].id;
                        }
                        //If only row left, focus Edit Profile link
                        else {
                            focus_link_id = "";
                        }
                        $(button).closest('tr').remove();
                    }
                    else {
                        var widget_button = $('*[id="' + id + '__favorite_link"].in-widget')
                        unparsed_url = $(widget_button).closest('tr').find('.favorites-link').attr('href');
                    }

                    button = $('*[id="' + id + '__favorite_link"]');
                    label = id_label_mapping[id];
                    reloadView();
                    // button.attr('id', encodeURIComponent(unparsed_url) + '__' + label);
                    button.attr('id', unparsed_url + '__' + label);

                    button.removeClass('remove_link new_link old_link filled empty');
                    button.attr('title', 'Add favorite');
                    button.addClass('add_link new_link empty ');
                    button.next('.sr-only').text('Press Ctrl + D to favorite this link.');
                }
                refocusLink(focus_link_id);
            }
        });
    }

    $(document).ready(function () {

        // Only run if favorite links module is active
        $(document.body).on('click', '.old_link', function () {
            var string_array = $(this).attr('id').split('__');
            var id = string_array[0];
            var action;
            var $this = $(this);
            if ($this.hasClass('add_link')) {
                action = 'add';
            }
            else {
                action = 'remove';
            }
            processFavoriteLink($this, action, id, '');
            if ($this.hasClass('.in-widget')) {
                load_links(true);
            }
        });

        $(document.body).on('click', '.new_link', function () {
            var string_array = $(this).attr('id').split('__');
            var url = string_array[0];
            var label = string_array[1];
            var action;
            var $this = $(this);
            if ($this.hasClass('add_link')) {
                action = 'add';
            }
            else {
                action = 'remove';
            }
            processFavoriteLink($this, action, url, label);
            if ($this.hasClass('.in-widget')) {
                load_links(true);
            }
        });

        $(document).ajaxSuccess(function (event, xhr, settings) {
            if (settings.url == Drupal.settings.basePath + 'favorite_sites-ajax/ajax') {
                refocusLink(focus_link_id);
            }
            else {
                processPageAnchors();
            }
        });

        $(document).on("ee:new_links_to_process", function () {
            processPageAnchors();
        });

        $('#local-resources-tabs .pager__link').waitUntilExists(function () {
            $('#local-resources-tabs .pager__link').on('click', function () {
                var delay = 500;
                setTimeout(function () {
                    processDataTablePageAnchors();
                }, delay);
            });
        });

        // If a link that's favorite-able is focused, watch for key presses
        // Shift (16) triggers qTip
        // Escape (27) or blur hide qTip
        // Ctrl + D (68) toggles the favorite and shows the qTip
        $("a").not(".menu-link", ".ctools-use-modal", ".skip-link", ".favorites-ignore", ".paginate_button", ".about-widget", "[href^=mailto]", "[href^=javascript]", ".remove-link", ".favorite-law").focus(function () {
            $("a").not(".menu-link", ".ctools-use-modal", ".skip-link", ".favorites-ignore", ".paginate_button", ".about-widget", "[href^=mailto]", "[href^=javascript]", ".remove-link", ".favorite-law").keydown(function (event) {
                try {
                    if (event.which === 16) {
                        if (event.which === 9) {
                            event.stopImmediatePropagation();
                            // Ignore shift + tab (9)
                            return false;
                        }
                        else {
                            var linkQtip = $(this).attr('data-hasqtip');
                            var imgQtip = $(this).find('img').attr('data-hasqtip');
                            if (linkQtip > 0) {
                                event.stopImmediatePropagation();
                                findLink = $(this);
                                triggerQtip(findLink, true);
                            }
                            else if (imgQtip > 0) {
                                event.stopImmediatePropagation();
                                findLink = $(this).find('img');
                                triggerQtip(findLink, true);
                            }
                            return false;
                        }
                    }
                    else if (event.which === 68 && event.ctrlKey) {
                        event.stopImmediatePropagation();
                        var linkQtip = $(this).attr('data-hasqtip');
                        if (linkQtip > 0) {
                            findLink = $(this);
                        }
                        else {
                            findLink = $(this).find('img');
                        }
                        triggerQtip(findLink, true);
                        var qTipSpan = findQtip + ' .favorite_hover';
                        $(qTipSpan).trigger('click');
                        triggerQtip(findLink, true);
                        $(this).unbind("click");
                        return false;
                    }
                    else {
                    }
                }
                catch (e) {
                }
            }); //End keyup function
        }); //End focus function
    });
})(jQuery);
