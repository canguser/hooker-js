/**
 * Created by Eoly on 2017/5/8.
 * Call http://palerock.cn
 */
var Ajax = function (conf) {
    if (!conf || typeof conf != 'object') {
        throw new Error('配置类型错误');
    }
    if (conf.params && typeof conf.params === 'object') {
        var params = conf.params;
        for (var name in params) {
            if (params.hasOwnProperty(name))
                if (params[name]) {
                    if (typeof params[name] != 'string') {
                        continue;
                    }
                    if (conf.url.indexOf('?') != -1) {
                        conf.url = conf.url + '&' + name + '=' + params[name];
                    } else {
                        conf.url = conf.url + '?' + name + '=' + params[name];
                    }
                }
        }
    }
    Ajax.sentRequest(conf);
    return Ajax;
};
Ajax.get = function () {
};
Ajax.then = function (suc, fail) {
    Ajax.OnSuccess = suc;
    Ajax.OnFailure = fail;
};
Ajax.OnFailure = function (result) {
};
Ajax.OnSuccess = function (result) {
};
Ajax.onReady = function (e) {
    // console.log(e.srcElement.patcherList,e);
    var element = e.srcElement;
    var result = {};
    if (element.status >= 200 && element.status < 400) {
        try {
            result.data = JSON.parse(element.responseText);
        } catch (ex) {
            result.data = element.responseText;
        }
        this.OnSuccess(result.data);
    } else if (element.status >= 400) {
        this.OnFailure(result);
    }
};
Ajax.sentRequest = function (conf) {
    var xhr = new XMLHttpRequest();
    xhr.open(conf.method, conf.url, conf.async);
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4) {
            Ajax.onReady(e)
        }
    };
    xhr.send();
};
// Ajax({
//     url: 'http://palerock.cn/h5_back/group/find-groups',
//     method: 'get',
//     params: {goodsTypeId: 11},
//     async: true
// });