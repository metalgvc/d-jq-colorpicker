(function( $ ){
	
	var plugin = {
		
		config: {
			onSelectColor: null,	// onSelectColor callback
			onMouseMove: null,		// onMouseMove callback
			
			panel: '<div id="djqcpPanel" style="border: 1px solid #999; background-color:#cccccc; position: fixed; top:5px; right: 5px; width:200px; height:50px;"><div id="djqcpOutText"></div><div id="djqcpOutColor" style="width:25px; height:25px;"></div><div id="djqcpClose" style="padding-right:2px; float:right;"><b>x</b></div></div>'
		},
		
		_lastColor: '',
		
		init: function(opt){
			$.extend(plugin.config, opt);
			
			return this.bind('click.dpicker', function(){
				if(plugin.isActivated()){
					plugin.deactivate();
				}else{
					plugin.activate();
				}
			});
			
		},
		
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
		
		deactivate: function(){
			$(document).unbind('.dpicker');
			plugin.hidePanel();
		},
		
		onSelectColor: function(e){
			$('body, a').css('cursor', '');
			console.log(plugin._lastColor);
			
		},
		
		onMouseMove: function(e){
			plugin._lastColor = plugin.getColor(e.target);
			$('#djqcpOutText').text(color);
			$('#djqcpOutColor').css('background-color', color);
		},
		
		isActivated: function(){
			if($('#djqcpPanel').length){
				return true;
			}else{
				return false;
			}
		},
		
		showPanel: function(){
			$('body').append($(plugin.config.panel));
			$('#djqcpClose').bind('click.dpicker', function(){
				plugin.deactivate();
			});
		},
		
		hidePanel: function(){
			$('#djqcpPanel').remove();
		},
		
		getColor: function(obj){
			var color = false;
			if($(obj).prop('tagName').toLowerCase() == 'img'){
				color = plugin._getImgColor(obj);
			}else{
				
			}
			console.log(color);
			return color;
		},
		
		_getImgColor: function(obj){
			
		}
		
	};
	
	var self = plugin;
	
	$.fn.dpicker = function( method ){
		
		/*if ( plugin[method] ) {
			return plugin[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else*/ if ( typeof method === 'object' || !method ) {
			return plugin.init.apply( this, arguments );
		} else {
			$.error( 'Method not found' );
		}
		
	}
	
})(jQuery);
