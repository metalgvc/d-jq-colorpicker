// TODO: get color from background img elements

(function( $ ){
	
	var plugin = {
		
		config: {
			onSelectColor: null,	// onSelectColor(event) callback
			onMouseMove: null,		// onMouseMove(event) callback
			
			showInfoPanel: true,	// show color info panel
			
			panel: '<div id="djqcpPanel" style="border: 1px solid #999; background-color:#cccccc; position: fixed; top:5px; right: 5px; width:130px; height:25px;cursor:default !important;"><div id="djqcpOutColor" style="float:left; width:25px; height:25px;cursor:default !important;"></div><input id="djqcpOutText" style="float:left;cursor:text !important;" value="" size="7" /><div id="djqcpClose" style="padding-right:2px; float:right;cursor:default !important;"><a href="#" style="text-decoration:none;cursor:pointer !important;"><b style="cursor:pointer !important;">x</b></a></div></div>',

			css: '.jdpicker-cursor, .jdpicker-cursor * {cursor:crosshair;}'
		},

		const: {
			STATUS_COLOR_NOT_SELECTED: 1,
			STATUS_COLOR_SELECTED: 2
		},

		_lastColor: '',
		_mainObj: null,

		_status: 1,

		init: function(opt){
			$.extend(plugin.config, opt);

			plugin._mainObj = this;

			if($('style#jdpickerCSS').length == 0){
				$('<style>')
					.attr({id: 'jdpickerCSS', type: 'text/css'})
					.html(plugin.config.css)
					.appendTo('head')
				;
			}

			if((typeof plugin.config.onSelectColor == 'function'
				|| typeof plugin.config.onMouseMove == 'function'
				) && !opt.showInfoPanel
			){
				plugin.config.showInfoPanel = false;
			}

			return plugin._mainObj.bind('click.dpicker', function(){
				
				if(plugin.isActivated()){
					plugin.deactivate();
				}else{
					plugin.activate();
				}
			});
			
		},
		
		// bind click, mousemove events and show color panel
		activate: function(){
		
			if(plugin.isActivated()){ return false; }

			$('html').addClass('jdpicker-cursor');

			// onMouseMove callback
			$(document).unbind('mousemove.dpicker').bind('mousemove.dpicker', function(e){
				if(typeof plugin.config.onMouseMove == 'function'){
					plugin.config.onMouseMove(e);
				}else{
					plugin.onMouseMove(e);
				}
			});

			// select color
			$(document).unbind('click.dpicker').bind('click.dpicker', function(e){

				e.preventDefault();
				e.stopPropagation();

				// select color on all elements except 'infoPanel' and 'activation' element
				if($(e.target).is('#'+ plugin._mainObj.attr('id') +',#'+ plugin._mainObj.attr('id') +' *')
					|| $(e.target).is('div#djqcpPanel, div#djqcpPanel *')
				){
					return;
				}

				if(typeof plugin.config.onSelectColor == 'function'){
					plugin.config.onSelectColor(e);
				}else{
					switch(plugin._status){
						case plugin.const.STATUS_COLOR_SELECTED:
							plugin._status = plugin.const.STATUS_COLOR_NOT_SELECTED;
							$('input#djqcpOutText').css({
								border: ''
							});
							break;

						case plugin.const.STATUS_COLOR_NOT_SELECTED:
							plugin._status = plugin.const.STATUS_COLOR_SELECTED;
							var bcolor = (plugin._lastColor == '') ? '#cbb' : plugin._lastColor;
							$('input#djqcpOutText').css({
								border: '2px solid '+ bcolor
							});
							break;
					}
					plugin.onSelectColor(e);
				}
			});

			plugin.showPanel();

			plugin._status = plugin.const.STATUS_COLOR_NOT_SELECTED;
		},
		
		// unbind plugin events and remove color panel
		deactivate: function(){
			$(document).not(plugin._mainObj).unbind('.dpicker');
			$('html').removeClass('jdpicker-cursor');
			plugin.hidePanel();
			plugin._status = plugin.const.STATUS_COLOR_NOT_SELECTED;

		},
		
		// click event on target color element
		onSelectColor: function(e){
			if(plugin._lastColor == ''){
				plugin._lastColor = plugin.getColor(e);
			}
			
			plugin.setPanelInfo(plugin._lastColor);
		},
		
		// mousemove event on target color element
		onMouseMove: function(e){
			if(plugin._status == plugin.const.STATUS_COLOR_SELECTED){ return false; }
			plugin._lastColor = plugin.getColor(e);
			plugin.setPanelInfo(plugin._lastColor);
		},

		// check if dpicker is activated
		isActivated: function(){
			if($('div#djqcpPanel').length){
				return true;
			}else{
				return false;
			}
		},

		// show color info panel
		showPanel: function(){
			if(!plugin.config.showInfoPanel){
				return false;
			}
			
			$('body').append(plugin.config.panel);
			$('#djqcpClose').bind('click.dpicker', function(){
				plugin.deactivate();
				plugin.hidePanel();
			});

			$('input#djqcpOutText')
				.unbind('keyup.dpicker')
				.bind('keyup.dpicker', function(){
					$('#djqcpOutColor').css('background-color', $(this).val());
				});
		},
		
		// remove hide info panel
		hidePanel: function(){
			$('#djqcpPanel').remove();
		},

		// fill panel info
		setPanelInfo: function(color){
			$('#djqcpOutText').val(color);
			$('#djqcpOutColor').css('background-color', color);
		},
		
		// get color from html object and convert to #hex
		getColor: function(event){
			var color = false;
			if($(event.target).prop('tagName').toLowerCase() == 'img'){
				color = plugin._getImgColor(event);
			}else{
				color = plugin._getTextElementColor(event);
			}

			var rgb;
			if(	typeof color == 'string' 
				&& (rgb = plugin._rgbUnpack(color))
			){
				color = plugin._rgb2hex(rgb[2], rgb[3], rgb[4]);
			}
			
			return color;
		},
		
		// get current pixel color from img
		_getImgColor: function(e){
			var color = '';
			try {
				if(!e.target.canvas) {
					var canvas = document.createElement('canvas');
					canvas.width = e.target.width;
					canvas.height = e.target.height;
					e.target.canvas = canvas;
					e.target.canvas.getContext('2d').drawImage(e.target, 0, 0, e.target.width, e.target.height);
				}

				var offsetX, offsetY;
				if(typeof e.offsetX !== 'undefined'){
					offsetX = e.offsetX;
					offsetY = e.offsetY;
				}else{
					offsetX = e.pageX - $(e.target.canvas).offset().left;
					offsetY = e.pageY - $(e.target.canvas).offset().top;
				}

				var pixelData = e.target.canvas.getContext('2d').getImageData(offsetX, offsetY, 1, 1).data;
				color = plugin._rgb2hex(pixelData[0], pixelData[1], pixelData[2]);
			} catch(err){
				$.error(err.message);
			}

			return color;
		},
		
		// TODO:
		_getTextElementColor: function(e){
			var obj = e.target;
			var color = '', rgb = '';

			if(color == ''){
				color = obj.style.color;
				if(!plugin._is_color(color)){
					color = '';
				}
			}

			if(color == ''){
				color = obj.style.backgroundColor;
				if(!plugin._is_color(color)){
					color = '';
				}
			}

			if(color == ''){
				color = $(obj).css('color');
				rgb = plugin._rgbUnpack(color);
				if(rgb.length >= 5
					&& rgb[2] == 0
					&& rgb[3] == 0
					&& rgb[4] == 0
				){
					color = '';
				}
			}

			if(color == ''){
				color = $(obj).css('background-color');
				rgb = plugin._rgbUnpack(color);
				if(rgb.length >= 5
					&& rgb[2] == 0
					&& rgb[3] == 0
					&& rgb[4] == 0
				){
					color = '';
				}
			}
			
			if(color == ''){
				color = '#ffffff';
			}
			
			return color;
		},
		
		// convert rgb values to #hex string
		_rgb2hex: function(r,g,b){
			var hexDigits = new Array('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f');
			r = hexDigits[(r - r % 16) / 16] + hexDigits[r % 16];
			g = hexDigits[(g - g % 16) / 16] + hexDigits[g % 16];
			b = hexDigits[(b - b % 16) / 16] + hexDigits[b % 16];
			return '#'+ r + g + b;
		},

		_rgbUnpack: function(rgbStr){
			return rgbStr.match(/rgb(a)?\(([0-9]+)\,\s?([0-9]+)\,\s?([0-9]+)(,\s?[0-9]+)?\)/);
		},

		_is_color: function(color){
			if(typeof color === 'string'
				&& (
					color.match(/rgb(a)?\(([0-9]+)\,\s?([0-9]+)\,\s?([0-9]+)(,\s?[0-9]+)?\)/)
					|| color.match(/^#[0-9]{3}$|^#[0-9]{6}$/)
				)
			){
				return true;
			}
			return false;
		}
	};

	$.fn.dpicker = function( method ){
		
		if ( plugin[method] ) {
			return plugin[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || !method ) {
			return plugin.init.apply( this, arguments );
		} else {
			$.error( 'Method not found' );
		}
		
	};

	if(typeof $.dpicker === 'undefined'){
		$.dpicker = $.fn.dpicker;
	}
	
})(jQuery);
