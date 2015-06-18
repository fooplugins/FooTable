(function($){

	function openPanel(panel){
		$(panel).addClass('open').children('.panel-collapse').addClass('in');
	}

	function closePanel(panel){
		$(panel).removeClass('open').children('.panel-collapse').removeClass('in');
	}

	function togglePanel(panel){
		$(panel).toggleClass('open').children('.panel-collapse').toggleClass('in');
	}

	$(function(){
		// Bind the member visibility options
		$('.fp-options').on('click', '.fp-toggle-member', function(e){
			var $target = $(e.target), $members = $($target.val());
			if ($target.is(':checked')){
				$members.show();
			} else {
				$members.hide();
			}
		}).find('.fp-toggle-member').each(function(i, el){
			var $target = $(el), $members = $($target.val());
			if ($target.is(':checked')){
				$members.show();
			} else {
				$members.hide();
			}
		});

		// Bind the panel header clicks to toggle
		$('.fp-nav-items').on('click', '.panel-heading', function(e){
			var $t = $(e.target);
			if (!$t.is('a')){
				togglePanel($t.closest('.panel'));
			}
		});

		// Auto show the current page's navigation item.
		var filename = $('body').data('filename').replace(/\.[a-z]+$/, '');
		openPanel('.fp-nav-items > .panel[data-name*="' + filename + '"]:eq(0)');

		// Search Items
		var search = null;
		$('.fp-search').on('keyup', function () {
			var filter = $(this).val();
			if (search == null) clearTimeout(search);
			search = setTimeout(function(){
				search = null;
				var $panels = $('.fp-nav-items > .panel');
				if (!filter){
					closePanel($panels.show());
					openPanel('.fp-nav-items > .panel[data-name*="' + filename + '"]:eq(0)');
					return;
				}
				filter = new RegExp(filter, 'i');
				closePanel($panels.hide());
				openPanel($('.fp-nav-items .fp-monospace').filter(function(i, el){
					return filter.test(el.innerText || el.textContent);
				}).closest('.panel').show());
				$('.fp-nav-items').scrollTop(0);
			}, 500);
		});

		// disqus code
		if (config.disqus) {
			$(window).on('load', function () {
				var disqus_shortname = config.disqus; // required: replace example with your forum shortname
				var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
				dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
				(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
				var s = document.createElement('script'); s.async = true;
				s.type = 'text/javascript';
				s.src = 'http://' + disqus_shortname + '.disqus.com/count.js';
				document.getElementsByTagName('BODY')[0].appendChild(s);
			});
		}

	});

})(jQuery);