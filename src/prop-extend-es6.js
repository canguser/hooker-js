let util = {
    parseKeyChain: keyChain => {
        if (typeof keyChain === 'string') {
            keyChain = keyChain.split('.');
        }
        return keyChain.filter(k => typeof k === 'string').map(k => k.replace(/ /, ''));
    }
};

// init property
const prop = {};
prop.Object = {
    getProperty(_self, propertyName) {
        if (_self == null) {
            return undefined;
        }
        propertyName = util.parseKeyChain(propertyName);
        if (propertyName.length === 1) {
            return _self[propertyName[0]];
        } else if (propertyName.length > 1) {
            return prop.Object.getProperty(_self[propertyName[0]], propertyName.splice(1));
        } else {
            return undefined;
        }
    },
    setProperty(_self, propertyName, value) {
        propertyName = util.parseKeyChain(propertyName);
        if (propertyName.length === 0) {
            return true;
        }
        if (target == null) {
            return false;
        }
        if (propertyName.length === 1) {
            target[propertyName[0]] = value;
            return true;
        } else if (propertyName.length > 1) {
            let thisKey = propertyName.splice(0, 1);
            let canSet = prop.Object.setProperty(target[thisKey[0]], propertyName, value);
            if (!canSet) {
                target[thisKey[0]] = {};
                return prop.Object.setProperty(target[thisKey[0]], propertyName, value);
            }
        }
        return true;
    },
    getMapper(_self, isPositive) {
        if (isPositive == null) {
            isPositive = true;
        }
        if (isPositive) {
            return _self;
        } else {
            let resultMapper = {};
            Object.keys(_self).forEach(key => {
                let value = _self[key];
                if (typeof value === 'string') {
                    resultMapper[value] = key;
                }
            });
            return resultMapper;
        }
    },
    mapConvert(_self, mapper, reverse) {
        mapper = prop.Object.getMapper(mapper, reverse);
        let resultObject = {};
        Object.keys(mapper).forEach(key => {
            let value = prop.Object.getProperty(target, key);
            prop.Object.setProperty(resultObject, mapper[key], value);
        });
        return resultObject;
    },
    keyMap(_self, cb) {
        let result = {};
        Object.keys(_self).forEach(key => {
            result[key] = cb.call(_self, key, _self[key]);
        });
        return result;
    },
    keyValues(_self, cb) {
        Object.keys(_self).forEach(key => {
            cb.call(_self, key, _self[key]);
        });
    },
    keyFilter(_self, cb) {
        let result = {};
        Object.keys(_self).forEach(key => {
            let isKeep = cb.call(_self, key, _self[key]);
            isKeep && (result[key] = _self[key]);
        });
        return result;
    },
    getMessage(_self, deep) {
        deep == null && (deep = 10);
        if (deep <= 0) {
            return '';
        }
        if (!_self || typeof _self === 'string') {
            return _self;
        }
        return Object.keys(_self).map(key => {
            return prop.Object.getMessage(_self[key], deep--);
        });
    }
};
prop.Array = {
    keep(_self, start, end) {
        return _self.slice(start, end);
    },
    remove(_self, start, end) {
        _self.splice(start, end);
        return _self;
    },
    contains(_self, cb) {
        return _self.filter(cb).length > 0;
    }
};
prop.String = {
    join(_self, arr, delimiter) {
        delimiter || (delimiter = '');
        arr = arr.map(s => {
            if (typeof s === 'string') {
                return s;
            }
            return prop.Object.getMessage(s).join(delimiter);
        });
    },
};

// parse to prototype
Object.keys(prop).forEach(key => {
    if (window[key]) {
        Object.keys(prop[key]).forEach(fKey => {
            window[key].prototype[fKey] = function () {
                let args = [this].concat(Array.prototype.splice.call(arguments, 0));
                return prop[key][fKey].apply(this, args);
            };
        })
    }
});