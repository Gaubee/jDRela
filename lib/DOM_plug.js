	function DOMFac(id,type){};
	
	// DOMFac.prototype = new ObjectFac;
	DOMFac.prototype._set = DOMFac.prototype.set;
	DOMFac.prototype._hashTableSet = DOMFac.prototype.hashTableSet;
	DOMFac.prototype.set = function(obj){
		var self = this,
			result = self.hashTableSet(JDRela.getHash(obj))
			;
		return result;
	}
	DOMFac.prototype.hashTableSet = function(hashTable){
		var self = this,
			result = self._hashTableSet(hashTable),
			success = result.success,
			error = result.error,
			item,
			value,
			links,
			temp = self.__private__._content,
			i,
			Length
			;
		for(item in success){
			value = success[item];
			links = item.split(".");
			Length = links.length-1;
			for(i = 0;i<Length;i+=1){
				try{
					temp = temp[links[i]];
				}finally{
					delete success[item];
					error[item] = value;
				}
			}
			temp[links[i]] = value;
		}
		return result;
	}
	