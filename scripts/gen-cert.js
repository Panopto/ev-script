var selfsigned = require('selfsigned'),
    fs = require('fs'),
    certConfig = [{ name: 'commonName', value: 'ensemblevideo.com' }],
    pems = selfsigned.generate(certConfig, { days: 365 });

console.log(certConfig);
console.log(pems);

fs.writeFileSync('certs/ev-script-key.pem', pems.private);
fs.writeFileSync('certs/ev-script-cert.pem', pems.cert);
