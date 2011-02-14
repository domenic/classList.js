/*
 * classList.js: Implements a cross-browser element.classList getter.
 * 2011-01-24
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*jslint browser: true, eqeqeq: true, newcap: true, undef: true, strict: true, white: true */
/*global DOMException */

/*! @source https://github.com/DomenicDenicola/classList.js/file-edit/master/classList.js */

/* forked and edited by Domenic Denicola: see @source link for changelog. */

if (!("classList" in document.createElement("div"))) {
	(function () {
		//#region DOM Exception
		// Vendors: please allow content code to instantiate DOMExceptions
		function DOMEx(type, message) {
			this.name = type;
			this.code = DOMException[type];
			this.message = message;
		}
		// Most DOMException implementations don't allow calling DOMException's toString()
		// on non-DOMExceptions. Error's toString() is sufficient here.
		DOMEx.prototype = Error.prototype;
		//#endregion

		//#region ClassList helper function, constructor, and prototype modifications.
		function checkTokenAndGetIndex(classList, token) {
			if (token === "") {
				throw new DOMEx("SYNTAX_ERR", "An invalid or illegal string was specified");
			}
			if (/\s/.test(token)) {
				throw new DOMEx("INVALID_CHARACTER_ERR", "String contains an invalid character");
			}
			return Array.prototype.indexOf.call(classList, token);
		}

		function ClassList(elem) {
			var trimmedClasses = elem.className.trim();
			var classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [];

			for (var i = 0, len = classes.length; i < len; i++) {
				Array.prototype.push.call(this, classes[i]);
			}

			this._updateClassName = function () {
				elem.className = this.toString();
			};
		}
		ClassList.prototype = [];

		ClassList.prototype.item = function (i) {
			return this[i] || null;
		};
		ClassList.prototype.contains = function (token) {
			token += "";
			return checkTokenAndGetIndex(this, token) !== -1;
		};
		ClassList.prototype.add = function (token) {
			token += "";
			if (checkTokenAndGetIndex(this, token) === -1) {
				Array.prototype.push.call(this, token);
				this._updateClassName();
			}
		};
		ClassList.prototype.remove = function (token) {
			token += "";
			var index = checkTokenAndGetIndex(this, token);
			if (index !== -1) {
				Array.prototype.splice.call(this, index, 1);
				this._updateClassName();
			}
		};
		ClassList.prototype.toggle = function (token) {
			token += "";
			if (checkTokenAndGetIndex(this, token) === -1) {
				this.add(token);
			} else {
				this.remove(token);
			}
		};
		ClassList.prototype.toString = function () {
			return Array.prototype.join.call(this, " ");
		};

		// "Remove" (i.e. overwrite with undefined) all properties we've prototyped onto Array ourselves, since they will have enumerable: true.
		for (var propName in Array.prototype) {
			ClassList.prototype[propName] = undefined;
		}
		// "Remove" (i.e. overwrite with undefined) all built-in array properties.
		var builtInArrayProperties = ["concat", "every", "filter", "forEach", "indexOf", "join", "lastIndexOf", "map", "pop", "push", "reduce", "reduceRight", "reverse", "shift", "slice", "some", "sort", "splice", "toLocaleString", "unshift"];
		for (var i = 0, builtInPropName; builtInPropName = builtInArrayProperties[i]; ++i) {
			ClassList.prototype[builtInPropName] = undefined;
		}
		//#endregion

		//#region Adding the classList property to all Element objects.
		var CLASS_LIST_PROPERTY_NAME = "classList";
		function classListGetter() {
			return new ClassList(this);
		}

		if (Object.defineProperty) {
			var classListDescriptor = { get: classListGetter, enumerable: true, configurable: true };
			try {
				Object.defineProperty(Element.prototype, CLASS_LIST_PROPERTY_NAME, classListDescriptor);
			} catch (ex) { // IE 8 doesn't support enumerable: true
				if (ex.number === -0x7FF5EC54) {
					classListDescriptor.enumerable = false;
					Object.defineProperty(Element.prototype, CLASS_LIST_PROPERTY_NAME, classListDescriptor);
				} else {
					throw ex;
				}
			}
		} else if (Object.prototype.__defineGetter__) {
			Element.prototype.__defineGetter__(CLASS_LIST_PROPERTY_NAME, classListGetter);
		}
		//#endregion
	}());
}