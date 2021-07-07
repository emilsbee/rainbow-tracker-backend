/**
 * This utility module is for providing functions for encrypting and decrypting.
 * The code was adapted from here: https://github.com/MauriceButler/cryptr/blob/master/index.js
 *
 */
import * as crypto from "crypto"

// Constants regarding the encryption algorithm and its properties
const algorithm = 'aes-256-gcm';
const ivLength = 16;
const saltLength = 64;
const tagLength = 16;
const tagPosition = saltLength + ivLength;
const encryptedPosition = tagPosition + tagLength;

/**
 * Extracts the key.
 * @param salt
 */
function getKey(salt:Buffer):Buffer {
    if (process.env.TOKEN_ENCRYPT_KEY != null) {
        return crypto.pbkdf2Sync(process.env.TOKEN_ENCRYPT_KEY, salt, 100000, 32, 'sha512');
    } else {
        throw new Error("You must have an environment variable TOKEN_ENCRYPT_KEY")
    }
}

/**
 * Encrypts a given object and returns the string.
 * @param value to encrypt.
 */
export const encrypt = function encrypt(value:any):string {
    if (value == null) {
        throw new Error('Value must not be null or undefined');
    }

    const iv:Buffer = crypto.randomBytes(ivLength);
    const salt:Buffer = crypto.randomBytes(saltLength);

    const key:Buffer = getKey(salt);

    const cipher:crypto.CipherGCM = crypto.createCipheriv(algorithm, key, iv);

    const encrypted:Buffer = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);

    const tag:Buffer = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
}

/**
 * Decrypts a given value, returns either the decrypted object.
 * @param value to decrypt.
 */
export const decrypt = function decrypt(value:string):any {
    if (value == null) {
        throw new Error('Value must not be null or undefined');
    }

    const stringValue:Buffer = Buffer.from(String(value), 'hex');

    const salt:Buffer = stringValue.slice(0, saltLength);
    const iv:Buffer = stringValue.slice(saltLength, tagPosition);
    const tag:Buffer = stringValue.slice(tagPosition, encryptedPosition);
    const encrypted:Buffer = stringValue.slice(encryptedPosition);

    const key:Buffer = getKey(salt);

    const decipher:crypto.DecipherGCM = crypto.createDecipheriv(algorithm, key, iv);

    decipher.setAuthTag(tag);

    return JSON.parse(decipher.update(encrypted) + decipher.final('utf8'))
}

