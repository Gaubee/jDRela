$ = (function(undefined){
	"use strict";
	var $$ = [];
	var __id = 0;
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
		if(JDRela.getType(position.follower) === "[object Array]"){
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
			if (JDRela.getType(key) === "[object Array]") {
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
			$$[self.id()].__private__._update(changeMes);
			return changeMes;
		},
		hashTableSet:function(hashTable){
			var self = this,
				_hashTable = self.__private__._hashTable,
				result = {
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
						result.warn[item] = itemContent;
					}else{
						_hashTable[item] = itemContent;
						result.success[item] = itemContent;
					}
				}else{
					result.error[item] = itemContent;
				}
			}
			return result;
		},
		id:function(){
			return this.__private__._id;
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
				case "[object Array]":
					leaderMes.followingKeys = followMes.key;
					break;
				case "[object String]":
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
				case "[object Object]":
					// followMes.leader.leader(leaderMes);
					$$[followMes.leader.id()].__private__._leader(leaderMes);
					break;
				case "[object Array]":
					for(i = 0;i<leaderLength;i+=1){
						// followMes.leader[i].leader(leaderMes);
						$$[followMes.leader[i].id()].__private__._leader(leaderMes);
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
				case "[object Array]":
					leaderMes.followingKeys = leaderBaseMes.key;
					break;
				case "[object String]":
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

	function JDRela (obj) {
		if(obj === undefined){
			return;
		}
		var JDRelaObjBase = new BaseFac(obj),
			JDRelaObj = null
			;
		switch(JDRela.getType(obj)){
			case "[object String]":
				JDRela.prototype = new SimpleFac();
				break;
			case "[object Number]":
				JDRela.prototype = new SimpleFac();
				break;
			case "[object Boolean]":
				JDRela.prototype = new SimpleFac();
				break;
			case "[object Object]":
				JDRela.prototype = new ObjectFac();// = Operator will overwrite the last prototype, keeping the object independent
				break;
			case "[object Array]":
				JDRela.prototype = new ArrayFac();
				break;
			case "[object Function]":
				JDRela.prototype = new FunctionFac();
				break;
			default:
				JDRela.prototype = new ObjectFac();
				break;
		}
		JDRela.prototype.__private__ = JDRelaObjBase;
		JDRelaObj = new JDRela();
		$$[JDRelaObj.id()] = {
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
				case "[object String]":
					hashTable[itemName] = item;
					break;
				case "[object Number]":
					hashTable[itemName] = item;
					break;
				case "[object Boolean]":
					hashTable[itemName] = item;
					break;
				case "[object Object]":
					this.getHash(item,itemName,hashTable);
					break;
				case "[object Array]":
					hashTable[itemName] = item;
					break;
				case "[object Function]":
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

	return JDRela;
}());