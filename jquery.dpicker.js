(function( $ ){
	
	var plugin = {
		
		config: {
			onSelectColor: null,	// onSelectColor(event) callback
			onMouseMove: null,		// onMouseMove(event) callback
			
			showInfoPanel: true,	// show color info panel
			
			panel: '<div id="djqcpPanel" style="border: 1px solid #999; background-color:#cccccc; position: fixed; top:5px; right: 5px; width:130px; height:25px;"><div id="djqcpOutColor" style="float:left; width:25px; height:25px;"></div><div id="djqcpOutText" style="float:left;"></div><div id="djqcpClose" style="padding-right:2px; float:right;"><b>x</b></div></div>'
		},
		
		_lastColor: '',
		
		init: function(opt){
			$.extend(plugin.config, opt);
			
			if((typeof plugin.config.onSelectColor == 'function'
				|| typeof plugin.config.onMouseMove == 'function'
				) && !opt.showInfoPanel
			){
				plugin.config.showInfoPanel = false;
			}
			
			return this.bind('click.dpicker', function(){
				
				if(plugin.isActivated()){
					plugin.deactivate();
				}else{
					plugin.activate();
				}
			});
			
		},
		
		// bind click, mousemove events and show color panel
		activate: function(){
		
			if(plugin.isActivated()){ return; }
			
			$(document).bind('mousemove.dpicker', function(e){
				if(typeof plugin.config.onMouseMove == 'function'){
					plugin.config.onMouseMove(e);
				}else{
					plugin.onMouseMove(e);
				}
			});
			
			$(document).bind('click.dpicker', function(e){
				e.preventDefault();
				e.stopPropagation();
				
				if(typeof plugin.config.onSelectColor == 'function'){
					plugin.config.onSelectColor(e);
				}else{
					plugin.onSelectColor(e);
				}
			});
			
			$('body, a').css('cursor', 'crosshair');
			
			plugin.showPanel();
		},
		
		// unbind plugin events and remove color panel
		deactivate: function(){
			$(document).unbind('.dpicker');
			plugin.hidePanel();
		},
		
		// click event on target color element
		onSelectColor: function(e){
			$('body, a').css('cursor', '');
			//$(document).unbind('mousemove.dpicker');
			
			if(plugin._lastColor == ''){
				plugin._lastColor = plugin.getColor(e.target);
			}
			
			plugin.setPanelInfo(plugin._lastColor);
		},
		
		// mousemove event on target color element
		onMouseMove: function(e){
			plugin._lastColor = plugin.getColor(e.target);
			plugin.setPanelInfo(plugin._lastColor);
		},
		
		// check if dpicker is activated
		isActivated: function(){
			if($('#djqcpPanel').length){
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
			
			$('body').append($(plugin.config.panel));
			$('#djqcpClose').bind('click.dpicker', function(){
				plugin.deactivate();
			});
		},
		
		// remove hide info panel
		hidePanel: function(){
			$('#djqcpPanel').remove();
		},
		
		setPanelInfo: function(color){
			$('#djqcpOutText').text(color);
			$('#djqcpOutColor').css('background-color', color);
		},
		
		// get color from html object and convert to #hex
		getColor: function(obj){
			var color = false;
			if($(obj).prop('tagName').toLowerCase() == 'img'){
				color = plugin._getImgColor(obj);
			}else{
				color = plugin._getTextElementColor(obj);
			}
			
			if(	typeof color == 'string' 
				&& (rgb = color.match(/rgb(a)?\(([0-9]+)\,\s?([0-9]+)\,\s?([0-9]+)(,\s?[0-9]+)?\)/))
			){
				color = plugin._rgb2hex(rgb[2], rgb[3], rgb[4]);
			}
			
			return color;
		},
		
		// get current pixel color from img
		_getImgColor: function(obj){
			// TODO
		},
		
		// TODO:
		_getTextElementColor: function(obj){
			var color = undefined;
			
			if(color == undefined){
				color = $(obj).css('background-color');
			}
			
			if(color == undefined){
				color = $(obj).css('border-color');
			}
			
			if(color == undefined){
				color = $(obj).css('color');
			}
			
			if(color == undefined){
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
		}
	};
	
	var self = plugin;
	
	$.fn.dpicker = function( method ){
		
		if ( plugin[method] ) {
			return plugin[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || !method ) {
			return plugin.init.apply( this, arguments );
		} else {
			$.error( 'Method not found' );
		}
		
	}
	
	$.dpicker = $.fn.dpicker;
	
})(jQuery);
