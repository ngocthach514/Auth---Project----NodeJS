const { hash, compare } = require('bcryptjs');
const { createHmac } = require('crypto');
exports.doHash = (value, saltValue) => {
    const results = hash(value, saltValue);
    return results;
};

exports.doHashValidation = (value, hashedValue) => {
    const results = compare(value, hashedValue);
    return results;
};

exports.hmacProcess = (value, key) => {
    const results = createHmac('sha256', key).update(value).digest('hex');
    return results;
};