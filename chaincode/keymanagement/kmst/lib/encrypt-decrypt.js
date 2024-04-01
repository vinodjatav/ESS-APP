const crypto = require("crypto");
const fs = require("fs");

// The `generateKeyPairSync` method accepts two arguments:
// 1. The type ok keys we want, which in this case is "rsa"
// 2. An object with the properties of the key
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  // The standard secure default length for RSA keys is 2048 bits
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: ''
  }
});

// Creating private/public keys file
fs.writeFileSync("private/private_key", privateKey);
fs.writeFileSync("public/public_key", publicKey);

// use the public and private keys
// ...
// This is the data we want to encrypt
const data = "my secret data";
const privateKey1 = fs.readFileSync('./private/private_key', "utf8");
const publicKey1 = fs.readFileSync('./public/public_key', "utf8");

const encryptedData1 = crypto.privateEncrypt(
  {
    key: privateKey1,
    passphrase: "",
    padding: crypto.constants.RSA_PKCS1_PADDING,
    encoding: "",
  },
  Buffer.from(data)
);
// console.log("encypted data1: ", encryptedData1.toString("base64"));

const decryptedData1 = crypto.publicDecrypt(
  {
    key: publicKey1,
    passphrase: "",
    padding: crypto.constants.RSA_PKCS1_PADDING,
    encoding: "",
  },
  encryptedData1
)

// console.log("decrypted data1: ", decryptedData1.toString());


let CryptoJS = require("crypto-js");
// 'kmst-secret-token'
const secret_key = 'kmst-secret-token';
let encryptedText = CryptoJS.AES.encrypt(publicKey1, secret_key).toString();
console.log("Encrypted: "+ encryptedText)


let decrypted = CryptoJS.AES.decrypt(encryptedText, secret_key);
let decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

console.log("Decrypted: "+ decryptedText)
