import * as KurdCoinSdk from 'kurdcoin-base';

const masterKey = KurdCoinSdk.Keypair.master(KurdCoinSdk.Networks.TESTNET); // $ExpectType Keypair
const sourceKey = KurdCoinSdk.Keypair.random(); // $ExpectType Keypair
const destKey = KurdCoinSdk.Keypair.random();
const usd = new KurdCoinSdk.Asset('USD', 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'); // $ExpectType Asset
const account = new KurdCoinSdk.Account(sourceKey.publicKey(), '1');
const transaction = new KurdCoinSdk.TransactionBuilder(account, {
  fee: "100",
  networkPassphrase: KurdCoinSdk.Networks.TESTNET
})
  .addOperation(
    KurdCoinSdk.Operation.beginSponsoringFutureReserves({
      sponsoredId: account.accountId(),
      source: masterKey.publicKey()
    })
  )
  .addOperation(
    KurdCoinSdk.Operation.accountMerge({ destination: destKey.publicKey() }),
  ).addOperation(
    KurdCoinSdk.Operation.createClaimableBalance({
      amount: "10",
      asset: KurdCoinSdk.Asset.native(),
      claimants: [
        new KurdCoinSdk.Claimant(account.accountId())
      ]
    }),
  ).addOperation(
    KurdCoinSdk.Operation.claimClaimableBalance({
      balanceId: "00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be",
    }),
  ).addOperation(
    KurdCoinSdk.Operation.endSponsoringFutureReserves({
    })
  ).addOperation(
    KurdCoinSdk.Operation.endSponsoringFutureReserves({})
  ).addOperation(
    KurdCoinSdk.Operation.revokeAccountSponsorship({
      account: account.accountId(),
    })
  ).addOperation(
      KurdCoinSdk.Operation.revokeTrustlineSponsorship({
        account: account.accountId(),
        asset: usd,
      })
  ).addOperation(
    KurdCoinSdk.Operation.revokeOfferSponsorship({
      seller: account.accountId(),
      offerId: '12345'
    })
  ).addOperation(
    KurdCoinSdk.Operation.revokeDataSponsorship({
      account: account.accountId(),
      name: 'foo'
    })
  ).addOperation(
    KurdCoinSdk.Operation.revokeClaimableBalanceSponsorship({
      balanceId: "00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be",
    })
  ).addOperation(
    KurdCoinSdk.Operation.revokeSignerSponsorship({
      account: account.accountId(),
      signer: {
        ed25519PublicKey: sourceKey.publicKey()
      }
    })
  ).addOperation(
    KurdCoinSdk.Operation.revokeSignerSponsorship({
      account: account.accountId(),
      signer: {
        sha256Hash: "da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be"
      }
    })
  ).addOperation(
    KurdCoinSdk.Operation.revokeSignerSponsorship({
      account: account.accountId(),
      signer: {
        preAuthTx: "da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be"
      }
    })
  ).addMemo(new KurdCoinSdk.Memo(KurdCoinSdk.MemoText, 'memo'))
  .setTimeout(5)
  .build(); // $ExpectType () => Transaction<Memo<MemoType>, Operation[]>

const transactionFromXDR = new KurdCoinSdk.Transaction(transaction.toEnvelope(), KurdCoinSdk.Networks.TESTNET); // $ExpectType Transaction<Memo<MemoType>, Operation[]>

transactionFromXDR.networkPassphrase; // $ExpectType string
transactionFromXDR.networkPassphrase = "SDF";

KurdCoinSdk.TransactionBuilder.fromXDR(transaction.toXDR(), KurdCoinSdk.Networks.TESTNET); // $ExpectType Transaction<Memo<MemoType>, Operation[]> | FeeBumpTransaction
KurdCoinSdk.TransactionBuilder.fromXDR(transaction.toEnvelope(), KurdCoinSdk.Networks.TESTNET); // $ExpectType Transaction<Memo<MemoType>, Operation[]> | FeeBumpTransaction

const sig = KurdCoinSdk.xdr.DecoratedSignature.fromXDR(Buffer.of(1, 2)); // $ExpectType DecoratedSignature
sig.hint(); // $ExpectType Buffer
sig.signature(); // $ExpectType Buffer

KurdCoinSdk.Memo.none(); // $ExpectType Memo<"none">
KurdCoinSdk.Memo.text('asdf'); // $ExpectType Memo<"text">
KurdCoinSdk.Memo.id('asdf'); // $ExpectType Memo<"id">
KurdCoinSdk.Memo.return('asdf'); // $ExpectType Memo<"return">
KurdCoinSdk.Memo.hash('asdf'); // $ExpectType Memo<"hash">
KurdCoinSdk.Memo.none().value; // $ExpectType null
KurdCoinSdk.Memo.id('asdf').value; // $ExpectType string
KurdCoinSdk.Memo.text('asdf').value; // $ExpectType string | Buffer
KurdCoinSdk.Memo.return('asdf').value; // $ExpectType Buffer
KurdCoinSdk.Memo.hash('asdf').value; // $ExpectType Buffer

const feeBumptransaction = KurdCoinSdk.TransactionBuilder.buildFeeBumpTransaction(masterKey, "120", transaction, KurdCoinSdk.Networks.TESTNET); // $ExpectType FeeBumpTransaction

feeBumptransaction.feeSource; // $ExpectType string
feeBumptransaction.innerTransaction; // $ExpectType Transaction<Memo<MemoType>, Operation[]>
feeBumptransaction.fee; // $ExpectType string
feeBumptransaction.toXDR(); // $ExpectType string
feeBumptransaction.toEnvelope(); // $ExpectType TransactionEnvelope
feeBumptransaction.hash(); // $ExpectType Buffer

KurdCoinSdk.TransactionBuilder.fromXDR(feeBumptransaction.toXDR(), KurdCoinSdk.Networks.TESTNET); // $ExpectType Transaction<Memo<MemoType>, Operation[]> | FeeBumpTransaction
KurdCoinSdk.TransactionBuilder.fromXDR(feeBumptransaction.toEnvelope(), KurdCoinSdk.Networks.TESTNET); // $ExpectType Transaction<Memo<MemoType>, Operation[]> | FeeBumpTransaction

// P.S. don't use Memo constructor
new KurdCoinSdk.Memo(KurdCoinSdk.MemoHash, 'asdf').value; // $ExpectType MemoValue
// (new KurdCoinSdk.Memo(KurdCoinSdk.MemoHash, 'asdf')).type; // $ExpectType MemoType  // TODO: Inspect what's wrong with linter.

const noSignerXDR = KurdCoinSdk.Operation.setOptions({ lowThreshold: 1 });
KurdCoinSdk.Operation.fromXDRObject(noSignerXDR).signer; // $ExpectType never

const newSignerXDR1 = KurdCoinSdk.Operation.setOptions({
  signer: { ed25519PublicKey: sourceKey.publicKey(), weight: '1' }
});
KurdCoinSdk.Operation.fromXDRObject(newSignerXDR1).signer; // $ExpectType Ed25519PublicKey

const newSignerXDR2 = KurdCoinSdk.Operation.setOptions({
  signer: { sha256Hash: Buffer.from(''), weight: '1' }
});
KurdCoinSdk.Operation.fromXDRObject(newSignerXDR2).signer; // $ExpectType Sha256Hash

const newSignerXDR3 = KurdCoinSdk.Operation.setOptions({
  signer: { preAuthTx: '', weight: 1 }
});
KurdCoinSdk.Operation.fromXDRObject(newSignerXDR3).signer; // $ExpectType PreAuthTx

KurdCoinSdk.TimeoutInfinite; // $ExpectType 0

const envelope = feeBumptransaction.toEnvelope(); // $ExpectType TransactionEnvelope
envelope.v0(); // $ExpectType TransactionV0Envelope
envelope.v1(); // $ExpectType TransactionV1Envelope
envelope.feeBump(); // $ExpectType FeeBumpTransactionEnvelope

const meta = KurdCoinSdk.xdr.TransactionMeta.fromXDR(
  // tslint:disable:max-line-length
  'AAAAAQAAAAIAAAADAcEsRAAAAAAAAAAArZu2SrdQ9krkyj7RBqTx1txDNZBfcS+wGjuEUizV9hkAAAAAAKXgdAGig34AADuDAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAcEsRAAAAAAAAAAArZu2SrdQ9krkyj7RBqTx1txDNZBfcS+wGjuEUizV9hkAAAAAAKXgdAGig34AADuEAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAAAA==',
  'base64'
);
meta; // $ExpectType TransactionMeta
meta.v1().txChanges(); // $ExpectType LedgerEntryChange[]
const op = KurdCoinSdk.xdr.AllowTrustOp.fromXDR(
  'AAAAAMNQvnFVCnBnEVzd8ZaKUvsI/mECPGV8cnBszuftCmWYAAAAAUNPUAAAAAAC',
  'base64'
);
op; // $ExpectType AllowTrustOp
op.authorize(); // $ExpectType number
op.trustor().ed25519(); // $ExpectType Buffer
op.trustor(); // $ExpectedType AccountId
const e = KurdCoinSdk.xdr.LedgerEntry.fromXDR(
  "AAAAAAAAAAC2LgFRDBZ3J52nLm30kq2iMgrO7dYzYAN3hvjtf1IHWg==",
  'base64'
);
e; // $ExpectType LedgerEntry
const a = KurdCoinSdk.xdr.AccountEntry.fromXDR(
  // tslint:disable:max-line-length
  'AAAAALYuAVEMFncnnacubfSSraIyCs7t1jNgA3eG+O1/UgdaAAAAAAAAA+gAAAAAGc1zDAAAAAIAAAABAAAAAEB9GCtIe8SCLk7LV3MzmlKN3U4M2JdktE7ofCKtTNaaAAAABAAAAAtzdGVsbGFyLm9yZwABAQEBAAAAAQAAAACEKm+WHjUQThNzoKx6WbU8no3NxzUrGtoSLmtxaBAM2AAAAAEAAAABAAAAAAAAAAoAAAAAAAAAFAAAAAA=',
  'base64'
);
a; // $ExpectType AccountEntry
a.homeDomain(); // $ExpectType string | Buffer
const t = KurdCoinSdk.xdr.TransactionV0.fromXDR(
    // tslint:disable:max-line-length
    '1bzMAeuKubyXUug/Xnyj1KYkv+cSUtCSvAczI2b459kAAABkAS/5cwAAABMAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAsBL/lzAAAAFAAAAAA=',
    'base64'
);
t; // $ExpectType TransactionV0
t.timeBounds(); // $ExpectType TimeBounds | null

KurdCoinSdk.xdr.Uint64.fromString("12"); // $ExpectType UnsignedHyper
KurdCoinSdk.xdr.Int32.toXDR(-1); // $ExpectType Buffer
KurdCoinSdk.xdr.Uint32.toXDR(1); // $ExpectType Buffer
KurdCoinSdk.xdr.String32.toXDR("hellow world"); // $ExpectedType Buffer
KurdCoinSdk.xdr.Hash.toXDR(Buffer.alloc(32)); // $ExpectedType Buffer
KurdCoinSdk.xdr.Signature.toXDR(Buffer.alloc(9, 'a')); // $ExpectedType Buffer

const change = KurdCoinSdk.xdr.LedgerEntryChange.fromXDR(
  // tslint:disable:max-line-length
  'AAAAAwHBW0UAAAAAAAAAADwkQ23EX6ohsRsGoCynHl5R8D7RXcgVD4Y92uUigLooAAAAAIitVMABlM5gABTlLwAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAA',
  'base64'
);
change; // $ExpectType LedgerEntryChange
const raw = KurdCoinSdk.xdr.LedgerEntryChanges.toXDR([change]); // $ExpectType Buffer
KurdCoinSdk.xdr.LedgerEntryChanges.fromXDR(raw); // $ExpectType LedgerEntryChange[]

KurdCoinSdk.xdr.Asset.assetTypeNative(); // $ExpectType Asset
KurdCoinSdk.xdr.InnerTransactionResultResult.txInternalError(); // $ExpectType InnerTransactionResultResult
KurdCoinSdk.xdr.TransactionV0Ext[0](); // $ExpectedType TransactionV0Ext

KurdCoinSdk.Claimant.predicateUnconditional(); // $ExpectType ClaimPredicate
const claimant = new KurdCoinSdk.Claimant(sourceKey.publicKey()); // $ExpectType Claimant
claimant.toXDRObject(); // $ExpectType Claimant
claimant.destination; // $ExpectType string
claimant.predicate; // $ExpectType ClaimPredicate
