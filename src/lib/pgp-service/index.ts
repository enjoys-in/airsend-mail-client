import * as openpgp from 'openpgp';
export async function DecryptEncryptedMail({
    encrypted,
    privateKeyArmored,
    publicKeyArmored,
    password,
}: {
    encrypted: string;
    privateKeyArmored: string;
    publicKeyArmored: string;
    password: string;
}): Promise<string> {
    const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
        passphrase: password,
    });

    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
    const message = await openpgp.readMessage({ armoredMessage: encrypted });

    const { data, signatures } = await openpgp.decrypt({
        message,
        verificationKeys: publicKey,
        decryptionKeys: privateKey,
    });

    await signatures[0].verified;
    return data.toString();
}
