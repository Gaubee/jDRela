try{var WINDOW = window;}catch(e){WINDOW = null}
try{var GLOBAL = global;}catch(e){GLOBAL = null}

var JDRelaFac = (function(G,undefined){
	"use strict";
	var $$ = [];
	var __id = 0;
	function initJDRela(id,type){
		this.id = id;
		this.type = type;
		this.mark = "JDRela";
	}
	function ObjectFac(id,type){
		initJDRela.call(this,id,type);
	};
	function SimpleFac(id,type){
		initJDRela.call(this,id,type);
	};
	function ArrayFac(id,type){
		initJDRela.call(this,id,type);
	};
	function FunctionFac(id,type){
		initJDRela.call(this,id,type);
	};

	function BaseFac(baseContent){
		this._content = baseContent;
		this._hashTable = JDRela.getHash(baseContent);
		this._follow = {};
		this._id = __id; __id+=1;
		this.__follow_success = {};//default is successfully changed
	};
	BaseFac.prototype = {
		_leader:function(leaderMes){
			var __private__ = this,
				self = $$[__private__._id].JDRelaObj,
				i
				;
			for(i = leaderMes.followers.length-1;i>=0;i-=1){
				__private__.pushFollowerKeys({
					peer:leaderMes.followingKeys,
					trigger:leaderMes.trigger,
					follower:leaderMes.followers[i]
				});
			}
		},
		_update:function(changeMes){//success warn error
			var self = $$[this._id].JDRelaObj,
				successHashTable = changeMes.success,
				successTriggerHashs = "|",//Every trigger will only be executed once
				perFollowMes,
				item,
				i,
				j
				;
			for(item in successHashTable){
				perFollowMes = this.__follow_success[item];
				if(perFollowMes!==undefined){
					for(i=perFollowMes.length-1;i>=0;i -= 1){
						if(successTriggerHashs.indexOf("|"+perFollowMes[i].hashId+"|") === -1){
							perFollowMes[i].trigger.call({
								leader:self,
								follower:perFollowMes[i].follower
							},self.multipleGet(perFollowMes[i].peer),changeMes);
							successTriggerHashs += perFollowMes[i].hashId+"|";
						}
					}
				}
			}
		},
		pushFollowerKeys:function(position){
			var __private__ = this,
				keys = position.peer,
				Length = keys.length,
				perFollowMes,
				followMes = {//will be extended more and more configuration
					trigger:position.trigger,
					hashId:parseInt(Math.random().toString().substring(2),10).toString(36),
					peer:keys,
					follower:position.follower
				},
				i
				;
			for(i = 0;i<Length;i+=1){
				perFollowMes = __private__.__follow_success[keys[i]];
				if(perFollowMes === undefined){
					__private__.__follow_success[keys[i]] = [followMes];
				}else{
					perFollowMes[perFollowMes.length] = followMes;
				}
			}
		}
	};
	function LeaderFac(position){
		if(JDRela.getType(position.follower) === JDRela.TYPENUM.Array){
			this.followers = position.follower;//JDRelaObjs
		}else{
			this.followers = [position.follower];
		}
	};
	LeaderFac.prototype = {
		trigger:function(followHashTable,changeMes){
			this.hashTableSet(followHashTable);
		}
	};
	ObjectFac.prototype = {
		get:function(key){
			var self = this;
			if (JDRela.getType(key) === JDRela.TYPENUM.Array) {
				return this.multipleGet(key);
			}else{
				return self.__private__._hashTable[key];
			}
		},
		multipleGet:function(keys){
			var self = this,
				_hashTable = self.__private__._hashTable,
				result = {},
				i,
				Length = keys.length,
				key
				;
			for(i = 0;i<Length;i+=1){
				key = keys[i];
				result[key] = _hashTable[key];
			}
			return result;
		},
		set:function(obj){
			var self = this,
				hashTable = JDRela.getHash(obj),
				changeMes = this.hashTableSet(hashTable)
				;
			return changeMes;
		},
		hashTableSet:function(hashTable){
			var self = this,
				__private__ = self.__private__,
				_hashTable = __private__._hashTable,
				changeMes = {
					success:{},
					warn:{},
					error:{}
				},
				item,
				itemContent
				;
			for(item in hashTable){
				itemContent = hashTable[item];
				if(_hashTable.hasOwnProperty(item)){
					if(_hashTable[item] === itemContent){
						changeMes.warn[item] = itemContent;
					}else{
						_hashTable[item] = itemContent;
						changeMes.success[item] = itemContent;
					}
				}else{
					changeMes.error[item] = itemContent;
				}
			}
			__private__._update(changeMes);
			return changeMes;
		},
		id:NaN,
		follow:function(followMes){
			var self = this,
				__private__ = self.__private__,
				leaderMes = new LeaderFac({
					follower:self
				}),
				i,
				leaderLength = followMes.leader.Length
				;
			/*+init leaderMes*/
			switch(JDRela.getType(followMes.key)){
				case JDRela.TYPENUM.Array:
					leaderMes.followingKeys = followMes.key;
					break;
				case JDRela.TYPENUM.String:
					leaderMes.followingKeys = [followMes.key];
					break;
				default:
					break;
			}
			if(followMes.trigger){
				leaderMes.trigger = followMes.trigger;
			}
			/*-init leaderMes*/
			
			switch(JDRela.getType(followMes.leader)){
				case JDRela.TYPENUM.Object:
					// followMes.leader.leader(leaderMes);
					$$[followMes.leader.id].__private__._leader(leaderMes);
					break;
				case JDRela.TYPENUM.Array:
					for(i = 0;i<leaderLength;i+=1){
						// followMes.leader[i].leader(leaderMes);
						$$[followMes.leader[i].id].__private__._leader(leaderMes);
					}
					break;
				default:
					break;
			}
		},
		lead:function(leaderBaseMes){
			var self = this,
				leaderMes = new LeaderFac({
					follower:leaderBaseMes.follower
				})
				;

			switch(JDRela.getType(leaderBaseMes.key)){
				case JDRela.TYPENUM.Array:
					leaderMes.followingKeys = leaderBaseMes.key;
					break;
				case JDRela.TYPENUM.String:
					leaderMes.followingKeys = [leaderBaseMes.key];
					break;
				default:
					break;
			}
			if (leaderBaseMes.trigger) {
				leaderMes.trigger = leaderBaseMes.trigger;
			};
			self.__private__._leader(leaderMes);
		},
		destroy:function(){
			var self = this,
				__private__ = self.__private__,
				item
				;
			$$[__private__._id] = null;
			for(item in __private__){
				if(__private__.hasOwnProperty(item)){
					delete __private__[item];
				}
			}
		},
		toString:function(){
			return "[object JDRela]";
		}
	};
	SimpleFac.prototype = {
		set:function(val){
			var self = this,
				__private__ = self.__private__,
				hashTable = JDRela.getHash(val),
				changeMes,// = this.hashTableSet(hashTable)
				type = JDRela.getType(val)
				;
			switch(type){
				case JDRela.TYPENUM.Object:
					changeMes = self.hashTableSet(hashTable);
					break;
				case JDRela.TYPENUM.Array:
					changeMes = self.hashTableSet(hashTable);
					break;
				case JDRela.TYPENUM.Function:
					changeMes = self.hashTableSet(hashTable);
					break;
				default:
					if (val !== $$[self.id].__private__._content) {
						try{
							val = G[self.type](val).valueOf();
							__private__._content = val;
							changeMes = true;
						}catch(e){
							changeMes = false;
							throw "Simple set error:"+e.message;
						}
					}else{
						changeMes = false;
					}
					break;
			}
			return changeMes;
		},
		get:function(key){
			if (arguments.length === 0) {
				return this.__private__._content;
			}
			var self = this;
			if (JDRela.getType(key) === JDRela.TYPENUM.Array) {
				return this.multipleGet(key);
			}else{
				return self.__private__._hashTable[key];
			}
		},
		multipleGet:function(keys){
			var self = this,
				_hashTable = self.__private__._hashTable,
				result = {},
				i,
				Length = keys.length,
				key
				;
			for(i = 0;i<Length;i+=1){
				key = keys[i];
				result[key] = _hashTable[key];
			}
			return result;
		},
		id:NaN,
		hashTableSet:function(hashTable){
			var self = this,
				__private__ = self.__private__,
				changeMes = {
					success:hashTable,
					warn:{},
					error:{}
				}
				;
			__private__._hashTable = hashTable;
			__private__._update(changeMes);
			return changeMes;
		},
		follow:function(followMes){
			var self = this,
				__private__ = self.__private__,
				leaderMes = new LeaderFac({
					follower:self
				}),
				i,
				leaderLength = followMes.leader.Length
				;
			/*+init leaderMes*/
			switch(JDRela.getType(followMes.key)){
				case JDRela.TYPENUM.Array:
					leaderMes.followingKeys = followMes.key;
					break;
				case JDRela.TYPENUM.String:
					leaderMes.followingKeys = [followMes.key];
					break;
				default:
					break;
			}
			if(followMes.trigger){
				leaderMes.trigger = followMes.trigger;
			}
			/*-init leaderMes*/
			
			switch(JDRela.getType(followMes.leader)){
				case JDRela.TYPENUM.Object:
					// followMes.leader.leader(leaderMes);
					$$[followMes.leader.id].__private__._leader(leaderMes);
					break;
				case JDRela.TYPENUM.Array:
					for(i = 0;i<leaderLength;i+=1){
						// followMes.leader[i].leader(leaderMes);
						$$[followMes.leader[i].id].__private__._leader(leaderMes);
					}
					break;
				default:
					break;
			}
		},
		lead:function(leaderBaseMes){
			var self = this,
				leaderMes = new LeaderFac({
					follower:leaderBaseMes.follower
				})
				;

			switch(JDRela.getType(leaderBaseMes.key)){
				case JDRela.TYPENUM.Array:
					leaderMes.followingKeys = leaderBaseMes.key;
					break;
				case JDRela.TYPENUM.String:
					leaderMes.followingKeys = [leaderBaseMes.key];
					break;
				default:
					break;
			}
			if (leaderBaseMes.trigger) {
				leaderMes.trigger = leaderBaseMes.trigger;
			};
			self.__private__._leader(leaderMes);
		},
		destroy:function(){
			var self = this,
				__private__ = self.__private__,
				item
				;
			$$[__private__._id] = null;
			for(item in __private__){
				if(__private__.hasOwnProperty(item)){
					delete __private__[item];
				}
			}
		},
	}
	function JDRela (obj) {
		if(arguments.length === 0){
			return;
		}
		var JDRelaObjBase = new BaseFac(obj),
			id = JDRelaObjBase._id,
			JDRelaObj = null,
			type = JDRela.getType(obj)
			;
		switch(type){
			case JDRela.TYPENUM.String:
				JDRela.prototype = new SimpleFac(id,"String");
				break;
			case JDRela.TYPENUM.Number:
				JDRela.prototype = new SimpleFac(id,"Number");
				break;
			case JDRela.TYPENUM.Boolean:
				JDRela.prototype = new SimpleFac(id,"Boolean");
				break;
			case JDRela.TYPENUM.Object:
				JDRela.prototype = new ObjectFac(id,"Object");// = Operator will overwrite the last prototype, keeping the object independent
				break;
			case JDRela.TYPENUM.Array:
				JDRela.prototype = new ArrayFac(id,"Array");
				break;
			case JDRela.TYPENUM.Function:
				JDRela.prototype = new FunctionFac(id,"Function");
				break;
			default:
				JDRela.prototype = new ObjectFac(id,type.replace("[object ",""),replace("]",""));
				break;
		}
		if(Object.defineProperty){
			Object.defineProperty(JDRela.prototype,"__private__",{
				enumerable: false,
				value: JDRelaObjBase
			});
		}else{
			JDRela.prototype.__private__ = JDRelaObjBase;
		}
		JDRelaObj = new JDRela();
		$$[id] = {
			"JDRelaObj":JDRelaObj,
			"__private__":JDRelaObjBase
		};
		return JDRelaObj;
	}

	JDRela.getHash = function(obj,history,hashTable){
		history = history||"";
		hashTable = hashTable||{};
		var itemName,
			item;
		for(itemName in obj){
			item = obj[itemName];
			itemName = history?history+"."+itemName:itemName;
			switch(this.getType(item)){
				case JDRela.TYPENUM.String:
					hashTable[itemName] = item;
					break;
				case JDRela.TYPENUM.Number:
					hashTable[itemName] = item;
					break;
				case JDRela.TYPENUM.Boolean:
					hashTable[itemName] = item;
					break;
				case JDRela.TYPENUM.Object:
					this.getHash(item,itemName,hashTable);
					break;
				case JDRela.TYPENUM.Array:
					hashTable[itemName] = item;
					break;
				case JDRela.TYPENUM.Function:
					//将this对象指向JDRela对象，并重写toString
					hashTable[itemName] = item;
					break;
				default://null undefined html-object extend-object
					hashTable[itemName] = item;
					break;
			}
		}
		return hashTable;
	};
	JDRela.getType = function(obj){
		return Object.prototype.toString.call(obj);
	};
	JDRela.TYPENUM = {
		String:"[object String]",
		Number:"[object Number]",
		Boolean:"[object Boolean]",
		Object:"[object Object]",
		Array:"[object Array]",
		Function:"[object Function]",
	}

	return JDRela;
}(GLOBAL||WINDOW||this));

try{
	exports.JDRelaFac = JDRelaFac;
}catch(e){
	console.log("your environment is Browser side ."+e.message);
}