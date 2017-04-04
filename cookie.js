/*
 * Copyright (c) 2017 Gregory Jackson. All rights reserved.
 */
(function (window) {
    'use strict';

    function parser(val) {
        var p;
        try {
            p = window.JSON.parse(val);
            val = typeof p === 'object' || p.toString() !== val ? p : val;
        } catch (e) {
        }
        return val;
    }

    function encoder(val) {
        try {
            val = window.JSON.stringify(val);
        } catch (e) {

        }

        return window.encodeURIComponent(val);
    }

    function copyObject(objectArray, anythingElse) {
        if (!Array.isArray(objectArray)) {
            return copyObject.call(null, Array.prototype.slice.call(arguments));
        }

        if (objectArray.length > 1) {
            for (var i = 1; i < objectArray.length; i += 1) {
                if (typeof objectArray[i] === 'object') {
                    Object.keys(objectArray[i]).forEach(function (id) {
                        objectArray[0][id] = objectArray[i][id];
                    });
                }
            }
        }

        return objectArray[0];
    }


    function Cookie(userDefaults) {
        this.defaults = {
            string: false
        };

        if (typeof userDefaults === 'object') {
            this.setDefaults(userDefaults);
        }
    }

    Cookie.prototype.getDefaults = function () {
        return copyObject({}, this.defaults);
    };

    Cookie.prototype.setDefaults = function (userDefaults) {
        var me = this;

        if (typeof userDefaults === 'object') {
            copyObject(me.defaults, userDefaults);
        } else {
            throw 'Invalid defaults parameter, object expected';
        }
    };

    Cookie.prototype.set = function (name, value, userOptions, doNotEncode) {
        var me = this,
            cString,
            options = copyObject({}, me.defaults);

        if (typeof name !== 'string' || name === '') {
            throw 'Invalid parameter, name expected';
        }

        if (value === undefined) {
            throw 'Invalid parameter, value expected';
        }

        if (options === undefined || typeof options === 'object') {
            if (typeof options === 'object') {
                copyObject(options, userOptions);
            }

            cString = window.encodeURIComponent(name) + '=' + (doNotEncode ? value.toString() : encoder(value)) +
                (options.path ? this.cookiePath(options.path) : '') +
                (options.domain ? this.cookieDomain(options.domain) : '') +
                (options.expires ? this.cookieExpires(options.expires) : (options.maxAge ? this.cookieMaxAge(options.maxAge) : '')) +
                this.cookieSecure(options.secure);

            document.cookie = cString;

            return cString;

        } else {
            throw 'Invalid parameter, object expected for options but got ' + typeof options;
        }
    };

    Cookie.prototype.cookieList = function () {
        return window.document.cookie.split('; ');
    };

    Cookie.prototype.get = function (name, verbose) {
        var me = this,
            foundCookieValue = undefined;

        if (typeof name === 'string' && name !== '') {
            me.cookieList().some(function (cookieString) {
                var eqPos = cookieString.indexOf('='),
                    cKey = window.decodeURIComponent(cookieString.substring(0, eqPos)),
                    cValue = cookieString.substring(eqPos + 1),
                    cValueDecoded;

                if (cKey === name) {
                    cValueDecoded = window.decodeURIComponent(cValue);

                    foundCookieValue = !!verbose ? me.valuesAsObject(cValue, cValueDecoded) : me.defaults.string ? cValue : parser(cValueDecoded);

                    return true;
                }

                return false;
            });

            return foundCookieValue;
        } else {
            return this.getAll(verbose);
        }
    };

    Cookie.prototype.getAll = function (verbose) {
        var me = this,
            cookieObj = {};

        me.cookieList().forEach(function (cookieString) {
            var eqPos = cookieString.indexOf('='),
                cKey = cookieString.substring(0, eqPos),
                cValue = cookieString.substring(eqPos + 1),
                cValueDecoded;

            if (cKey) {
                cValueDecoded = window.decodeURIComponent(cValue);
                cookieObj[cKey] = !!verbose ? me.valuesAsObject(cValue, cValueDecoded) : me.defaults.string ? cValue : parser(cValueDecoded);
            }
        });

        return cookieObj;
    };

    Cookie.prototype.valuesAsObject = function (cValue, cValueDecoded) {
        return {
            encoded: cValue,
            decoded: cValueDecoded,
            parsed: parser(cValueDecoded)
        };
    };

    Cookie.prototype.remove = function (name) {
        if (typeof name !== 'string' || name === '') {
            throw 'Invalid parameter, name expected';
        }

        this.set(name, '', {
            expires: -1
        });
    };

    Cookie.prototype.exist = function (name) {
        var cValue;

        if (typeof name !== 'string' || name === '') {
            throw 'Invalid parameter, name expected';
        }

        cValue = this.get(name, true);

        return !!(cValue && cValue.encoded !== '');
    };

    Cookie.prototype.cookiePath = function (path) {
        return path ? '; path=' + path : '';
    };

    Cookie.prototype.cookieDomain = function (domain) {
        return domain ? '; domain=' + domain : '';
    };

    Cookie.prototype.cookieExpires = function (expires) {
        return (expires && expires instanceof Date ? '; expires=' + expires.toUTCString() : '') +
            (expires && !(expires instanceof Date) ? '; expires=' + (new Date(expires)).toUTCString() : '');
    };

    Cookie.prototype.cookieMaxAge = function (maxAge) {
        return maxAge && !isNaN(maxAge) ? '; max-age=' + maxAge : '';
    };

    Cookie.prototype.cookieSecure = function (secure) {
        return !!secure ? '; secure' : '';
    };

    return window.Cookie = new Cookie();

})(window);
