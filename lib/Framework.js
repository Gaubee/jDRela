log = console.log;

var $$ = [];
var __id = 0;
function ObjectFac(){};
function BaseFac(baseContent){
	this._content = baseContent;
	this._hashTable = JDRela.getHash(baseContent);
	this._follow = {};
	this._id = __id; __id+=1;
	this.__follow_success = {};//default is successfully changed
};
BaseFac.prototype = {
	_leader:function(leaderMes){
		var self = $$[this._id].JDRelaObj,
			__private__ = this,
			i
			;
		__private__.pushFollowerKeys(leaderMes.followingKeys,leaderMes.trigger);
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
						perFollowMes[i].trigger(self.multipleGet(perFollowMes[i].peer),changeMes);
						successTriggerHashs += perFollowMes[i].hashId+"|";
					}
				}
			}
		}
	},
	pushFollowerKeys:function(keys,trigger){
		var __private__ = this,
			Length = keys.length,
			perFollowMes,
			followMes = {//will be extended more and more configuration
				trigger:trigger,
				hashId:parseInt(Math.random().toString().substring(2)).toString(36),
				peer:keys
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
		log(__private__.__follow_success);
	}
}
function leaderFac(follower){
	this.follower = follower;//JDRelaObj
};
leaderFac.prototype = {
	trigger:function(followHashTable,changeMes){
		this.hashTableSet(followHashTable);
	}
}
ObjectFac.prototype = {
	get:function(key){
		var self = this;
		return self["__private__"]["_hashTable"][key];
	},
	multipleGet:function(keys){
		var self = this,
			_hashTable = self["__private__"]["_hashTable"],
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
		$$[self.id()]["__private__"]["_update"](changeMes);
		return changeMes;
	},
	hashTableSet:function(hashTable){
		var self = this,
			_hashTable = self["__private__"]["_hashTable"],
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
		return this["__private__"]["_id"];
	},
	follow:function(followMes){
		var self = this,
			__private__ = $$[this.id()]["__private__"],
			leaderMes = new leaderFac(self),
			i,
			leaderLength = followMes.leader.Length
			;
		/*+init leaderMes*/
		switch(JDRela.getType(followMes.key)){
			case "[object Array]":{
				leaderMes.followingKeys = followMes.key;
				break;
			}
			case "[object String]":{
				leaderMes.followingKeys = [followMes.key];
				break;
			}
			default:{
				break;
			}
		}
		if(followMes.trigger){
			leaderMes.trigger = followMes.trigger;
		}
		/*-init leaderMes*/
		
		switch(JDRela.getType(followMes.leader)){
			case "[object Object]":{
				// followMes.leader.leader(leaderMes);
				$$[followMes.leader.id()]["__private__"]["_leader"](leaderMes);
				break;
			}
			case "[object Array]":{
				for(i = 0;i<leaderLength;i+=1){
					// followMes.leader[i].leader(leaderMes);
					$$[followMes.leader[i].id()]["__private__"]["_leader"](leaderMes);
				}
				break;
			}
			default:{
				break;
			}
		}
	},
	leader:function(leaderMes){
		
	},
	destroy:function(){
		var self = this,
			__private__ = self["__private__"],
			item
			;
		$$[self.id()] = null;
		for(item in __private__){
			delete __private__[item];
		}
	},
	toString:function(){
		return "[object JDRela]";
	}
}

function JDRela(){};//JDRelaObj's name

function JDRelaFac (obj) {
	var JDRelaObjBase = new BaseFac(obj),
		JDRelaObj = null
		;
	JDRela.prototype = new ObjectFac();// = Operator will overwrite the last prototype, keeping the object independent
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
		// log()
		switch(this.getType(item)){
			case "[object String]":{
				hashTable[itemName] = item;
				break;
			}
			case "[object Number]":{
				hashTable[itemName] = item;
				break;
			}
			case "[object Boolean]":{
				hashTable[itemName] = item;
				break;
			}
			case "[object Object]":{
				this.getHash(item,itemName,hashTable);
				break;
			}
			case "[object Array]":{
				hashTable[itemName] = item;
				break;
			}
			case "[object Function]":{
				//将this对象指向JDRela对象，并重写toString
				hashTable[itemName] = item;
				break;
			}
			default:{//null undefined html-object extend-object
				hashTable[itemName] = item;
				break;
			}
		}
	}
	return hashTable;
}
JDRela.getType = function(obj){
	return Object.prototype.toString.call(obj);
}




// return JDRelaFac;




var myName = {
	firstName:"Gaubee",
	lastName:"Bangeel",
	fullName:"Gaubee Bangeel",
	Project:{
		javascript:"JDRela",
		".Net":["how","hehe"],
		"C++":{
			"js2C++":null
		}
	},
	foo:function(){
		log(this.firstName)
	}
};

var obj = JDRelaFac(myName);

log(obj.get("firstName"));

var lang = JDRelaFac({
	lang:"chinese"
})
log("---follow---");
lang.follow({
	leader:obj,
	key:"firstName",
	trigger:function(hashTable){
		log("	---begin trigger---");
		console.log(hashTable);
		lang.set({
			lang:hashTable["firstName"]
		});
		log("	---trigger over---");
	}
});
log("---change leader key---");
log(obj.set({
	firstName:"yeah!!",
	name:"gaubee",
	Project:{
		javascript:"JDRela"
	}
}));
log("---get the result---");
log(lang.get("lang"))