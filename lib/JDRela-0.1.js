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
	function ObjectFac(){};
	function SimpleFac(){};
	function ArrayFac(){};
	function FunctionFac(){};

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
	SimpleFac.prototype = new ObjectFac();
	SimpleFac.prototype.set = function(val){
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
	};
	SimpleFac.prototype.get = function(key){
		var self = this;
		if (arguments.length === 0) {
			return self.__private__._content;
		}
		if (JDRela.getType(key) === JDRela.TYPENUM.Array) {
			return this.multipleGet(key);
		}else{
			return self.__private__._hashTable[key];
		}
	};
	SimpleFac.prototype.hashTableSet = function(hashTable){
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
	};

	ArrayFac.prototype = new ObjectFac();
	ArrayFac.prototype.getEach = function(key){
		var self = this,
			__private__ = self.__private__,
			result = {},
			perItem,
			i
			;
		if(arguments.length === 0){
			for(i = __private__._length-1;i>=0;i-=1){
				perItem = __private__._hashTable[i];
				result[perItem.key] = perItem.get();
			}
		}else{
			for(i = __private__._length-1;i>=0;i-=1){
				perItem = __private__._hashTable[i];
				result[perItem.key] = perItem.get(key);
			}
		}
		return result;
	};
	ArrayFac.prototype.forEach = function(callback,scope){
		var self = this,
			__private__ = self.__private__,
			list = __private__._hashTable,
			i
			;
		for(i = __private__._length - 1;i>=0;i-=1){
			callback.call(scope,list[i],i,list);
		}
	};
	ArrayFac.prototype.setEach = function(callback,scope){
		var self = this,
			__private__ = self.__private__,
			result = {},
			obj
			;
		self.forEach(function(element,index,array){
			obj = callback.call(scope,element,index,array);
			result[element.key] = element.set(obj);
		})
		return result;
	};
	ArrayFac.prototype.followArray = function(followMes,matchCallback){
		var self = this,
			leaderArray = followMes.leader,
			trigger
			;
		self.forEach(function(followElement,followIndex,followArray){
			leaderArray.forEach(function(leaderElement,leaderIndex,leaderArray){
				if(followMes.cache === true){//cache follow
					if(matchCallback(leaderElement,followElement) === true){
						followElement.follow({
							leader:leaderElement,
							key:followMes.key,
							trigger:followMes.trigger
						})
					}
				}else{//follow every leader
					trigger = function(keysHashTable,changeMes){
						if(matchCallback(this.leader,this.follower) === true){
							followMes.trigger.call(this,keysHashTable,changeMes);
						}
					}
					followElement.follow({
						leader:leaderElement,
						key:followMes.key,
						trigger:trigger
					});
				}

			});
		});
	};
	ArrayFac.prototype.leadArray = function(leaderMes,matchCallback){
		var self = this,
			leaderArray = leaderMes.follower,
			trigger
			;
		self.forEach(function(leaderElement,followIndex,followArray){
			leaderArray.forEach(function(followElement,leaderIndex,leaderArray){
				if(leaderMes.cache === true){//cache lead
					if(matchCallback(followElement,leaderElement) === true){
						leaderElement.lead({
							follower:followElement,
							key:leaderMes.key,
							trigger:leaderMes.trigger
						})
					}
				}else{//lead every follower
					trigger = function(keysHashTable,changeMes){
						if(matchCallback(this.leader,this.follower) === true){
							leaderMes.trigger.call(this,keysHashTable,changeMes);
						}
					}
					leaderElement.lead({
						follower:followElement,
						key:leaderMes.key,
						trigger:trigger
					});
				}

			});
		});
	};

	FunctionFac.prototype = new ObjectFac();

	function JDRela (obj) {
		if(arguments.length === 0){
			return;
		}
		var JDRelaObjBase = new BaseFac(obj),
			id = JDRelaObjBase._id,
			JDRelaObj = null,
			type = JDRela.getType(obj),
			globalTypeName = type.replace("[object ","").replace("]",""),
			key = arguments[1],
			leaderMes_1 = arguments[1],
			leaderMes_2 = arguments[2],
			funLeader_1,
			funLeader_2,
			i
			;
		if(leaderMes_1&&leaderMes_2){//for DOM
			funLeader_1 = JDRela.isJDRela(leaderMes_1.object)?leaderMes_1.object:JDRela(leaderMes_1.object);
			funLeader_2 = JDRela.isJDRela(leaderMes_2.object)?leaderMes_2.object:JDRela(leaderMes_2.object);
		}
		switch(type){
			case JDRela.TYPENUM.String:
				JDRela.prototype = new SimpleFac();
				break;
			case JDRela.TYPENUM.Number:
				JDRela.prototype = new SimpleFac();
				break;
			case JDRela.TYPENUM.Boolean:
				JDRela.prototype = new SimpleFac();
				break;
			case JDRela.TYPENUM.Object:
				JDRela.prototype = new ObjectFac();// = Operator will overwrite the last prototype, keeping the object independent
				break;
			case JDRela.TYPENUM.Array:
				JDRelaObjBase._length = obj.length;
				JDRelaObjBase._key = key;
				for(i = JDRelaObjBase._length - 1;i>=0;i-=1){
					JDRelaObjBase._hashTable[i] = JDRela(obj[i]);
					JDRelaObjBase._hashTable[i].index = i;
					JDRelaObjBase._hashTable[i].key = key!==undefined ? obj[i].key : i;
				}
				JDRela.prototype = new ArrayFac();
				break;
			case JDRela.TYPENUM.Function:
				JDRela.prototype = new FunctionFac();
				funLeader_1.lead({
					follower:funLeader_2,
					key:leaderMes_1.key,
					trigger:obj
				});
				funLeader_2.lead({
					follower:funLeader_1,
					key:leaderMes_2.key,
					trigger:obj
				});
				break;
			default:
				JDRela.prototype = new ObjectFac();
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
		initJDRela.call(JDRelaObj,id,globalTypeName);
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
			item,
			cacheFun;
		for(itemName in obj){
			if(!obj.hasOwnProperty(itemName)){
				continue;
			}
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
					if(this.isJDRela(item) === true){
						hashTable[itemName] = item;
					}else{
						this.getHash(item,itemName,hashTable);
					}
					break;
				case JDRela.TYPENUM.Array:
					hashTable[itemName] = item;
					break;
				case JDRela.TYPENUM.Function:
					//重写toString?
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
		if(obj&&obj.jquery){
			return "[object NodeList]";
		}
		return Object.prototype.toString.call(obj);
	};
	JDRela.isJDRela = function(obj){
		var result = false;
		if(obj.mark === "JDRela"){
			if($$[obj.id].JDRelaObj === obj){
				result = true;
			}
		}
		return result;
	}
	JDRela.TYPENUM = {
		String:"[object String]",
		Number:"[object Number]",
		Boolean:"[object Boolean]",
		Object:"[object Object]",
		Array:"[object Array]",
		Function:"[object Function]",
	};


	return JDRela;
}(GLOBAL||WINDOW||this));

try{
	exports.JDRelaFac = JDRelaFac;
}catch(e){
	console.log("your environment is Browser side ."+e.message);
}