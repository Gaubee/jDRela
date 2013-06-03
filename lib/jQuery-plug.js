(function(G,J){
	/*+ Tool*/
	var toArray = function(arrayLike,begin,end){
		return [].slice.call(arrayLike,begin,end);
	}
	var getType = function(obj){
		return Object.prototype.toString.call(obj);
	}
	/*- Tool*/
	var $Cache = {};
	var $CacheArray = [];
	var toJDRela = function(jQueryObj_DOM){
		var self = this,
			jQueryObj,
			DOM,
			Length,
			i
			;
		jQueryObj_DOM = jQueryObj_DOM||self;
		if(getType(jQueryObj_DOM) === "[object Object]"){//is jQuery obj
			Length = jQueryObj_DOM.length;
			for(i = 0;i<Length;i+=1){
				toJDRela.call(jQueryObj_DOM,jQueryObj_DOM[i]);
			}
			return;
		}else{//DOM obj
			Length = $CacheArray.length;
			DOM = jQueryObj_DOM;
			if(!DOM.isJDRela){
				$CacheArray[Length] = DOM;
				$Cache[Length] = {
					JDRelaObj:J("jQuery"),
					DOM:DOM,
					jQueryObj:(function(){var result = jQuery(DOM);result.selector = self.selector;return result;}())
				}
				DOM.isJDRela = true;
			}
		}
	}
	var getJDRela = function(DOM){

		var i,
			Length = $CacheArray.length;
		for(i = 0;i<Length;i+=1){
			if ($CacheArray[i] === DOM) {
				return $Cache[i];
			}
		}
	}
	triggerFun = function(leaderjQueryObj,followerjQueryObj,i,j,trigger){
		return function(keysHashTable,changeMes){
			trigger.call({
				leader:leaderjQueryObj,
				follower:followerjQueryObj
			},keysHashTable,i,j);
			// leaderjQueryObj = null;
			// followerjQueryObj = null;
		}
	}
	var jQueryfn = jQuery.prototype;
	var _val = jQueryfn.val;
	var _html = jQueryfn.html;
	var _text = jQueryfn.text;
	var _prop = jQueryfn.prop;
	var _attr = jQueryfn.attr;
	jQuery.fn.extend({
		toJDRela:function(){
			toJDRela.call(this);
			return this;
		},
		follow:function(followMes){
			followMes.leader.lead({
				follower:this,
				key:followMes.key,
				trigger:followMes.trigger
			});
			return this;
		},
		lead:function(leadMes){
			var follower = leadMes.follower.toJDRela();
			var leader = this.toJDRela();
			var leaderCache;
			var followerCache;
			var leaderLength = leader.length;
			var followerLength = follower.length;
			var i,j;

			for(i = 0;i<leaderLength;i+=1){
				for(j=0;j<followerLength;j+=1){
					leaderCache = getJDRela(leader[i]);
					followerCache = getJDRela(follower[j]);
					leaderCache.JDRelaObj.lead({
						follower:followerCache.JDRelaObj,
						key:leadMes.key,
						trigger:triggerFun(leaderCache.jQueryObj,followerCache.jQueryObj,i,j,leadMes.trigger)
					});
				}
			}
			return this;
		},
		followArray:function(followMes){
			var i,
				leaders = followMes.leader,
				Length = leaders.length
				;
			for(i=0;i<Length;i+=1){
				this.follow({
					leader:leaders[i],
					key:followMes.key,
					trigger:followMes.trigger
				})
			}
		},
		leadArray:function(leadMes){
			var i,
				followers = leadMes.follower,
				Length = followers.length
				;
			for(i=0;i<Length;i+=1){
				this.lead({
					follower:followers[i],
					key:leadMes.key,
					trigger:leadMes.trigger
				})
			}
		},
		val:function(){
			var result = _val.apply(this,toArray(arguments));
			if (arguments.length) {
				this.each(function(index,elem){
					var JDRelaCache = getJDRela(elem);
					if (JDRelaCache) {
						JDRelaCache.JDRelaObj.set({val:$(elem).val()});
					}
				})
			}
			return result;
		},
		html:function(){
			var result = _html.apply(this,toArray(arguments));
			if (arguments.length) {
				this.each(function(index,elem){
					var JDRelaCache = getJDRela(elem);
					if (JDRelaCache) {
						JDRelaCache.JDRelaObj.set({html:$(elem).val()});
					}
				})
			}
			return result;
		},
		text:function(){
			var result = _text.apply(this,toArray(arguments));
			if (arguments.length) {
				this.each(function(index,elem){
					var JDRelaCache = getJDRela(elem);
					if (JDRelaCache) {
						JDRelaCache.JDRelaObj.set({text:$(elem).val()});
					}
				})
			}
			return result;
		},
		prop:function(name,value){
			var result = _prop.apply(this,toArray(arguments));
			if (getType(name) === "[object String]"&&arguments.length === 2) {
				this.each(function(index,elem){
					var JDRelaCache = getJDRela(elem);
					var propHash;
					if (JDRelaCache) {
						propHash = {prop:name+":"+value};
						propHash["prop."+name] = value;
						JDRelaCache.JDRelaObj.set(propHash);
					}
				})
			}else if(getType(name) === "[object Object]"){
				this.each(function(index,elem){
					var JDRelaCache = getJDRela(elem);
					var propHash;
					if (JDRelaCache) {
						propHash = J.getHash(name);
						propHash.prop = "[object Object]";
						JDRelaCache.JDRelaObj.set(propHash);
					}
				})
			}
			return result;
		},
		attr:function(name,value){
			var result = _attr.apply(this,toArray(arguments));
			if (getType(name) === "[object String]"&&arguments.length === 2) {
				this.each(function(index,elem){
					var JDRelaCache = getJDRela(elem);
					var attrHash;
					if (JDRelaCache) {
						attrHash = {attr:name+":"+value};
						attrHash["attr."+name] = value;
						JDRelaCache.JDRelaObj.set(attrHash);
					}
				})
			}else if(getType(name) === "[object Object]"){
				this.each(function(index,elem){
					var JDRelaCache = getJDRela(elem);
					var attrHash;
					if (JDRelaCache) {
						attrHash = J.getHash(name);
						attrHash.attr = "[object Object]";
						JDRelaCache.JDRelaObj.set(attrHash);
					}
				})
			}
			return result;
		}
	});


	var jQuery_JDRela = function jQueryWithJDRela(){

	};

	jQuery_JDRela.style = jQuery.style;
	jQuery.extend({//css animate
			style:function(elem, name, value, extra ){
				var result = jQuery_JDRela.style.apply(jQuery,toArray(arguments));
				var JDRelaCache = getJDRela(elem);
				var cssHash;
				if (JDRelaCache) {
					cssName = "css."+name;
					cssHash = {css:name+":"+value};
					cssHash["css."+name] = value;
					JDRelaCache.JDRelaObj.set(cssHash);
				}
				return result;
			}
		})
	G.j$ = function(){
		var result = new jQuery_JDRela();
		var jQueryObj = jQuery.apply(this,toArray(arguments));
		var Length = jQueryObj.length,
			i,
			item,
			j,
			cacheLength = $Cache.length
			;
		for(i = 0;i<Length;i+=1){
			item = jQueryObj[i];
			for(j=0;j<cacheLength;j+=1){
				if ($Cache[j] === item) {
					break;
				}
			}
			if (j === cacheLength) {//no found,cache DOM
				toJDRela(item);
			}
		}
		for(i in jQueryObj){
			if (jQueryObj.hasOwnProperty(i)) {
				result[i] = jQueryObj[i];
			}
		}
		return result;
	}
	jQuery.toJDRela = toJDRela;
}(window,JDRelaFac,jQuery));