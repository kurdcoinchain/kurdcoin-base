import * as KurdCoinBase from '../src';

var keypair = KurdCoinBase.Keypair.random();
var data = 'data to sign';
var signature = KurdCoinBase.sign(data, keypair.rawSecretKey());

console.log('Signature: ' + signature.toString('hex'));

if (KurdCoinBase.verify(data, signature, keypair.rawPublicKey())) {
  console.log('OK!');
} else {
  console.log('Bad signature!');
}
