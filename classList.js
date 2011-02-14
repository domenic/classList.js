/*
 * classList.js: Implements a cross-browser element.classList getter.
 * 2011-01-24
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*jslint laxbreak: true, eqeqeq: true, newcap: true, immed: true, strict: true,
  maxlen: 90 */
/*global Element */

/*! @source https://github.com/DomenicDenicola/classList.js/file-edit/master/classList.js */

/* forked and edited by Domenic Denicola: see @source link for changelog. */

if (!("classList" in document.createElement("div"))) {

(function () {

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = Element[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		for (var i = 0, len = this.length; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.className)
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
		;
		for (var i = 0, len = classes.length; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.className = this.toString();
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		var classList = new ClassList(this);

		// Remove all properties we've prototyped onto Array ourselves, since they will have enumerable: true.
		for (var propName in Array.prototype) {
			classList[propName] = undefined;
		}

		// Remove all built-in array properties.
		classList.concat = classList.every = classList.filter = classList.forEach = classList.indexOf = classList.join = classList.lastIndexOf = classList.map = classList.pop = classList.push = classList.reduce = classList.reduceRight = classList.reverse = classList.shift = classList.slice = classList.some = classList.sort = classList.splice = classList.toLocaleString = classList.unshift = undefined;

		return classList;
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function (token) {
	token += "";
	if (checkTokenAndGetIndex(this, token) === -1) {
		this.push(token);
		this._updateClassName();
	}
};
classListProto.remove = function (token) {
	token += "";
	var index = checkTokenAndGetIndex(this, token);
	if (index !== -1) {
		this.splice(index, 1);
		this._updateClassName();
	}
};
classListProto.toggle = function (token) {
	token += "";
	if (checkTokenAndGetIndex(this, token) === -1) {
		this.add(token);
	} else {
		this.remove(token);
	}
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListDescriptor = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListDescriptor);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		if (ex.number === -0x7FF5EC54) {
			classListDescriptor.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListDescriptor);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}());

}
