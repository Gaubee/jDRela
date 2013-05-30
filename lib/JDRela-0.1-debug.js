var JDRelaFac = require("./JDRela-0.1.js").JDRelaFac;

console.log("\n---\n---Object&Simple demo---------------\n---");

var myGamil = JDRelaFac("@gmail.com");
var nameLog = JDRelaFac("");

var myname = JDRelaFac({
	firstName:"gaubee",
	lastName:"Bangeel",
	fullName:""
});

myname.lead({
	follower:[myname,nameLog],
	key:["firstName","lastName"],
	trigger:function(keysHashTable,changeMes){
		if(this.follower === nameLog){
			this.follower.set(
				this.follower.get()+keysHashTable["firstName"]+" "+keysHashTable["lastName"]+"|"
			)
		}else{
			this.follower.set({
				fullName:keysHashTable["firstName"]+" "+keysHashTable["lastName"]
			})
		}
	}
});

myGamil.follow({
	leader:myGamil,
	key:"per",
	trigger:function(keysHashTable,changeMes){
		this.follower.set(keysHashTable.per + this.leader.get("las"));
	}
})

myGamil.follow({
	leader:myname,
	key:"fullName",
	trigger:function(keysHashTable,changeMes){
		var name = this.leader.get(["firstName","lastName"]);
		this.follower.set(name.firstName+name.lastName);
	}
});

myname.set({
	firstName:"Gaubee"
})
console.log("\n---fullName---");
console.log(myname.get("fullName"));
console.log("\n---name changed logs---");
console.log(nameLog.get());
console.log("\n---myGamil---");
console.log(myGamil.get());

myname.set({
	firstName:"Hello",
	lastName:"World"
})
console.log("\n---fullName---");
console.log(myname.get("fullName"));
console.log("\n---name changed logs---");
console.log(nameLog.get());
console.log("\n---myGamil---");
console.log(myGamil.get());



console.log("\n---\n---Array demo---------------\n---");

var a1 = JDRelaFac([
	"name",
	"age",
	"sex"
	]);

var a2 = JDRelaFac([
	"name",
	"age",
	"sex"
	]);

a2.followArray({
	leader:a1,
	key:"T",
	trigger:function(keysHashTable,changeMes){
		var f = this.follower.get(),
			l = this.leader.get()
			;
		console.log("follower:"+f+"	leader:"+l);
	}
},function(leader,follower){
	return follower.index === leader.index
});

console.log("\n---no catch relative:---");

a1.setEach(function(element,index,array){
	var newval = element.get()+Math.random();
	element.set(newval);
	return {"T":true};
});

console.log("\n---change index:---");

a2.forEach(function(element,index,array){
	element.index = index+1;
});

a1.setEach(function(element,index,array){
	var newval = element.get()+Math.random();
	element.set(newval);
	return {"T":newval};
});

console.log("------------------");

console.log("\n---catch relative:---");

a2.followArray({
	leader:a1,
	key:"G",
	cache:true,
	trigger:function(keysHashTable,changeMes){
		var f = this.follower.get(),
			l = this.leader.get()
			;
		console.log("follower:"+f+"	leader:"+l);
	}
},function(leader,follower){
	return follower.index === leader.index;
});

a1.setEach(function(element,index,array){
	return {"G":false};
});

console.log("\n---change index:---");

a2.forEach(function(element,index,array){
	element.index = index;
});

a1.setEach(function(element,index,array){
	return {"G":false};
});