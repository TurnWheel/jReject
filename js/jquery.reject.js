/*!
 * jReject (jQuery Browser Rejection Plugin)
 * Version 1.1.x
 * URL: http://jreject.turnwheel.com/
 * Description: jReject is a easy method of rejecting specific browsers on your site
 * Author: Steven Bower (TurnWheel Designs) http://turnwheel.com/
 * Copyright: Copyright (c) 2009-2014 Steven Bower under dual MIT/GPLv2 license.
 */

(function($) {
$.reject = function(options) {
	var opts = $.extend(true, {
		// Specifies which browsers/versions will be blocked
		reject : {
			all: false, // Covers Everything (Nothing blocked)
			msie: 6 // Covers MSIE <= 6 (Blocked by default)
			/*
			 * Many possible combinations.
			 * You can specify browser (msie, chrome, firefox)
			 * You can specify rendering engine (geko, trident)
			 * You can specify OS (Win, Mac, Linux, Solaris, iPhone, iPad)
			 *
			 * You can specify versions of each.
			 * Examples: msie9: true, firefox8: true,
			 *
			 * You can specify the highest number to reject.
			 * Example: msie: 9 (9 and lower are rejected.
			 *
			 * There is also "unknown" that covers what isn't detected
			 * Example: unknown: true
			 */
		},
		display: [], // What browsers to display and their order (default set below)
		browserShow: true, // Should the browser options be shown?
		browserInfo: { // Settings for which browsers to display
			chrome: {
				// Text below the icon
				text: 'Google Chrome',
				// URL For icon/text link
				url: 'http://www.google.com/chrome/'
				// (Optional) Use "allow" to customized when to show this option
				// Example: to show chrome only for IE users
				// allow: { all: false, msie: true }
			},
			firefox: {
				text: 'Mozilla Firefox',
				url: 'http://www.mozilla.com/firefox/'
			},
			safari: {
				text: 'Safari',
				url: 'http://www.apple.com/safari/download/'
			},
			opera: {
				text: 'Opera',
				url: 'http://www.opera.com/download/'
			},
			msie: {
				text: 'Internet Explorer',
				url: 'http://www.microsoft.com/windows/Internet-explorer/'
			}
		},

		// Pop-up Window Text
		header: 'Did you know that your Internet Browser is out of date?',

		paragraph1: 'Your browser is out of date, and may not be compatible with '+
					'our website. A list of the most popular web browsers can be '+
					'found below.',

		paragraph2: 'Just click on the icons to get to the download page',

		// Allow closing of window
		close: true,

		// Message displayed below closing link
		closeMessage: 'By closing this window you acknowledge that your experience '+
						'on this website may be degraded',
		closeLink: 'Close This Window',
		closeURL: '#',

		// Allows closing of window with esc key
		closeESC: true,

		// Use cookies to remmember if window was closed previously?
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

		// Path where images are located
		imagePath: './images/',
		// Background color for overlay
		overlayBgColor: '#000',
		// Background transparency (0-1)
		overlayOpacity: 0.8,

		// Fade in time on open ('slow','medium','fast' or integer in ms)
		fadeInTime: 'fast',
		// Fade out time on close ('slow','medium','fast' or integer in ms)
		fadeOutTime: 'fast',

		// Google Analytics Link Tracking (Optional)
		// Set to true to enable
		// Note: Analytics tracking code must be added separately
		analytics: false
	}, options);

	// Set default browsers to display if not already defined
	if (opts.display.length < 1) {
		opts.display = [ 'chrome','firefox','safari','opera','msie' ];
	}

	// beforeRject: Customized Function
	if ($.isFunction(opts.beforeReject)) {
		opts.beforeReject();
	}

	// Disable 'closeESC' if closing is disabled (mutually exclusive)
	if (!opts.close) {
		opts.closeESC = false;
	}

	// This function parses the advanced browser options
	var browserCheck = function(settings) {
		// Check 1: Look for 'all' forced setting
		// Check 2: Browser+major version (optional) (eg. 'firefox','msie','{msie: 6}')
		// Check 3: Browser+major version (eg. 'firefox3','msie7','chrome4')
		// Check 4: Rendering engine+version (eg. 'webkit', 'gecko', '{webkit: 537.36}')
		// Check 5: Operating System (eg. 'win','mac','linux','solaris','iphone')
		var engine = settings[$.engine.name];
	        	var browser = settings[$.browser.name];

	    	return !!(settings['all']
			|| (browser && (browser === true || parseFloat($.browser.version) <= browser))
			|| settings[$.browser.className]
			|| (engine && (engine === true || parseFloat($.engine.version) <= engine))
			|| settings[$.browser.platform]);
	};

	// Determine if we need to display rejection for this browser, or exit
	if (!browserCheck(opts.reject)) {
		// onFail: Optional Callback
		if ($.isFunction(opts.onFail)) {
			opts.onFail();
		}

		return false;
	}

	// If user can close and set to remmember close, initiate cookie functions
	if (opts.close && opts.closeCookie) {
		// Local global setting for the name of the cookie used
		var COOKIE_NAME = 'jreject-close';

		// Cookies Function: Handles creating/retrieving/deleting cookies
		// Cookies are only used for opts.closeCookie parameter functionality
		var _cookie = function(name, value) {
			// Save cookie
			if (typeof value != 'undefined') {
				var expires = '';

				// Check if we need to set an expiration date
				if (opts.cookieSettings.expires !== 0) {
					var date = new Date();
					date.setTime(date.getTime()+(opts.cookieSettings.expires*1000));
					expires = "; expires="+date.toGMTString();
				}

				// Get path from settings
				var path = opts.cookieSettings.path || '/';

				// Set Cookie with parameters
				document.cookie = name+'='+
					encodeURIComponent((!value) ? '' : value)+expires+
					'; path='+path;

				return true;
			}
			// Get cookie
			else {
				var cookie,val = null;

				if (document.cookie && document.cookie !== '') {
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

				// Returns cookie value
				return val;
			}
		};

		// If cookie is set, return false and don't display rejection
		if (_cookie(COOKIE_NAME)) {
			return false;
		}
	}

	// Load background overlay (jr_overlay) + Main wrapper (jr_wrap) +
	// Inner Wrapper (jr_inner) w/ opts.header (jr_header) +
	// opts.paragraph1/opts.paragraph2 if set
	var html = '<div id="jr_overlay"></div><div id="jr_wrap"><div id="jr_inner">'+
		'<h1 id="jr_header">'+opts.header+'</h1>'+
		(opts.paragraph1 === '' ? '' : '<p>'+opts.paragraph1+'</p>')+
		(opts.paragraph2 === '' ? '' : '<p>'+opts.paragraph2+'</p>');

	var displayNum = 0;
	if (opts.browserShow) {
		html += '<ul>';

		// Generate the browsers to display
		for (var x in opts.display) {
			var browser = opts.display[x]; // Current Browser
			var info = opts.browserInfo[browser] || false; // Browser Information

			// If no info exists for this browser
			// or if this browser is not suppose to display to this user
			// based on "allow" flag
			if (!info || (info['allow'] != undefined && !browserCheck(info['allow']))) {
				continue;
			}

			var url = info.url || '#'; // URL to link text/icon to

			// Generate HTML for this browser option
			html += '<li id="jr_'+browser+'"><div class="jr_icon"></div>'+
					'<div><a href="'+url+'">'+(info.text || 'Unknown')+'</a>'+
					'</div></li>';

			++displayNum;
		}

		html += '</ul>';
	}

	// Close list and #jr_list
	html += '<div id="jr_close">'+
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
		// Make sure the permission to close is granted
		if (!opts.close) {
			return false;
		}

		// Customized Function
		if ($.isFunction(opts.beforeClose)) {
			opts.beforeClose();
		}

		// Remove binding function so it
		// doesn't get called more than once
		$(this).unbind('closejr');

		// Fade out background and modal wrapper
		$('#jr_overlay,#jr_wrap').fadeOut(opts.fadeOutTime,function() {
			$(this).remove(); // Remove element from DOM

			// afterClose: Customized Function
			if ($.isFunction(opts.afterClose)) {
				opts.afterClose();
			}
		});

		// Show elements that were hidden for layering issues
		var elmhide = 'embed.jr_hidden, object.jr_hidden, select.jr_hidden, applet.jr_hidden';
		$(elmhide).show().removeClass('jr_hidden');

		// Set close cookie for next run
		if (opts.closeCookie) {
			_cookie(COOKIE_NAME, 'true');
		}

		return true;
	});

	// Tracks clicks in Google Analytics (category 'External Links')
	// only if opts.analytics is enabled
	var analytics = function(url) {
		if (!opts.analytics) {
			return false;
		}

		// Get just the hostname
		var host = url.split(/\/+/g)[1];

		// Send external link event to Google Analaytics
		// Attempts both versions of analytics code. (Newest first)
		try {
			// Newest analytics code
			ga('send', 'event', 'External', 'Click', host, url);
		} catch (e) {
			try {
				_gaq.push([ '_trackEvent', 'External Links',  host, url ]);
			} catch (e) { }
		}
	};

	// Called onClick for browser links (and icons)
	// Opens link in new window
	var openBrowserLinks = function(url) {
		// Send link to analytics if enabled
		analytics(url);

		// Open window, generate random id value
		window.open(url, 'jr_'+ Math.round(Math.random()*11));

		return false;
	};

	/*
	 * Trverse through element DOM and apply JS variables
	 * All CSS elements that do not require JS will be in
	 * css/jquery.jreject.css
	 */

	// Creates 'background' (div)
	element.find('#jr_overlay').css({
		width: size[0],
		height: size[1],
		background: opts.overlayBgColor,
		opacity: opts.overlayOpacity
	});

	// Wrapper for our pop-up (div)
	element.find('#jr_wrap').css({
		top: scroll[1]+(size[3]/4),
		left: scroll[0]
	});

	// Wrapper for inner centered content (div)
	element.find('#jr_inner').css({
		minWidth: displayNum*100,
		maxWidth: displayNum*140,
		// min/maxWidth not supported by IE
		width: $.layout.name == 'trident' ? displayNum*155 : 'auto'
	});

	element.find('#jr_inner li').css({ // Browser list items (li)
		background: 'transparent url("'+opts.imagePath+'background_browser.gif") '+
					'no-repeat scroll left top'
	});

	element.find('#jr_inner li .jr_icon').each(function() {
		// Dynamically sets the icon background image
		var self = $(this);
		self.css('background','transparent url('+opts.imagePath+'browser_'+
				(self.parent('li').attr('id').replace(/jr_/,''))+'.gif)'+
					' no-repeat scroll left top');

		// Send link clicks to openBrowserLinks
		self.click(function () {
			var url = $(this).next('div').children('a').attr('href');
			openBrowserLinks(url);
		});
	});

	element.find('#jr_inner li a').click(function() {
		openBrowserLinks($(this).attr('href'));
		return false;
	});

	// Bind closing event to trigger closejr
	// to be consistant with ESC key close function
	element.find('#jr_close a').click(function() {
		$(this).trigger('closejr');

		// If plain anchor is set, return false so there is no page jump
		if (opts.closeURL === '#') {
			return false;
		}
	});

	// Set focus (fixes ESC key issues with forms and other focus bugs)
	$('#jr_overlay').focus();

	// Hide elements that won't display properly
	$('embed, object, select, applet').each(function() {
		if ($(this).is(':visible')) {
			$(this).hide().addClass('jr_hidden');
		}
	});

	// Append element to body of document to display
	$('body').append(element.hide().fadeIn(opts.fadeInTime));

	// Handle window resize/scroll events and update overlay dimensions
	$(window).bind('resize scroll',function() {
		var size = _pageSize(); // Get size

		// Update overlay dimensions based on page size
		$('#jr_overlay').css({
			width: size[0],
			height: size[1]
		});

		var scroll = _scrollSize(); // Get page scroll

		// Update modal position based on scroll
		$('#jr_wrap').css({
			top: scroll[1] + (size[3]/4),
			left: scroll[0]
		});
	});

	// Add optional ESC Key functionality
	if (opts.closeESC) {
		$(document).bind('keydown',function(event) {
			// ESC = Keycode 27
			if (event.keyCode == 27) {
				element.trigger('closejr');
			}
		});
	}

	// afterReject: Customized Function
	if ($.isFunction(opts.afterReject)) {
		opts.afterReject();
	}

	return true;
};

// Based on compatibility data from quirksmode.com
// This is used to help calculate exact center of the page
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


/*!
 * jQuery Browser Plugin 0.0.7
 * https://github.com/gabceb/jquery-browser-plugin
 *
 * Original jquery-browser code Copyright 2005, 2015 jQuery Foundation, Inc. and other contributors
 * http://jquery.org/license
 *
 * Modifications Copyright 2015 Gabriel Cebrian
 * https://github.com/gabceb
 *
 * Released under the MIT license
 *
 * Date: 19-05-2015
 */
/*global window: false */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], function($) {
	  factory($);
        });
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        // Node-like environment
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(window.jQuery);
    }
}(function(jQuery) {
    "use strict";

    function uaMatch( ua ) {
        // If an UA is not provided, default to the current browser UA.
        if ( ua === undefined ) {
	  ua = window.navigator.userAgent;
        }
        ua = ua.toLowerCase();

        var match = /(edge)\/([\w.]+)/.exec( ua ) ||
	  /(opr)[\/]([\w.]+)/.exec( ua ) ||
	  /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
	  /(version)(applewebkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec( ua ) ||
	  /(webkit)[ \/]([\w.]+).*(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec( ua ) ||
	  /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
	  /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
	  /(msie) ([\w.]+)/.exec( ua ) ||
	  ua.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec( ua ) ||
	  ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
	  [];

        var platform_match = /(ipad)/.exec( ua ) ||
	  /(ipod)/.exec( ua ) ||
	  /(iphone)/.exec( ua ) ||
	  /(kindle)/.exec( ua ) ||
	  /(silk)/.exec( ua ) ||
	  /(android)/.exec( ua ) ||
	  /(windows phone)/.exec( ua ) ||
	  /(win)/.exec( ua ) ||
	  /(mac)/.exec( ua ) ||
	  /(linux)/.exec( ua ) ||
	  /(cros)/.exec( ua ) ||
	  /(playbook)/.exec( ua ) ||
	  /(bb)/.exec( ua ) ||
	  /(blackberry)/.exec( ua ) ||
	  [];

        var browser = {},
	  matched = {
	      browser: match[ 5 ] || match[ 3 ] || match[ 1 ] || "",
	      version: match[ 2 ] || match[ 4 ] || "0",
	      versionNumber: match[ 4 ] || match[ 2 ] || "0",
	      platform: platform_match[ 0 ] || ""
	  };

        if ( matched.browser ) {
	  browser[ matched.browser ] = true;
	  browser.version = matched.version;
	  browser.versionNumber = parseInt(matched.versionNumber, 10);
        }

        if ( matched.platform ) {
	  browser[ matched.platform ] = true;
        }

        // These are all considered mobile platforms, meaning they run a mobile browser
        if ( browser.android || browser.bb || browser.blackberry || browser.ipad || browser.iphone ||
	  browser.ipod || browser.kindle || browser.playbook || browser.silk || browser[ "windows phone" ]) {
	  browser.mobile = true;
        }

        // These are all considered desktop platforms, meaning they run a desktop browser
        if ( browser.cros || browser.mac || browser.linux || browser.win ) {
	  browser.desktop = true;
        }

        // Chrome, Opera 15+ and Safari are webkit based browsers
        if ( browser.chrome || browser.opr || browser.safari ) {
	  browser.webkit = true;
        }

        // IE11 has a new token so we will assign it msie to avoid breaking changes
        // IE12 disguises itself as Chrome, but adds a new Edge token.
        if ( browser.rv || browser.edge ) {
	  var ie = "msie";

	  matched.browser = ie;
	  browser[ie] = true;
        }

        // Blackberry browsers are marked as Safari on BlackBerry
        if ( browser.safari && browser.blackberry ) {
	  var blackberry = "blackberry";

	  matched.browser = blackberry;
	  browser[blackberry] = true;
        }

        // Playbook browsers are marked as Safari on Playbook
        if ( browser.safari && browser.playbook ) {
	  var playbook = "playbook";

	  matched.browser = playbook;
	  browser[playbook] = true;
        }

        // BB10 is a newer OS version of BlackBerry
        if ( browser.bb ) {
	  var bb = "blackberry";

	  matched.browser = bb;
	  browser[bb] = true;
        }

        // Opera 15+ are identified as opr
        if ( browser.opr ) {
	  var opera = "opera";

	  matched.browser = opera;
	  browser[opera] = true;
        }

        // Stock Android browsers are marked as Safari on Android.
        if ( browser.safari && browser.android ) {
	  var android = "android";

	  matched.browser = android;
	  browser[android] = true;
        }

        // Kindle browsers are marked as Safari on Kindle
        if ( browser.safari && browser.kindle ) {
	  var kindle = "kindle";

	  matched.browser = kindle;
	  browser[kindle] = true;
        }

        // Kindle Silk browsers are marked as Safari on Kindle
        if ( browser.safari && browser.silk ) {
	  var silk = "silk";

	  matched.browser = silk;
	  browser[silk] = true;
        }

        // Assign the name and platform variable
        browser.name = matched.browser;
        browser.platform = matched.platform;
        return browser;
    }

    // Run the matching process, also assign the function to the returned object
    // for manual, jQuery-free use if desired
    window.jQBrowser = uaMatch( window.navigator.userAgent );
    window.jQBrowser.uaMatch = uaMatch;

    // Only assign to jQuery.browser if jQuery is loaded
    if ( jQuery ) {
        jQuery.browser = window.jQBrowser;
    }

    return window.jQBrowser;
}));

/*!
 * layouter 0.0.1
 * https://github.com/djachenko/layouter
 *
 * Description: layouter is lightweight JavaScript-based plugin for browser layout engine detection
 * Author: Igor Djachenko
 * Based on:
 * * jquery-browser-plugin (https://github.com/gabceb/jquery-browser-plugin)
 * * ua-parser-js (https://github.com/faisalman/ua-parser-js)
 *
 * Copyright: Copyright © 2015 Igor Djachenko under dual MIT license.
 */

(function() {
    var Layouter = function () {
        this.parse = function (uaString) {
	  var match = /(windows.+\sedge)\/([\w\.]+)/i.exec(uaString) ||
	      /(presto|webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i.exec(uaString) ||
	      /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i.exec(uaString) ||
	      /(icab)[\/\s]([23]\.[\d\.]+)/i.exec(uaString) ||
	      /rv:([\w\.]+).*(gecko)/i.exec(uaString);

	  var result;

	  if (!!match) {
	      result = {
		name: match[1],
		version: match[2]
	      };

	      if (/(windows.+\sedge)/i.exec(result.name)) {
		result.name = "EdgeHTML";
	      }
	      else if ("gecko" === result.version.toLowerCase()) {
		var temp = result.version;
		result.version = result.name;
		result.name = temp;
	      }
	  }

	  return result;
        };

        return this;
    };

    if (typeof(exports) !== "undefined") {
        // nodejs env
        if (typeof module !== "undefined" && module.exports) {
	  exports = module.exports = Layouter;
        }

        exports.Layouter = Layouter;
    }

    if (typeof(window) !== 'undefined' &&
        typeof(window.navigator) !== "undefined" &&
        typeof(window.navigator.userAgent) !== 'undefined') {
        var engine = new Layouter().parse(window.navigator.userAgent);

        window.engine = engine;

        if ($) {
	  $.engine = engine;
        }
    }
})();
