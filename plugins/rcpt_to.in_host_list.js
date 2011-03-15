// Check RCPT TO domain is in host list

var smtp = require('../constants');

exports.hook_rcpt = function(callback, connection, params) {
    var rcpt = params[0];
    // Check for RCPT TO without an @ first - ignore those here
    if (!rcpt.match(/@/)) {
        return callback(smtp.cont);
    }
    
    this.loginfo("Checking if " + rcpt + " host is in host_list");
    
    var matches = rcpt.match(/@([^@>]*)>?/);
    if (!matches) {
        this.logerror("TO address does not parse: " + rcpt);
        return callback(smtp.deny, "TO address does not parse");
    }
    
    var domain = matches[1];
    var host_list = this.config.get('host_list', 'list');
    var allow_subdomain = this.config.get('host_list.ini', 'ini').main.allow_subdomains;
    
    var i;
    for (i in host_list) {
        var tmp_domain = domain;
        while (tmp_domain.match(/\./)) {
            this.logdebug("checking " + tmp_domain + " against " + host_list[i]);
            if (host_list[i] === tmp_domain) {
                return callback(smtp.ok);
            }
            if (allow_subdomain) {
                tmp_domain = tmp_domain.replace(/^[^\.]*\./, '');
            }
            else {
                break;
            }
        }
    }
    
    callback(smtp.cont);
}
