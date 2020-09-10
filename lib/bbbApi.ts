/* eslint-disable */
import * as crypto from 'crypto';

function fromEntries(arr) {
    return arr.reduce((ret, [key, value]) => {
        ret[key] = value;
        return ret;
    }, {});
}

export class BigBlueButtonApi {

    constructor(private url: string, private salt: string, private debug: boolean = false, private opts = { shaType: 'sha1' }) {
    }

    public availableApiCalls() {
        return ['/', 'create', 'join', 'isMeetingRunning', 'getMeetingInfo', 'end', 'getMeetings', 'getDefaultConfigXML', 'setConfigXML', 'enter', 'configXML', 'signOut', 'getRecordings', 'publishRecordings', 'deleteRecordings', 'updateRecordings', 'hooks/create'];
    }
    public urlParamsFor(param) {
        switch (param) {
            case 'create':
                return [['meetingID', true], ['name', true], ['attendeePW', false], ['moderatorPW', false], ['welcome', false], ['dialNumber', false], ['voiceBridge', false], ['webVoice', false], ['logoutURL', false], ['maxParticipants', false], ['record', false], ['duration', false], ['moderatorOnlyMessage', false], ['autoStartRecording', false], ['allowStartStopRecording', false], [/meta_\w+/, false]];
            case 'join':
                return [['fullName', true], ['meetingID', true], ['password', true], ['createTime', false], ['userID', false], ['webVoiceConf', false], ['configToken', false], ['avatarURL', false], ['redirect', false], ['clientURL', false]];
            case 'isMeetingRunning':
                return [['meetingID', true]];
            case 'end':
                return [['meetingID', true], ['password', true]];
            case 'getMeetingInfo':
                return [['meetingID', true], ['password', true]];
            case 'getRecordings':
                return [['meetingID', false], ['recordID', false], ['state', false], [/meta_\w+/, false]];
            case 'publishRecordings':
                return [['recordID', true], ['publish', true]];
            case 'deleteRecordings':
                return [['recordID', true]];
            case 'updateRecordings':
                return [['recordID', true], [/meta_\w+/, false]];
            case 'hooks/create':
                return [['callbackURL', false], ['meetingID', false]];
        }
        return [];
    }
    public filterParams(params, method) {

        const filters = this.urlParamsFor(method);
        console.log(method, filters);
        if ((filters == null) || filters.length === 0) {
            return {};
        }
        const r = fromEntries(Object.entries(params).filter(([key]: [any, Array<any>]) => {
            return filters.some((filter) => {
                if (filter[0] instanceof RegExp) {
                    if (key.match(filter[0]) || key.match(/^custom_/)) {
                        return true;
                    }
                } else {
                    if (key.match('^' + filter[0] + '$') || key.match(/^custom_/)) {
                        return true;
                    }
                }
                return false;
            });
        }));
        return filterCustomParameters(r);
    }

    public encodeForUrl(value) {
        return encodeURIComponent(value).replace(/%20/g, '+').replace(/[!'()]/g, escape).replace(/\*/g, '%2A');
    }

    public setMobileProtocol(url) {
        return url.replace(/http[s]?\:\/\//, 'bigbluebutton://');
    }

    public checksum(method, query = '') {
        let shaObj;

        const str = method + query + this.salt;

        if (this.opts.shaType === 'sha256') {
            shaObj = crypto.createHash('sha256');
        } else {
            shaObj = crypto.createHash('sha1');
        }
        shaObj.update(str);
        return shaObj.digest('hex');
    }

    public urlFor(method, params, filter = true) {
        let checksum, key, keys, param, paramList, property, query, sep, url, _i, _len;

        params = filter ? this.filterParams(params, method) : filterCustomParameters(params);

        console.log('params: ', params);

        url = this.url;
        paramList = [];
        if (params != null) {
            keys = [];
            for (property in params) {
                keys.push(property);
            }
            keys = keys.sort();
            for (_i = 0, _len = keys.length; _i < _len; _i++) {
                key = keys[_i];
                if (key != null) {
                    param = params[key];
                }
                if (param != null) {
                    paramList.push('' + (this.encodeForUrl(key)) + '=' + (this.encodeForUrl(param)));
                }
            }
            if (paramList.length > 0) {
                query = paramList.join('&');
            }
        } else {
            query = '';
        }
        checksum = this.checksum(method, query);
        if (paramList.length > 0) {
            query = '' + method + '?' + query;
            sep = '&';
        } else {
            if (method !== '/') {
                query = method;
            }
            sep = '?';
        }
        if (noChecksumMethods().indexOf(method) < 0) {
            query = '' + query + sep + 'checksum=' + checksum;
        }
        return '' + url + '/' + query;
    }

}

export default BigBlueButtonApi;

const filterCustomParameters = (params) => {
    let key, v;
    for (key in params) {
        v = params[key];
        if (key.match(/^custom_/)) {
            params[key.replace(/^custom_/, '')] = v;
        }
    }
    for (key in params) {
        if (key.match(/^custom_/)) {
            delete params[key];
        }
    }
    return params;
};

const noChecksumMethods = () => {
    return ['setConfigXML', '/', 'enter', 'configXML', 'signOut'];
};
