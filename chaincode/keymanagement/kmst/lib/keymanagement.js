/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const CryptoJS = require("crypto-js");

class KeyManagement extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const keyManagementList = [
            {
                keyName: 'first-temp-key',
                isActive: false,
                pubKey: new Object(),
                token: 'tempToken123',
                tokenGenTime: new Date('2024-03-25T12:00:00Z'),
                expiryTime: new Date('2024-09-25T12:00:00Z'),
                discrepancyCount: 0,
            },
        ];

        for (let i = 0; i < keyManagementList.length; i++) {
            keyManagementList[i].docType = 'kmst';
            await ctx.stub.putState('KMS' + i, Buffer.from(JSON.stringify(keyManagementList[i])));
            console.info('Added <--> ', keyManagementList[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryKmst(ctx, keyId) {
        // Decrypt keyId
        const keyIdTemp = CryptoJS.AES.decrypt(keyId, 'kmst-secret-token');
        const decryptedKeyId = keyIdTemp.toString(CryptoJS.enc.Utf8);
        
        const currentDate = new Date();
        const keyAsBytes = await ctx.stub.getState(decryptedKeyId); // get the kmst from chaincode state
        if (!keyAsBytes || keyAsBytes.length === 0) {
            throw new Error(`${decryptedKeyId} does not exist`);
        }
        else if(currentDate > keyAsBytes.toString().expiryTime){
            throw new Error(`${decryptedKeyId} has expired`);
        }
        else if(keyAsBytes.toString().isActive==false){
            throw new Error(`${decryptedKeyId} is in-active`)
        }
        console.log(keyAsBytes.toString());
        return keyAsBytes.toString();
    }

    async createKey(ctx, keyId, keyName, token, tokenGenTime, expiryTime) {

        // Decrypt keyId
        const keyIdTemp = CryptoJS.AES.decrypt(keyId, 'kmst-secret-token') + "";
        const decryptedKeyId = keyIdTemp.toString(CryptoJS.enc.Utf8);

        // Decrypt token
        const tempToken = CryptoJS.AES.decrypt(token, 'kmst-secret-token') + "";
        const decryptedToken = tempToken.toString(CryptoJS.enc.Utf8);

        console.info('============= START : Create KMST ===========');

        const KeyManagement = {
            keyName,
            isActive: false,
            pubKey: null,
            docType: 'kmst',
            token: decryptedToken,
            tokenGenTime,
            expiryTime,
            discrepancyCount: 0
        };

        await ctx.stub.putState(decryptedKeyId, Buffer.from(JSON.stringify(KeyManagement)));
        console.info('============= END : Create KMST ===========');
    }

    async queryAllKeys(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async updateKey(ctx, keyId, newPubKey) {
        console.info('============= START : updateKey ===========');
        
        const keyIdTemp = CryptoJS.AES.decrypt(keyId, 'kmst-secret-token');
        const decryptedKeyId = keyIdTemp.toString(CryptoJS.enc.Utf8);

        const keyAsBytes = await ctx.stub.getState(decryptedKeyId); // get the KMST from chaincode state
        if (!keyAsBytes || keyAsBytes.length === 0) {
            throw new Error(`${decryptedKeyId} does not exist`);
        }
        const key = JSON.parse(keyAsBytes.toString());
        const currentDate = new Date();
        const tokenGenDate = new Date(key.tokenGenTime);
        const min = Math.abs(currentDate - tokenGenDate) / 60000;
        if (min < 15) {
            const token = key.token;

            try {
                // Decrypt new pubKey
                const tempPubKey = CryptoJS.AES.decrypt(newPubKey, token);
                const decryptedPubKey = tempPubKey.toString(CryptoJS.enc.Utf8);
                key.isActive = true;
                key.pubKey = decryptedPubKey;
                await ctx.stub.putState(decryptedKeyId, Buffer.from(JSON.stringify(key)));
                console.info('============= END : updateKey ===========');
            }
            catch (error) {
                console.log(error)
                throw new Error('Key can not be decrypted using token');
            }

        }
        else {
            console.log('token has expired')
            throw new Error('token has expired');
        }

    }

    async updateDiscrepancyCount(ctx, keyId) {
        console.info('============= START : updateDiscrepancyCount ===========');

        try{
        // Decrypt keyId
        const keyIdTemp = CryptoJS.AES.decrypt(keyId, 'kmst-secret-token');
        const decryptedKeyId = keyIdTemp.toString(CryptoJS.enc.Utf8);

        const keyAsBytes = await ctx.stub.getState(decryptedKeyId); // get the KMST from chaincode state
        if (!keyAsBytes || keyAsBytes.length === 0) {
            throw new Error(`${decryptedKeyId} does not exist`);
        }
        const key = JSON.parse(keyAsBytes.toString());
        key.discrepancyCount = key.discrepancyCount + 1;
        if(key.discrepancyCount>3){
            key.isActive=false;
        }
        await ctx.stub.putState(decryptedKeyId, Buffer.from(JSON.stringify(key)));
        console.info('============= END : updateDiscrepancyCount ===========');
    }
    catch(error){
        console.log('Failed to update discrepancy count....');
        throw new Error('Failed to update discrepancy count....');
    }
    }

}

module.exports = KeyManagement;
