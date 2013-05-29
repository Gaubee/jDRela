var JDRelaFac = require("./JDRela-0.1.js").JDRelaFac;

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