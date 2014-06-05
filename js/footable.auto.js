/*!
 * FooTable - Fully responsive tables addon?
 * Version : 1.0
 * https://github.com/Shinrai/FooTable/blob/V2/js/footable.auto.js
 *
 * Requires jQuery - http://jquery.com/
 * Requires FooTable - http://fooplugins.com/plugins/footable-jquery/
 *
 * Copyright 2014 Nate Hyson
 * Released under the MIT license
 * You are free to use FooTable in commercial projects as long as this copyright header is left intact.
 *
 * Date: 28 May 2014
 */
function autoadjustfootableforthwidth3(element) {
    var r = false;
    jQuery(element).each(function(){
		var droplast = false;
		var reform = false;
		var position1 = false;
		var position2 = false;
		jQuery(this).find('thead tr th:visible').each(function(){
            position1 = jQuery(this).children('div').position();
			position2 = jQuery(this).children('span').position();
            if (position1 && position2) {
				if (position1.top != position2.top){
					droplast = true;
				}
			}
		});
		if (droplast){
			jQuery(this).find('thead tr th:visible').last().hide().attr('data-aafw','1').data('hide','all').attr('data-hide','all').prop('data-hide','all');
            r = true;
		}
	});
    return r;
}

function autoadjustfootables() {
    jQuery('table.footable').find('> thead tr th').removeAttr('data-hide').data('hide','').prop('data-hide',false).show();
    jQuery('table.footable').each(function(i){
        var count = jQuery(this).find('tbody tr').length;
        if (count <= 1){
            jQuery(this).find('thead tr th').removeClass('footable-sortable').find('span.footable-sort-indicator').remove();
        }
        var width = parseInt(jQuery(this).parent().innerWidth(),10);
        var lwidth = 0;
        jQuery(this).attr('data-aaf','1').attr('data-width',width);
        jQuery(this).find('thead tr th').each(function(index){
            var twidth = 0;
            var swidth = 0;
            var dwidth = jQuery(this).find('div').outerWidth();
            jQuery(this).find('div').attr('data-swidth',dwidth);
            var span = jQuery(this).find('span');
            if (span){
                swidth = span.outerWidth();
                span.attr('data-swidth',swidth);
            }
            if (!swidth) {
                swidth = 0;
            }
            var padding = parseInt(jQuery(this).css('padding-left'),10) + parseInt(jQuery(this).css('padding-right'),10);
            if (width > lwidth) {
                jQuery(this).parent().attr('data-lwidth',lwidth);
            }
            twidth = dwidth + swidth + padding;
            lwidth = lwidth + twidth;
            jQuery(this).attr('data-swidth',swidth).attr('data-dwidth',dwidth).attr('data-twidth',twidth).attr('data-padding',padding);
            if (width > lwidth) {
                jQuery(this).attr('data-cwidth',width+' > '+lwidth).attr('data-aaf','0').removeAttr('data-hide').data('hide','').prop('data-hide',false).show();
            } else {
                jQuery(this).attr('data-cwidth',width+' < '+lwidth).attr('data-aaf','1').hide().attr('data-hide','all').data('hide','all').prop('data-hide','all');
            }
        });
        autoadjustfootableforthwidth3(this);
        var visible = jQuery(this).find('thead tr th:visible').length;
        var total = jQuery(this).find('thead tr th').length;
        if (visible == total && jQuery(this).find('tbody tr.footable-row-detail')){
            jQuery(this).removeClass('breakpoint');
        } else {
            jQuery(this).addClass('breakpoint');
            jQuery(this).find('tbody tr.footable-row-detail').show();
        }
        checkfinalwidthfootable(this);
        reformfootable(this);
    });
}
function reformfootable(element){
    jQuery(element).trigger('footable_readdata').trigger('footable_redraw').trigger('footable_resize');
    return true;
}
function reformallfootable(){
    jQuery('table.footable').trigger('footable_readdata').trigger('footable_resize').trigger('footable_redraw');
    return true;
}

function checkfinalwidthfootable(element){
    if (parseInt(jQuery(element).outerWidth(true),10) > parseInt(jQuery(element).parent().innerWidth(),10)){
        jQuery(element).find('thead tr th:visible').last().hide().attr('data-aaf','2').data('hide','all').attr('data-hide','all').prop('data-hide','all');
        reformfootable(element);
    }
}

jQuery(window).resize(function(){
    waitForFinalEvent(function(){autoadjustfootables();},100,'autoadjustfootables');
});

jQuery(document).ready(function(){
    setTimeout(function(){
        footableremovesortswhennotneeded();
        jQuery('table.footable thead tr th div').each(function(){
            var text = jQuery(this).html();
            jQuery(this).html(text.replace(/ /g, " "));
        });
        waitForFinalEvent(function(){autoadjustfootables();},100,'autoadjustfootables');
        jQuery('table').bind("footable_resized",function(){
            checkfinalwidthfootable(this);
        }).each(function(){
            if (!jQuery(this).hasClass('search')){
                jQuery(this).find('.footable-filter-container').remove();
                jQuery(this).prev('.footable-filter-container').remove();
            }
        });
    },100);
});

function addfootablehides(element,type) {
    if (jQuery(element).attr('class')) {
        var classList = jQuery(element).attr('class').split(/ +/);
        var shown = 0;
        jQuery.each( classList, function(index, item){
            var id = item.split(/-/);
            if (typeof id[1] != "undefined" && typeof id[2] != "undefined") {
                if (type == 'tablet' && id[0] == 'show' && id[1] == 'tablet'){
                    shown = id[2];
                } else {
                    if (type == 'phone' && id[0] == 'show' && id[1] == 'phone'){
                        shown = id[2];
                    }
                }
            }
        });
        shown = shown - 1;
        if (shown > 0){
            jQuery(element).find('thead tr th').each(function(index){
                if (index > shown){
                    //phone,tablet
                    if (jQuery(this).attr('data-hide')){
                        jQuery(this).attr('data-hide',jQuery(this).attr('data-hide')+','+type);
                    } else {
                        jQuery(this).attr('data-hide',type);
                    }
                }
            });
        }
    }
}
function footableremovesortswhennotneeded() {
    jQuery('table.footable').each(function(){
        var count = jQuery(this).find('tbody tr').length;
        if (count <= 1){
            jQuery(this).find('thead tr th').removeClass('footable-sortable').find('span.footable-sort-indicator').remove();
        }
    });
}

var waitForFinalEvent = (function () {
    var timers = {};
	return function (callback, ms, uniqueId) {
		if (!uniqueId) {
			uniqueId = "Don't call this twice without a uniqueId";
		}
		if (timers[uniqueId]) {
			clearTimeout (timers[uniqueId]);
		}
		timers[uniqueId] = setTimeout(callback, ms);
	};
})();
