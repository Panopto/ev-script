var selfsigned = require('selfsigned'),
    fs = require('fs'),
    config = require('../ev-config'),
    pems = selfsigned.generate(config.certConfig, { days: 365 });

console.log(pems);

fs.writeFileSync('certs/ev-script-key.pem', pems.private);
fs.writeFileSync('certs/ev-script-cert.pem', pems.cert);
