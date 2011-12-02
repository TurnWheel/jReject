/*
 * jReject (jQuery Browser Rejection Plugin)
 * Version 1.0-RC2
 * URL: http://jreject.turnwheel.com/
 * Description: jReject is a easy method of rejecting specific browsers on your site
 * Author: Steven Bower (TurnWheel Designs) http://turnwheel.com/
 * Copyright: Copyright (c) 2009-2011 Steven Bower under dual MIT/GPL license.
 * Depends On: jQuery Browser Plugin (http://jquery.thewikies.com/browser)
 */

(function($) {
$.reject = function(opts) {
	var opts = $.extend(true,{
		reject : { // Rejection flags for specific browsers
			all: false, // Covers Everything (Nothing blocked)
			msie5: true, msie6: true // Covers MSIE 5-6 (Blocked by default)
			/*
			 * Possibilities are endless...
			 *
			 * // MSIE Flags (Global, 5-8)
			 * msie, msie5, msie6, msie7, msie8,
			 * // Firefox Flags (Global, 1-3)
			 * firefox, firefox1, firefox2, firefox3,
			 * // Konqueror Flags (Global, 1-3)
			 * konqueror, konqueror1, konqueror2, konqueror3,
			 * // Chrome Flags (Global, 1-4)
			 * chrome, chrome1, chrome2, chrome3, chrome4,
			 * // Safari Flags (Global, 1-4)
			 * safari, safari2, safari3, safari4,
			 * // Opera Flags (Global, 7-10)
			 * opera, opera7, opera8, opera9, opera10,
			 * // Rendering Engines (Gecko, Webkit, Trident, KHTML, Presto)
			 * gecko, webkit, trident, khtml, presto,
			 * // Operating Systems (Win, Mac, Linux, Solaris, iPhone)
			 * win, mac, linux, solaris, iphone,
			 * unknown // Unknown covers everything else
			 */
		},
		display: [], // What browsers to display and their order (default set below)
		browserInfo: { // Settings for which browsers to display
			firefox: {
				text: 'Firefox 8', // Text below the icon
				url: 'http://www.mozilla.com/firefox/' // URL For icon/text link
			},
			safari: {
				text: 'Safari 5',
				url: 'http://www.apple.com/safari/download/'
			},
			opera: {
				text: 'Opera 11',
				url: 'http://www.opera.com/download/'
			},
			chrome: {
				text: 'Chrome 15',
				url: 'http://www.google.com/chrome/'
			},
			msie: {
				text: 'Internet Explorer 9',
				url: 'http://www.microsoft.com/windows/Internet-explorer/'
			},
			gcf: {
				text: 'Google Chrome Frame',
				url: 'http://code.google.com/chrome/chromeframe/',
				// This browser option will only be displayed for MSIE
				allow: { all: false, msie: true }
			}
		},

		// Header of pop-up window
		header: 'Did you know that your Internet Browser is out of date?',
		// Paragraph 1
		paragraph1: 'Your browser is out of date, and may not be compatible with '+
					'our website. A list of the most popular web browsers can be '+
					'found below.',
		// Paragraph 2
		paragraph2: 'Just click on the icons to get to the download page',
		close: true, // Allow closing of window
		// Message displayed below closing link
		closeMessage: 'By closing this window you acknowledge that your experience '+
						'on this website may be degraded',
		closeLink: 'Close This Window', // Text for closing link
		closeURL: '#', // Close URL
		closeESC: true, // Allow closing of window with esc key

		// If cookies should be used to remmember if the window was closed
		// See cookieSettings for more options
		closeCookie: false,
		// Cookie settings are only used if closeCookie is true
		cookieSettings: {
			// Path for the cookie to be saved on
			// Should be root domain in most cases
			path: '/',
			// Expiration Date (in seconds)
			// 0 (default) means it ends with the current session
			expires: 0
		},

		imagePath: './images/', // Path where images are located
		overlayBgColor: '#000', // Background color for overlay
		overlayOpacity: 0.8, // Background transparency (0-1)

		// Fade in time on open ('slow','medium','fast' or integer in ms)
		fadeInTime: 'fast',
		// Fade out time on close ('slow','medium','fast' or integer in ms)
		fadeOutTime: 'fast'
	},opts);

	// Set default browsers to display if not already defined
	if (opts.display.length < 1)
		opts.display = ['firefox','chrome','msie','safari','opera','gcf'];

	// beforeRject: Customized Function
	if ($.isFunction(opts.beforeReject)) opts.beforeReject(opts);

	// Disable 'closeESC' if closing is disabled (mutually exclusive)
	if (!opts.close) opts.closeESC = false;

	// This function parses the advanced browser options
	var browserCheck = function(settings) {
		// Check 1: Look for 'all' forced setting
		// Check 2: Operating System (eg. 'win','mac','linux','solaris','iphone')
		// Check 3: Rendering engine (eg. 'webkit', 'gecko', 'trident')
		// Check 4: Browser name (eg. 'firefox','msie','chrome')
		// Check 5: Browser+major version (eg. 'firefox3','msie7','chrome4')
		return (settings['all'] ? true : false) ||
			(settings[$.os.name] ? true : false) ||
			(settings[$.layout.name] ? true : false) ||
			(settings[$.browser.name] ? true : false) ||
			(settings[$.browser.className] ? true : false);
	};

	// Determine if we need to display rejection for this browser, or exit
	if (!browserCheck(opts.reject)) {
		// onFail: Customized Function
		if ($.isFunction(opts.onFail)) opts.onFail(opts);
		return false;
	}

	// If user can close and set to remmember close, initiate cookie functions
	if (opts.close && opts.closeCookie) {
		// Local global setting for the name of the cookie used
		var COOKIE_NAME = 'jreject-close';

		// Cookies Function: Handles creating/retrieving/deleting cookies
		// Cookies are only used for opts.closeCookie parameter functionality
		var _cookie = function(name, value) {
			if (typeof value != 'undefined') {
				var expires = '';

				// Check if we need to set an expiration date
				if (opts.cookieSettings.expires != 0) {
					var date = new Date();
					date.setTime(date.getTime()+(opts.cookieSettings.expires));
					var expires = "; expires="+date.toGMTString();
				}

				// Get path from settings
				var path = opts.cookieSettings.path || '/';

				// Set Cookie with parameters
				document.cookie = name+'='+
					encodeURIComponent(value == null ? '' : value)+expires+
					'; path='+path;
			}
			else { // Get cookie value
				var cookie,val = null;

				if (document.cookie && document.cookie != '') {
					var cookies = document.cookie.split(';');

					// Loop through all cookie values
					var clen = cookies.length;
					for (var i = 0; i < clen; ++i) {
						cookie = $.trim(cookies[i]);

						// Does this cookie string begin with the name we want?
						if (cookie.substring(0,name.length+1) == (name+'=')) {
							var len = name.length;
							val = decodeURIComponent(cookie.substring(len+1));
							break;
						}
					}
				}

				return val; // Return cookie value
			}
		};

		// If cookie is set, return false and don't display rejection
		if (_cookie(COOKIE_NAME) != null) return false;
	}

	// Load background overlay (jr_overlay) + Main wrapper (jr_wrap) +
	// Inner Wrapper (jr_inner) w/ opts.header (jr_header) +
	// opts.paragraph1/opts.paragraph2 if set
	var html = '<div id="jr_overlay"></div><div id="jr_wrap"><div id="jr_inner">'+
		'<h1 id="jr_header">'+opts.header+'</h1>'+
		(opts.paragraph1 === '' ? '' : '<p>'+opts.paragraph1+'</p>')+
		(opts.paragraph2 === '' ? '' : '<p>'+opts.paragraph2+'</p>')+'<ul>';

	var displayNum = 0; // Tracks number of browsers being displayed
	// Generate the browsers to display
	for (var x in opts.display) {
		var browser = opts.display[x]; // Current Browser
		var info = opts.browserInfo[browser] || false; // Browser Information

		// If no info exists for this browser
		// or if this browser is not suppose to display to this user
		if (!info || (info['allow'] != undefined && !browserCheck(info['allow']))) {
			continue;
		}

		var url = info.url || '#'; // URL to link text/icon to
		// Generate HTML for this browser option
		html += '<li id="jr_'+browser+'"><div class="jr_icon"></div>'+
				'<div><a href="'+url+'">'+(info.text || 'Unknown')+'</a>'+
				'</div></li>';
		++displayNum; // Increment number of browser being displayed
	}

	// Close list and #jr_list
	html += '</ul><div id="jr_close">'+
	// Display close links/message if set
	(opts.close ? '<a href="'+opts.closeURL+'">'+opts.closeLink+'</a>'+
		'<p>'+opts.closeMessage+'</p>' : '')+'</div>'+
	// Close #jr_inner and #jr_wrap
	'</div></div>';

	var element = $('<div>'+html+'</div>'); // Create element
	var size = _pageSize(); // Get page size
	var scroll = _scrollSize(); // Get page scroll

	// This function handles closing this reject window
	// When clicked, fadeOut and remove all elements
	element.bind('closejr', function() {
		if (!opts.close) return false; // Make sure the ability to close is set

		// Customized Function
		if ($.isFunction(opts.beforeClose)) opts.beforeClose(opts);

		$(this).unbind('closejr'); // Remove binding function

		// Fade out background and modal wrapper
		$('#jr_overlay,#jr_wrap').fadeOut(opts.fadeOutTime,function() {
			$(this).remove(); // Remove element from DOM

			// afterClose: Customized Function
			if ($.isFunction(opts.afterClose)) opts.afterClose(opts);
		});

		$('embed, object, select, applet').show(); // Show elements that were hidden

		// Set close cookie for next run
		if (opts.closeCookie) _cookie(COOKIE_NAME,'true');
		return true;
	});

	// Traverse through the DOM and
	// Apply CSS Rules to elements
	element.find('#jr_overlay').css({ // Creates 'background' (div)
		width: size[0],
		height: size[1],
		position: 'absolute',
		top: 0,
		left: 0,
		background: opts.overlayBgColor,
		zIndex: 200,
		opacity: opts.overlayOpacity,
		padding: 0,
		margin: 0
	}).next('#jr_wrap').css({ // Wrapper for our pop-up (div)
		position: 'absolute',
		width: '100%',
		top: scroll[1]+(size[3]/4),
		left: scroll[0],
		zIndex: 300,
		textAlign: 'center',
		padding: 0,
		margin: 0
	}).children('#jr_inner').css({ // Wrapper for inner centered content (div)
		background: '#FFF',
		border: '1px solid #CCC',
		fontFamily: '"Lucida Grande","Lucida Sans Unicode",Arial,Verdana,sans-serif',
		color: '#4F4F4F',
		margin: '0 auto',
		position: 'relative',
		height: 'auto',
		minWidth: displayNum*100,
		maxWidth: displayNum*140,
		// min/maxWidth not supported by IE
		width: $.layout.name == 'trident' ? displayNum*155 : 'auto',
		padding: 20,
		fontSize: 12
	}).children('#jr_header').css({ // Header (h1)
		display: 'block',
		fontSize: '1.3em',
		marginBottom: '0.5em',
		color: '#333',
		fontFamily: 'Helvetica,Arial,sans-serif',
		fontWeight: 'bold',
		textAlign: 'left',
		padding: 5,
		margin: 0
	}).nextAll('p').css({ // Paragraphs (p)
		textAlign: 'left',
		padding: 5,
		margin: 0
	}).siblings('ul').css({ // Browser list (ul)
		listStyleImage: 'none',
		listStylePosition: 'outside',
		listStyleType: 'none',
		margin: 0,
		padding: 0
	}).children('li').css({ // Browser list items (li)
		background: 'transparent url("'+opts.imagePath+'background_browser.gif")'+
					'no-repeat scroll left top',
		cursor: 'pointer',
		'float': 'left',
		width: 120,
		height: 122,
		margin: '0 10px 10px 10px',
		padding: 0,
		textAlign: 'center'
	}).children('.jr_icon').css({ // Icons (div)
		width: 100,
		height: 100,
		margin: '1px auto',
		padding: 0,
		background: 'transparent no-repeat scroll left top',
		cursor: 'pointer'
	}).each(function() { // Dynamically sets the icon background image
		var self = $(this);
		self.css('background','transparent url('+opts.imagePath+'browser_'+
				(self.parent('li').attr('id').replace(/jr_/,''))+'.gif)'+
					' no-repeat scroll left top');

		self.click(function() {
			window.open($(this).next('div').children('a').attr('href'),'jr_'+
							Math.round(Math.random()*11));
			return false;
		});
	}).siblings('div').css({ // Text under the browser icon (div)
		color: '#808080',
		fontSize: '0.8em',
		height: 18,
		lineHeight: '17px',
		margin: '1px auto',
		padding: 0,
		width: 118,
		textAlign: 'center'
	}).children('a').css({ // Text link (a)
		color: '#333',
		textDecoration: 'none',
		padding: 0,
		margin: 0
	}).hover(function() { // Underline effect (a:hover)
		$(this).css('textDecoration','underline');
	},function() {
		$(this).css('textDecoration','none');
	}).click(function() { // Make links open in new window (a)
		window.open($(this).attr('href'),'jr_'+Math.round(Math.random()*11));
		return false;
	}).parents('#jr_inner').children('#jr_close').css({ // Close window option (div)
		margin: '0 0 0 50px',
		clear: 'both',
		textAlign: 'left',
		padding: 0,
		margin: 0
	}).children('a').css({ // Close window link (a)
		color: '#000',
		display: 'block',
		width: 'auto',
		margin: 0,
		padding: 0,
		textDecoration: 'underline'
	}).click(function() { // Bind closing event
		$(this).trigger('closejr');

		// If plain anchor is set, return false so there is no page jump
		if (opts.closeURL === '#') return false;
	}).nextAll('p').css({ // Add padding to close link/text
		padding: '10px 0 0 0',
		margin: 0
	});

	// Set focus (fixes ESC key issues with forms and other focus bugs)
	$('#jr_overlay').focus();

	// Hide elements that won't display properly
	$('embed, object, select, applet').hide();

	// Append element to body of document to display
	$('body').append(element.hide().fadeIn(opts.fadeInTime));

	// Handle window resize/scroll events and update overlay dimensions
	$(window).bind('resize scroll',function() {
		var size = _pageSize(); // Get size

		// Update overlay dimensions based on page size
		$('#jr_overlay').css({ width: size[0],height: size[1] });

		var scroll = _scrollSize(); // Get page scroll

		// Update modal position based on scroll
		$('#jr_wrap').css({ top: scroll[1] + (size[3]/4),left: scroll[0] });
	});

	// Add optional ESC Key functionality
	if (opts.closeESC) {
		$(document).bind('keydown',function(event) {
			// ESC = Keycode 27
			if (event.keyCode == 27) element.trigger('closejr');
		});
	}

	// afterReject: Customized Function
	if ($.isFunction(opts.afterReject)) opts.afterReject(opts);

	return true;
};

// Based on compatibility data from quirksmode.com
var _pageSize = function() {
	var xScroll = window.innerWidth && window.scrollMaxX ?
				window.innerWidth + window.scrollMaxX :
				(document.body.scrollWidth > document.body.offsetWidth ?
				document.body.scrollWidth : document.body.offsetWidth);

	var yScroll = window.innerHeight && window.scrollMaxY ?
				window.innerHeight + window.scrollMaxY :
				(document.body.scrollHeight > document.body.offsetHeight ?
				document.body.scrollHeight : document.body.offsetHeight);

	var windowWidth = window.innerWidth ? window.innerWidth :
				(document.documentElement && document.documentElement.clientWidth ?
				document.documentElement.clientWidth : document.body.clientWidth);

	var windowHeight = window.innerHeight ? window.innerHeight :
				(document.documentElement && document.documentElement.clientHeight ?
				document.documentElement.clientHeight : document.body.clientHeight);

	return [
		xScroll < windowWidth ? xScroll : windowWidth, // Page Width
		yScroll < windowHeight ? windowHeight : yScroll, // Page Height
		windowWidth,windowHeight
	];
};


// Based on compatibility data from quirksmode.com
var _scrollSize = function() {
	return [
		// scrollSize X
		window.pageXOffset ? window.pageXOffset : (document.documentElement &&
				document.documentElement.scrollTop ?
				document.documentElement.scrollLeft : document.body.scrollLeft),

		// scrollSize Y
		window.pageYOffset ? window.pageYOffset : (document.documentElement &&
				document.documentElement.scrollTop ?
				document.documentElement.scrollTop : document.body.scrollTop)
	];
};
})(jQuery);
