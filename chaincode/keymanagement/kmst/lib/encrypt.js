let CryptoJS = require("crypto-js");
// 'kmst-secret-token'
const secret_key = 'kmst-secret-token';
let encryptedText = CryptoJS.AES.encrypt(' G6lXTxSZXJpOgasuzgvSLUdRsABjgco5', secret_key).toString();
console.log("Encrypted: " + encryptedText)


let decrypted = CryptoJS.AES.decrypt(encryptedText, secret_key);
let decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

console.log("Decrypted: " + decryptedText)


// const result = { "discrepancyCount": 0, "docType": "kmst", "expiryTime": "2023-04-22T11:35:58.450Z", "isActive": true, "keyName": "temp-key-for-now", "pubKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAt/Sxpes6r0+Wfx9bwS3y\nsrcWOEJPu/R6lnYI/Lu+Sox+UAURAlhhRhBv+iL4g93Sc5DKxVC07hBfgdQYsD+T\nC2ZET/k0uxQr7P4IqjHqzhAEVumcaQh33cKf1WeAG5HeTGoA6Wb0RYzxVzDsuswD\n5P6tiUA/hKuneQjWqw29oHZ4iYyC1dCaNdNwLtezB4l5iMuiF4duayJsRyQzDF3g\nhRphUbM/lzgDuiy8lQEI2pyM/1Rmqk/BbU+ujbEhfQM4T4wMisZ1CLozAD1w4wuS\nRcjwteWcg4dT+v+/4hsleL1f4DYQiBefGo647gdxCXGzUb/2UuJB7ktJKisahZhN\nbQIDAQAB\n-----END PUBLIC KEY-----\n", "token": "tempToken", "tokenGenTime": "2023-03-22T13:17:55.396Z" }

// console.log(result.pubKey)