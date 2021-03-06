import BigNumber from 'bignumber.js';
import isString from 'lodash/isString';
import { Hyper } from 'js-xdr';

describe('Operation', function() {
  describe('.createAccount()', function() {
    it('creates a createAccountOp', function() {
      var destination =
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ';
      var startingBalance = '1000.0000000';
      let op = KurdCoinBase.Operation.createAccount({
        destination,
        startingBalance
      });
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('createAccount');
      expect(obj.destination).to.be.equal(destination);
      expect(
        operation
          .body()
          .value()
          .startingBalance()
          .toString()
      ).to.be.equal('10000000000');
      expect(obj.startingBalance).to.be.equal(startingBalance);
    });
    it('fails to create createAccount operation with an invalid destination address', function() {
      let opts = {
        destination: 'GCEZW',
        startingBalance: '20',
        source: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
      };
      expect(() => KurdCoinBase.Operation.createAccount(opts)).to.throw(
        /destination is invalid/
      );
    });

    it('fails to create createAccount operation with an invalid startingBalance', function() {
      let opts = {
        destination: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
        startingBalance: 20,
        source: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
      };
      expect(() => KurdCoinBase.Operation.createAccount(opts)).to.throw(
        /startingBalance argument must be of type String, represent a positive number and have at most 7 digits after the decimal/
      );
    });

    it('fails to create createAccount operation with an invalid source address', function() {
      let opts = {
        destination: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
        startingBalance: '20',
        source: 'GCEZ'
      };
      expect(() => KurdCoinBase.Operation.createAccount(opts)).to.throw(
        /Source address is invalid/
      );
    });
  });

  describe('.payment()', function() {
    it('creates a paymentOp', function() {
      var destination =
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ';
      var amount = '1000.0000000';
      var asset = new KurdCoinBase.Asset(
        'USDUSD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      let op = KurdCoinBase.Operation.payment({ destination, asset, amount });
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('payment');
      expect(obj.destination).to.be.equal(destination);
    });
    it('does not support muxed accounts', function() {
      var destination =
        'MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6';
      var amount = '1000.0000000';
      var asset = new KurdCoinBase.Asset(
        'USDUSD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      var source =
        'MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6';

      expect(() => {
        KurdCoinBase.Operation.payment({
          destination,
          asset,
          amount,
          source
        });
      }).to.throw(/destination is invalid/);
    });

    it('fails to create payment operation with an invalid destination address', function() {
      let opts = {
        destination: 'GCEZW',
        asset: KurdCoinBase.Asset.native(),
        amount: '20'
      };
      expect(() => KurdCoinBase.Operation.payment(opts)).to.throw(
        /destination is invalid/
      );
    });

    it('fails to create payment operation with an invalid amount', function() {
      let opts = {
        destination: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
        asset: KurdCoinBase.Asset.native(),
        amount: 20
      };
      expect(() => KurdCoinBase.Operation.payment(opts)).to.throw(
        /amount argument must be of type String/
      );
    });
  });

  describe('.pathPaymentStrictReceive()', function() {
    it('creates a pathPaymentStrictReceiveOp', function() {
      var sendAsset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      var sendMax = '3.0070000';
      var destination =
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ';
      var destAsset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      var destAmount = '3.1415000';
      var path = [
        new KurdCoinBase.Asset(
          'USD',
          'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB'
        ),
        new KurdCoinBase.Asset(
          'EUR',
          'GDTNXRLOJD2YEBPKK7KCMR7J33AAG5VZXHAJTHIG736D6LVEFLLLKPDL'
        )
      ];
      let op = KurdCoinBase.Operation.pathPaymentStrictReceive({
        sendAsset,
        sendMax,
        destination,
        destAsset,
        destAmount,
        path
      });
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('pathPaymentStrictReceive');
      expect(obj.sendAsset.equals(sendAsset)).to.be.true;
      expect(
        operation
          .body()
          .value()
          .sendMax()
          .toString()
      ).to.be.equal('30070000');
      expect(obj.sendMax).to.be.equal(sendMax);
      expect(obj.destination).to.be.equal(destination);
      expect(obj.destAsset.equals(destAsset)).to.be.true;
      expect(
        operation
          .body()
          .value()
          .destAmount()
          .toString()
      ).to.be.equal('31415000');
      expect(obj.destAmount).to.be.equal(destAmount);
      expect(obj.path[0].getCode()).to.be.equal('USD');
      expect(obj.path[0].getIssuer()).to.be.equal(
        'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB'
      );
      expect(obj.path[1].getCode()).to.be.equal('EUR');
      expect(obj.path[1].getIssuer()).to.be.equal(
        'GDTNXRLOJD2YEBPKK7KCMR7J33AAG5VZXHAJTHIG736D6LVEFLLLKPDL'
      );
    });
    it('does not support muxed accounts', function() {
      var sendAsset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      var sendMax = '3.0070000';
      var destination =
        'MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6';
      var source =
        'MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6';
      var destAsset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      var destAmount = '3.1415000';
      var path = [
        new KurdCoinBase.Asset(
          'USD',
          'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB'
        ),
        new KurdCoinBase.Asset(
          'EUR',
          'GDTNXRLOJD2YEBPKK7KCMR7J33AAG5VZXHAJTHIG736D6LVEFLLLKPDL'
        )
      ];
      expect(() => {
        KurdCoinBase.Operation.pathPaymentStrictReceive({
          sendAsset,
          sendMax,
          destination,
          destAsset,
          destAmount,
          path,
          source
        });
      }).to.throw(/destination is invalid/);
    });
    it('fails to create path payment operation with an invalid destination address', function() {
      let opts = {
        destination: 'GCEZW',
        sendMax: '20',
        destAmount: '50',
        sendAsset: KurdCoinBase.Asset.native(),
        destAsset: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() =>
        KurdCoinBase.Operation.pathPaymentStrictReceive(opts)
      ).to.throw(/destination is invalid/);
    });

    it('fails to create path payment operation with an invalid sendMax', function() {
      let opts = {
        destination: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
        sendMax: 20,
        destAmount: '50',
        sendAsset: KurdCoinBase.Asset.native(),
        destAsset: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() =>
        KurdCoinBase.Operation.pathPaymentStrictReceive(opts)
      ).to.throw(/sendMax argument must be of type String/);
    });

    it('fails to create path payment operation with an invalid destAmount', function() {
      let opts = {
        destination: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
        sendMax: '20',
        destAmount: 50,
        sendAsset: KurdCoinBase.Asset.native(),
        destAsset: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() =>
        KurdCoinBase.Operation.pathPaymentStrictReceive(opts)
      ).to.throw(/destAmount argument must be of type String/);
    });
  });

  describe('.pathPaymentStrictSend()', function() {
    it('creates a pathPaymentStrictSendOp', function() {
      var sendAsset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      var sendAmount = '3.0070000';
      var destination =
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ';
      var destAsset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      var destMin = '3.1415000';
      var path = [
        new KurdCoinBase.Asset(
          'USD',
          'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB'
        ),
        new KurdCoinBase.Asset(
          'EUR',
          'GDTNXRLOJD2YEBPKK7KCMR7J33AAG5VZXHAJTHIG736D6LVEFLLLKPDL'
        )
      ];
      let op = KurdCoinBase.Operation.pathPaymentStrictSend({
        sendAsset,
        sendAmount,
        destination,
        destAsset,
        destMin,
        path
      });
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('pathPaymentStrictSend');
      expect(obj.sendAsset.equals(sendAsset)).to.be.true;
      expect(
        operation
          .body()
          .value()
          .sendAmount()
          .toString()
      ).to.be.equal('30070000');
      expect(obj.sendAmount).to.be.equal(sendAmount);
      expect(obj.destination).to.be.equal(destination);
      expect(obj.destAsset.equals(destAsset)).to.be.true;
      expect(
        operation
          .body()
          .value()
          .destMin()
          .toString()
      ).to.be.equal('31415000');
      expect(obj.destMin).to.be.equal(destMin);
      expect(obj.path[0].getCode()).to.be.equal('USD');
      expect(obj.path[0].getIssuer()).to.be.equal(
        'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB'
      );
      expect(obj.path[1].getCode()).to.be.equal('EUR');
      expect(obj.path[1].getIssuer()).to.be.equal(
        'GDTNXRLOJD2YEBPKK7KCMR7J33AAG5VZXHAJTHIG736D6LVEFLLLKPDL'
      );
    });
    it('does not support muxed accounts', function() {
      var sendAsset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      var sendAmount = '3.0070000';
      var destination =
        'MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6';
      var source =
        'MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6';
      var destAsset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      var destMin = '3.1415000';
      var path = [
        new KurdCoinBase.Asset(
          'USD',
          'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB'
        )
      ];
      expect(() => {
        KurdCoinBase.Operation.pathPaymentStrictSend({
          sendAsset,
          sendAmount,
          destination,
          destAsset,
          destMin,
          path,
          source
        });
      }).to.throw(/destination is invalid/);
    });
    it('fails to create path payment operation with an invalid destination address', function() {
      let opts = {
        destination: 'GCEZW',
        sendAmount: '20',
        destMin: '50',
        sendAsset: KurdCoinBase.Asset.native(),
        destAsset: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() => KurdCoinBase.Operation.pathPaymentStrictSend(opts)).to.throw(
        /destination is invalid/
      );
    });

    it('fails to create path payment operation with an invalid sendAmount', function() {
      let opts = {
        destination: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
        sendAmount: 20,
        destMin: '50',
        sendAsset: KurdCoinBase.Asset.native(),
        destAsset: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() => KurdCoinBase.Operation.pathPaymentStrictSend(opts)).to.throw(
        /sendAmount argument must be of type String/
      );
    });

    it('fails to create path payment operation with an invalid destMin', function() {
      let opts = {
        destination: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
        sendAmount: '20',
        destMin: 50,
        sendAsset: KurdCoinBase.Asset.native(),
        destAsset: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() => KurdCoinBase.Operation.pathPaymentStrictSend(opts)).to.throw(
        /destMin argument must be of type String/
      );
    });
  });

  describe('.changeTrust()', function() {
    it('creates a changeTrustOp', function() {
      let asset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      let op = KurdCoinBase.Operation.changeTrust({ asset: asset });
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('changeTrust');
      expect(obj.line).to.be.deep.equal(asset);
      expect(
        operation
          .body()
          .value()
          .limit()
          .toString()
      ).to.be.equal('9223372036854775807'); // MAX_INT64
      expect(obj.limit).to.be.equal('922337203685.4775807');
    });

    it('creates a changeTrustOp with limit', function() {
      let asset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      let op = KurdCoinBase.Operation.changeTrust({
        asset: asset,
        limit: '50.0000000'
      });
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('changeTrust');
      expect(obj.line).to.be.deep.equal(asset);
      expect(
        operation
          .body()
          .value()
          .limit()
          .toString()
      ).to.be.equal('500000000');
      expect(obj.limit).to.be.equal('50.0000000');
    });

    it('deletes a trustline', function() {
      let asset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      let op = KurdCoinBase.Operation.changeTrust({
        asset: asset,
        limit: '0.0000000'
      });
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('changeTrust');
      expect(obj.line).to.be.deep.equal(asset);
      expect(obj.limit).to.be.equal('0.0000000');
    });

    it('throws TypeError for incorrect limit argument', function() {
      let asset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      let changeTrust = () =>
        KurdCoinBase.Operation.changeTrust({ asset: asset, limit: 0 });
      expect(changeTrust).to.throw(TypeError);
    });
  });

  describe('.allowTrust()', function() {
    it('creates a allowTrustOp', function() {
      let trustor = 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7';
      let assetCode = 'USD';
      let authorize = true;
      let op = KurdCoinBase.Operation.allowTrust({
        trustor: trustor,
        assetCode: assetCode,
        authorize: authorize
      });
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('allowTrust');
      expect(obj.trustor).to.be.equal(trustor);
      expect(obj.assetCode).to.be.equal(assetCode);
      expect(obj.authorize).to.be.equal(1);
    });

    it('fails to create allowTrust operation with an invalid trustor address', function() {
      let opts = {
        trustor: 'GCEZW'
      };
      expect(() => KurdCoinBase.Operation.allowTrust(opts)).to.throw(
        /trustor is invalid/
      );
    });
  });

  describe('.setOptions()', function() {
    it('auth flags are set correctly', function() {
      expect(KurdCoinBase.AuthRequiredFlag).to.be.equal(1);
      expect(KurdCoinBase.AuthRevocableFlag).to.be.equal(2);
      expect(KurdCoinBase.AuthImmutableFlag).to.be.equal(4);
    });

    it('creates a setOptionsOp', function() {
      var opts = {};
      opts.inflationDest =
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7';
      opts.clearFlags =
        KurdCoinBase.AuthRevocableFlag | KurdCoinBase.AuthImmutableFlag;
      opts.setFlags = KurdCoinBase.AuthRequiredFlag;
      opts.masterWeight = 0;
      opts.lowThreshold = 1;
      opts.medThreshold = 2;
      opts.highThreshold = 3;

      opts.signer = {
        ed25519PublicKey:
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7',
        weight: 1
      };
      opts.homeDomain = 'www.example.com';
      let op = KurdCoinBase.Operation.setOptions(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);

      expect(obj.type).to.be.equal('setOptions');
      expect(obj.inflationDest).to.be.equal(opts.inflationDest);
      expect(obj.clearFlags).to.be.equal(6);
      expect(obj.setFlags).to.be.equal(1);
      expect(obj.masterWeight).to.be.equal(opts.masterWeight);
      expect(obj.lowThreshold).to.be.equal(opts.lowThreshold);
      expect(obj.medThreshold).to.be.equal(opts.medThreshold);
      expect(obj.highThreshold).to.be.equal(opts.highThreshold);

      expect(obj.signer.ed25519PublicKey).to.be.equal(
        opts.signer.ed25519PublicKey
      );
      expect(obj.signer.weight).to.be.equal(opts.signer.weight);
      expect(obj.homeDomain.toString()).to.be.equal(opts.homeDomain);
    });

    it('creates a setOptionsOp with preAuthTx signer', function() {
      var opts = {};

      var hash = KurdCoinBase.hash('Tx hash');

      opts.signer = {
        preAuthTx: hash,
        weight: 10
      };

      let op = KurdCoinBase.Operation.setOptions(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);

      expectBuffersToBeEqual(obj.signer.preAuthTx, hash);
      expect(obj.signer.weight).to.be.equal(opts.signer.weight);
    });

    it('creates a setOptionsOp with preAuthTx signer from a hex string', function() {
      var opts = {};

      var hash = KurdCoinBase.hash('Tx hash').toString('hex');
      expect(isString(hash)).to.be.true;

      opts.signer = {
        preAuthTx: hash,
        weight: 10
      };

      let op = KurdCoinBase.Operation.setOptions(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);

      expectBuffersToBeEqual(obj.signer.preAuthTx, hash);
      expect(obj.signer.weight).to.be.equal(opts.signer.weight);
    });

    it('creates a setOptionsOp with hash signer', function() {
      var opts = {};

      var hash = KurdCoinBase.hash('Hash Preimage');

      opts.signer = {
        sha256Hash: hash,
        weight: 10
      };

      let op = KurdCoinBase.Operation.setOptions(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);

      expectBuffersToBeEqual(obj.signer.sha256Hash, hash);
      expect(obj.signer.weight).to.be.equal(opts.signer.weight);
    });

    it('creates a setOptionsOp with hash signer from a hex string', function() {
      var opts = {};

      var hash = KurdCoinBase.hash('Hash Preimage').toString('hex');
      expect(isString(hash)).to.be.true;

      opts.signer = {
        sha256Hash: hash,
        weight: 10
      };

      let op = KurdCoinBase.Operation.setOptions(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);

      expectBuffersToBeEqual(obj.signer.sha256Hash, hash);
      expect(obj.signer.weight).to.be.equal(opts.signer.weight);
    });

    it('empty homeDomain is decoded correctly', function() {
      const keypair = KurdCoinBase.Keypair.random();
      const account = new KurdCoinBase.Account(keypair.publicKey(), '0');

      // First operation do nothing.
      const tx1 = new KurdCoinBase.TransactionBuilder(account, {
        fee: 100,
        networkPassphrase: 'Some Network'
      })
        .addOperation(KurdCoinBase.Operation.setOptions({}))
        .setTimeout(KurdCoinBase.TimeoutInfinite)
        .build();

      // Second operation unset homeDomain
      const tx2 = new KurdCoinBase.TransactionBuilder(account, {
        fee: 100,
        networkPassphrase: 'Some Network'
      })
        .addOperation(KurdCoinBase.Operation.setOptions({ homeDomain: '' }))
        .setTimeout(KurdCoinBase.TimeoutInfinite)
        .build();

      expect(tx1.operations[0].homeDomain).to.be.undefined;
      expect(tx2.operations[0].homeDomain).to.be.equal('');
    });

    it('string setFlags', function() {
      let opts = {
        setFlags: '4'
      };
      let op = KurdCoinBase.Operation.setOptions(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);

      expect(obj.type).to.be.equal('setOptions');
      expect(obj.setFlags).to.be.equal(4);
    });

    it('fails to create setOptions operation with an invalid setFlags', function() {
      let opts = {
        setFlags: {}
      };
      expect(() => KurdCoinBase.Operation.setOptions(opts)).to.throw();
    });

    it('string clearFlags', function() {
      let opts = {
        clearFlags: '4'
      };
      let op = KurdCoinBase.Operation.setOptions(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);

      expect(obj.type).to.be.equal('setOptions');
      expect(obj.clearFlags).to.be.equal(4);
    });

    it('fails to create setOptions operation with an invalid clearFlags', function() {
      let opts = {
        clearFlags: {}
      };
      expect(() => KurdCoinBase.Operation.setOptions(opts)).to.throw();
    });

    it('fails to create setOptions operation with an invalid inflationDest address', function() {
      let opts = {
        inflationDest: 'GCEZW'
      };
      expect(() => KurdCoinBase.Operation.setOptions(opts)).to.throw(
        /inflationDest is invalid/
      );
    });

    it('fails to create setOptions operation with an invalid signer address', function() {
      let opts = {
        signer: {
          ed25519PublicKey: 'GDGU5OAPHNPU5UCL',
          weight: 1
        }
      };
      expect(() => KurdCoinBase.Operation.setOptions(opts)).to.throw(
        /signer.ed25519PublicKey is invalid/
      );
    });

    it('fails to create setOptions operation with multiple signer values', function() {
      let opts = {
        signer: {
          ed25519PublicKey:
            'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7',
          sha256Hash: Buffer.alloc(32),
          weight: 1
        }
      };
      expect(() => KurdCoinBase.Operation.setOptions(opts)).to.throw(
        /Signer object must contain exactly one/
      );
    });

    it('fails to create setOptions operation with an invalid masterWeight', function() {
      let opts = {
        masterWeight: 400
      };
      expect(() => KurdCoinBase.Operation.setOptions(opts)).to.throw(
        /masterWeight value must be between 0 and 255/
      );
    });

    it('fails to create setOptions operation with an invalid lowThreshold', function() {
      let opts = {
        lowThreshold: 400
      };
      expect(() => KurdCoinBase.Operation.setOptions(opts)).to.throw(
        /lowThreshold value must be between 0 and 255/
      );
    });

    it('fails to create setOptions operation with an invalid medThreshold', function() {
      let opts = {
        medThreshold: 400
      };
      expect(() => KurdCoinBase.Operation.setOptions(opts)).to.throw(
        /medThreshold value must be between 0 and 255/
      );
    });

    it('fails to create setOptions operation with an invalid highThreshold', function() {
      let opts = {
        highThreshold: 400
      };
      expect(() => KurdCoinBase.Operation.setOptions(opts)).to.throw(
        /highThreshold value must be between 0 and 255/
      );
    });

    it('fails to create setOptions operation with an invalid homeDomain', function() {
      let opts = {
        homeDomain: 67238
      };
      expect(() => KurdCoinBase.Operation.setOptions(opts)).to.throw(
        /homeDomain argument must be of type String/
      );
    });
  });

  describe('.manageSellOffer', function() {
    it('creates a manageSellOfferOp (string price)', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.amount = '3.1234560';
      opts.price = '8.141592';
      opts.offerId = '1';
      let op = KurdCoinBase.Operation.manageSellOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('manageSellOffer');
      expect(obj.selling.equals(opts.selling)).to.be.true;
      expect(obj.buying.equals(opts.buying)).to.be.true;
      expect(
        operation
          .body()
          .value()
          .amount()
          .toString()
      ).to.be.equal('31234560');
      expect(obj.amount).to.be.equal(opts.amount);
      expect(obj.price).to.be.equal(opts.price);
      expect(obj.offerId).to.be.equal(opts.offerId);
    });

    it('creates a manageSellOfferOp (price fraction)', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.amount = '3.123456';
      opts.price = {
        n: 11,
        d: 10
      };
      opts.offerId = '1';
      let op = KurdCoinBase.Operation.manageSellOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.price).to.be.equal(
        new BigNumber(opts.price.n).div(opts.price.d).toString()
      );
    });

    it('creates an invalid manageSellOfferOp (price fraction)', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.amount = '3.123456';
      opts.price = {
        n: 11,
        d: -1
      };
      opts.offerId = '1';
      expect(() => KurdCoinBase.Operation.manageSellOffer(opts)).to.throw(
        /price must be positive/
      );
    });

    it('creates a manageSellOfferOp (number price)', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.amount = '3.123456';
      opts.price = 3.07;
      opts.offerId = '1';
      let op = KurdCoinBase.Operation.manageSellOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('manageSellOffer');
      expect(obj.price).to.be.equal(opts.price.toString());
    });

    it('creates a manageSellOfferOp (BigNumber price)', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.amount = '3.123456';
      opts.price = new BigNumber(5).dividedBy(4);
      opts.offerId = '1';
      let op = KurdCoinBase.Operation.manageSellOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('manageSellOffer');
      expect(obj.price).to.be.equal('1.25');
    });

    it('creates a manageSellOfferOp with no offerId', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.amount = '1000.0000000';
      opts.price = '3.141592';
      let op = KurdCoinBase.Operation.manageSellOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('manageSellOffer');
      expect(obj.selling.equals(opts.selling)).to.be.true;
      expect(obj.buying.equals(opts.buying)).to.be.true;
      expect(
        operation
          .body()
          .value()
          .amount()
          .toString()
      ).to.be.equal('10000000000');
      expect(obj.amount).to.be.equal(opts.amount);
      expect(obj.price).to.be.equal(opts.price);
      expect(obj.offerId).to.be.equal('0'); // 0=create a new offer, otherwise edit an existing offer
    });

    it('cancels offer', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.amount = '0.0000000';
      opts.price = '3.141592';
      opts.offerId = '1';
      let op = KurdCoinBase.Operation.manageSellOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('manageSellOffer');
      expect(obj.selling.equals(opts.selling)).to.be.true;
      expect(obj.buying.equals(opts.buying)).to.be.true;
      expect(
        operation
          .body()
          .value()
          .amount()
          .toString()
      ).to.be.equal('0');
      expect(obj.amount).to.be.equal(opts.amount);
      expect(obj.price).to.be.equal(opts.price);
      expect(obj.offerId).to.be.equal('1'); // 0=create a new offer, otherwise edit an existing offer
    });

    it('fails to create manageSellOffer operation with an invalid amount', function() {
      let opts = {
        amount: 20,
        price: '10',
        selling: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        ),
        buying: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() => KurdCoinBase.Operation.manageSellOffer(opts)).to.throw(
        /amount argument must be of type String/
      );
    });

    it('fails to create manageSellOffer operation with missing price', function() {
      let opts = {
        amount: '20',
        selling: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        ),
        buying: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() => KurdCoinBase.Operation.manageSellOffer(opts)).to.throw(
        /price argument is required/
      );
    });

    it('fails to create manageSellOffer operation with negative price', function() {
      let opts = {
        amount: '20',
        price: '-1',
        selling: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        ),
        buying: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() => KurdCoinBase.Operation.manageSellOffer(opts)).to.throw(
        /price must be positive/
      );
    });

    it('fails to create manageSellOffer operation with invalid price', function() {
      let opts = {
        amount: '20',
        price: 'test',
        selling: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        ),
        buying: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() => KurdCoinBase.Operation.manageSellOffer(opts)).to.throw(
        /not a number/
      );
    });
  });

  describe('.manageBuyOffer', function() {
    it('creates a manageBuyOfferOp (string price)', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buyAmount = '3.1234560';
      opts.price = '8.141592';
      opts.offerId = '1';
      let op = KurdCoinBase.Operation.manageBuyOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('manageBuyOffer');
      expect(obj.selling.equals(opts.selling)).to.be.true;
      expect(obj.buying.equals(opts.buying)).to.be.true;
      expect(
        operation
          .body()
          .value()
          .buyAmount()
          .toString()
      ).to.be.equal('31234560');
      expect(obj.buyAmount).to.be.equal(opts.buyAmount);
      expect(obj.price).to.be.equal(opts.price);
      expect(obj.offerId).to.be.equal(opts.offerId);
    });

    it('creates a manageBuyOfferOp (price fraction)', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buyAmount = '3.123456';
      opts.price = {
        n: 11,
        d: 10
      };
      opts.offerId = '1';
      let op = KurdCoinBase.Operation.manageBuyOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.price).to.be.equal(
        new BigNumber(opts.price.n).div(opts.price.d).toString()
      );
    });

    it('creates an invalid manageBuyOfferOp (price fraction)', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buyAmount = '3.123456';
      opts.price = {
        n: 11,
        d: -1
      };
      opts.offerId = '1';
      expect(() => KurdCoinBase.Operation.manageBuyOffer(opts)).to.throw(
        /price must be positive/
      );
    });

    it('creates a manageBuyOfferOp (number price)', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buyAmount = '3.123456';
      opts.price = 3.07;
      opts.offerId = '1';
      let op = KurdCoinBase.Operation.manageBuyOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('manageBuyOffer');
      expect(obj.price).to.be.equal(opts.price.toString());
    });

    it('creates a manageBuyOfferOp (BigNumber price)', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buyAmount = '3.123456';
      opts.price = new BigNumber(5).dividedBy(4);
      opts.offerId = '1';
      let op = KurdCoinBase.Operation.manageBuyOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('manageBuyOffer');
      expect(obj.price).to.be.equal('1.25');
    });

    it('creates a manageBuyOfferOp with no offerId', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buyAmount = '1000.0000000';
      opts.price = '3.141592';
      let op = KurdCoinBase.Operation.manageBuyOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('manageBuyOffer');
      expect(obj.selling.equals(opts.selling)).to.be.true;
      expect(obj.buying.equals(opts.buying)).to.be.true;
      expect(
        operation
          .body()
          .value()
          .buyAmount()
          .toString()
      ).to.be.equal('10000000000');
      expect(obj.buyAmount).to.be.equal(opts.buyAmount);
      expect(obj.price).to.be.equal(opts.price);
      expect(obj.offerId).to.be.equal('0'); // 0=create a new offer, otherwise edit an existing offer
    });

    it('cancels offer', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buyAmount = '0.0000000';
      opts.price = '3.141592';
      opts.offerId = '1';
      let op = KurdCoinBase.Operation.manageBuyOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('manageBuyOffer');
      expect(obj.selling.equals(opts.selling)).to.be.true;
      expect(obj.buying.equals(opts.buying)).to.be.true;
      expect(
        operation
          .body()
          .value()
          .buyAmount()
          .toString()
      ).to.be.equal('0');
      expect(obj.buyAmount).to.be.equal(opts.buyAmount);
      expect(obj.price).to.be.equal(opts.price);
      expect(obj.offerId).to.be.equal('1'); // 0=create a new offer, otherwise edit an existing offer
    });

    it('fails to create manageBuyOffer operation with an invalid amount', function() {
      let opts = {
        buyAmount: 20,
        price: '10',
        selling: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        ),
        buying: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() => KurdCoinBase.Operation.manageBuyOffer(opts)).to.throw(
        /buyAmount argument must be of type String/
      );
    });

    it('fails to create manageBuyOffer operation with missing price', function() {
      let opts = {
        buyAmount: '20',
        selling: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        ),
        buying: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() => KurdCoinBase.Operation.manageBuyOffer(opts)).to.throw(
        /price argument is required/
      );
    });

    it('fails to create manageBuyOffer operation with negative price', function() {
      let opts = {
        buyAmount: '20',
        price: '-1',
        selling: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        ),
        buying: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() => KurdCoinBase.Operation.manageBuyOffer(opts)).to.throw(
        /price must be positive/
      );
    });

    it('fails to create manageBuyOffer operation with invalid price', function() {
      let opts = {
        buyAmount: '20',
        price: 'test',
        selling: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        ),
        buying: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() => KurdCoinBase.Operation.manageBuyOffer(opts)).to.throw(
        /not a number/
      );
    });
  });

  describe('.createPassiveSellOffer', function() {
    it('creates a createPassiveSellOfferOp (string price)', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.amount = '11.2782700';
      opts.price = '3.07';
      let op = KurdCoinBase.Operation.createPassiveSellOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('createPassiveSellOffer');
      expect(obj.selling.equals(opts.selling)).to.be.true;
      expect(obj.buying.equals(opts.buying)).to.be.true;
      expect(
        operation
          .body()
          .value()
          .amount()
          .toString()
      ).to.be.equal('112782700');
      expect(obj.amount).to.be.equal(opts.amount);
      expect(obj.price).to.be.equal(opts.price);
    });

    it('creates a createPassiveSellOfferOp (number price)', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.amount = '11.2782700';
      opts.price = 3.07;
      let op = KurdCoinBase.Operation.createPassiveSellOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('createPassiveSellOffer');
      expect(obj.selling.equals(opts.selling)).to.be.true;
      expect(obj.buying.equals(opts.buying)).to.be.true;
      expect(
        operation
          .body()
          .value()
          .amount()
          .toString()
      ).to.be.equal('112782700');
      expect(obj.amount).to.be.equal(opts.amount);
      expect(obj.price).to.be.equal(opts.price.toString());
    });

    it('creates a createPassiveSellOfferOp (BigNumber price)', function() {
      var opts = {};
      opts.selling = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.buying = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      opts.amount = '11.2782700';
      opts.price = new BigNumber(5).dividedBy(4);
      let op = KurdCoinBase.Operation.createPassiveSellOffer(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('createPassiveSellOffer');
      expect(obj.selling.equals(opts.selling)).to.be.true;
      expect(obj.buying.equals(opts.buying)).to.be.true;
      expect(
        operation
          .body()
          .value()
          .amount()
          .toString()
      ).to.be.equal('112782700');
      expect(obj.amount).to.be.equal(opts.amount);
      expect(obj.price).to.be.equal('1.25');
    });

    it('fails to create createPassiveSellOffer operation with an invalid amount', function() {
      let opts = {
        amount: 20,
        price: '10',
        selling: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        ),
        buying: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() => KurdCoinBase.Operation.createPassiveSellOffer(opts)).to.throw(
        /amount argument must be of type String/
      );
    });

    it('fails to create createPassiveSellOffer operation with missing price', function() {
      let opts = {
        amount: '20',
        selling: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        ),
        buying: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() => KurdCoinBase.Operation.createPassiveSellOffer(opts)).to.throw(
        /price argument is required/
      );
    });

    it('fails to create createPassiveSellOffer operation with negative price', function() {
      let opts = {
        amount: '20',
        price: '-2',
        selling: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        ),
        buying: new KurdCoinBase.Asset(
          'USD',
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        )
      };
      expect(() => KurdCoinBase.Operation.createPassiveSellOffer(opts)).to.throw(
        /price must be positive/
      );
    });
  });

  describe('.accountMerge', function() {
    it('creates a accountMergeOp', function() {
      var opts = {};
      opts.destination =
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7';
      let op = KurdCoinBase.Operation.accountMerge(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('accountMerge');
      expect(obj.destination).to.be.equal(opts.destination);
    });
    it('does not support muxed accounts', function() {
      var opts = {};
      opts.destination =
        'MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6';
      opts.source =
        'MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6';
      expect(() => {
        KurdCoinBase.Operation.accountMerge(opts);
      }).to.throw(/destination is invalid/);
    });
    it('fails to create accountMerge operation with an invalid destination address', function() {
      let opts = {
        destination: 'GCEZW'
      };
      expect(() => KurdCoinBase.Operation.accountMerge(opts)).to.throw(
        /destination is invalid/
      );
    });
  });

  describe('.inflation', function() {
    it('creates a inflationOp', function() {
      let op = KurdCoinBase.Operation.inflation();
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('inflation');
    });
  });

  describe('.manageData', function() {
    it('creates a manageDataOp with string value', function() {
      var opts = {
        name: 'name',
        value: 'value'
      };
      let op = KurdCoinBase.Operation.manageData(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('manageData');
      expect(obj.name).to.be.equal(opts.name);
      expect(obj.value.toString('ascii')).to.be.equal(opts.value);
    });

    it('creates a manageDataOp with Buffer value', function() {
      var opts = {
        name: 'name',
        value: Buffer.from('value')
      };
      let op = KurdCoinBase.Operation.manageData(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('manageData');
      expect(obj.name).to.be.equal(opts.name);
      expect(obj.value.toString('hex')).to.be.equal(opts.value.toString('hex'));
    });

    it('creates a manageDataOp with null dataValue', function() {
      var opts = {
        name: 'name',
        value: null
      };
      let op = KurdCoinBase.Operation.manageData(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('manageData');
      expect(obj.name).to.be.equal(opts.name);
      expect(obj.value).to.be.undefined;
    });

    describe('fails to create manageData operation', function() {
      it('name is not a string', function() {
        expect(() =>
          KurdCoinBase.Operation.manageData({ name: 123 })
        ).to.throw();
      });

      it('name is too long', function() {
        expect(() =>
          KurdCoinBase.Operation.manageData({ name: 'a'.repeat(65) })
        ).to.throw();
      });

      it('value is too long', function() {
        expect(() =>
          KurdCoinBase.Operation.manageData({
            name: 'a',
            value: Buffer.alloc(65)
          })
        ).to.throw();
      });
    });
  });

  describe('.bumpSequence', function() {
    it('creates a bumpSequence', function() {
      var opts = {
        bumpTo: '77833036561510299'
      };
      let op = KurdCoinBase.Operation.bumpSequence(opts);
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('bumpSequence');
      expect(obj.bumpTo).to.be.equal(opts.bumpTo);
    });

    it('fails when `bumpTo` is not string', function() {
      expect(() =>
        KurdCoinBase.Operation.bumpSequence({ bumpTo: 1000 })
      ).to.throw();
    });
  });

  describe('._checkUnsignedIntValue()', function() {
    it('returns true for valid values', function() {
      let values = [
        { value: 0, expected: 0 },
        { value: 10, expected: 10 },
        { value: '0', expected: 0 },
        { value: '10', expected: 10 },
        { value: undefined, expected: undefined }
      ];

      for (var i in values) {
        let { value, expected } = values[i];
        expect(
          KurdCoinBase.Operation._checkUnsignedIntValue(value, value)
        ).to.be.equal(expected);
      }
    });

    it('throws error for invalid values', function() {
      let values = [
        {},
        [],
        '', // empty string
        'test', // string not representing a number
        '0.5',
        '-10',
        '-10.5',
        'Infinity',
        Infinity,
        'Nan',
        NaN
      ];

      for (var i in values) {
        let value = values[i];
        expect(() =>
          KurdCoinBase.Operation._checkUnsignedIntValue(value, value)
        ).to.throw();
      }
    });

    it('return correct values when isValidFunction is set', function() {
      expect(
        KurdCoinBase.Operation._checkUnsignedIntValue(
          'test',
          undefined,
          (value) => value < 10
        )
      ).to.equal(undefined);

      expect(
        KurdCoinBase.Operation._checkUnsignedIntValue(
          'test',
          8,
          (value) => value < 10
        )
      ).to.equal(8);
      expect(
        KurdCoinBase.Operation._checkUnsignedIntValue(
          'test',
          '8',
          (value) => value < 10
        )
      ).to.equal(8);

      expect(() => {
        KurdCoinBase.Operation._checkUnsignedIntValue(
          'test',
          12,
          (value) => value < 10
        );
      }).to.throw();
      expect(() => {
        KurdCoinBase.Operation._checkUnsignedIntValue(
          'test',
          '12',
          (value) => value < 10
        );
      }).to.throw();
    });
  });

  describe('createClaimableBalance()', function() {
    it('creates a CreateClaimableBalanceOp', function() {
      const asset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      const amount = '100.0000000';
      const claimants = [
        new KurdCoinBase.Claimant(
          'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
        )
      ];

      const op = KurdCoinBase.Operation.createClaimableBalance({
        asset,
        amount,
        claimants
      });
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('createClaimableBalance');
      expect(obj.asset.toString()).to.equal(asset.toString());
      expect(obj.amount).to.be.equal(amount);
      expect(obj.claimants).to.have.lengthOf(1);
      expect(obj.claimants[0].toXDRObject().toXDR('hex')).to.equal(
        claimants[0].toXDRObject().toXDR('hex')
      );
    });
    it('throws an error when asset is not present', function() {
      const amount = '100.0000000';
      const claimants = [
        new KurdCoinBase.Claimant(
          'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
        )
      ];

      const attrs = {
        amount,
        claimants
      };

      expect(() =>
        KurdCoinBase.Operation.createClaimableBalance(attrs)
      ).to.throw(
        /must provide an asset for create claimable balance operation/
      );
    });
    it('throws an error when amount is not present', function() {
      const asset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      const claimants = [
        new KurdCoinBase.Claimant(
          'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
        )
      ];

      const attrs = {
        asset,
        claimants
      };

      expect(() =>
        KurdCoinBase.Operation.createClaimableBalance(attrs)
      ).to.throw(
        /amount argument must be of type String, represent a positive number and have at most 7 digits after the decimal/
      );
    });
    it('throws an error when claimants is empty or not present', function() {
      const asset = new KurdCoinBase.Asset(
        'USD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      const amount = '100.0000';

      const attrs = {
        asset,
        amount
      };

      expect(() =>
        KurdCoinBase.Operation.createClaimableBalance(attrs)
      ).to.throw(/must provide at least one claimant/);

      attrs.claimants = [];
      expect(() =>
        KurdCoinBase.Operation.createClaimableBalance(attrs)
      ).to.throw(/must provide at least one claimant/);
    });
  });

  describe('claimClaimableBalance()', function() {
    it('creates a claimClaimableBalanceOp', function() {
      const balanceId =
        '00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be';

      const op = KurdCoinBase.Operation.claimClaimableBalance({
        balanceId
      });
      var xdr = op.toXDR('hex');
      var operation = KurdCoinBase.xdr.Operation.fromXDR(
        Buffer.from(xdr, 'hex')
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('claimClaimableBalance');
      expect(obj.balanceId).to.equal(balanceId);
    });
    it('throws an error when balanceId is not present', function() {
      expect(() => KurdCoinBase.Operation.claimClaimableBalance({})).to.throw(
        /must provide a valid claimable balance Id/
      );
    });
  });

  describe('beginSponsoringFutureReserves()', function() {
    it('creates a beginSponsoringFutureReservesOp', function() {
      const sponsoredId =
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7';

      const op = KurdCoinBase.Operation.beginSponsoringFutureReserves({
        sponsoredId
      });
      var xdr = op.toXDR('hex');

      var operation = KurdCoinBase.xdr.Operation.fromXDR(xdr, 'hex');
      expect(operation.body().switch().name).to.equal(
        'beginSponsoringFutureReserves'
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('beginSponsoringFutureReserves');
      expect(obj.sponsoredId).to.equal(sponsoredId);
    });
    it('throws an error when sponsoredId is invalid', function() {
      expect(() =>
        KurdCoinBase.Operation.beginSponsoringFutureReserves({})
      ).to.throw(/sponsoredId is invalid/);
      expect(() =>
        KurdCoinBase.Operation.beginSponsoringFutureReserves({
          sponsoredId: 'GBAD'
        })
      ).to.throw(/sponsoredId is invalid/);
    });
  });

  describe('endSponsoringFutureReserves()', function() {
    it('creates a endSponsoringFutureReservesOp', function() {
      const op = KurdCoinBase.Operation.endSponsoringFutureReserves();
      var xdr = op.toXDR('hex');

      var operation = KurdCoinBase.xdr.Operation.fromXDR(xdr, 'hex');
      expect(operation.body().switch().name).to.equal(
        'endSponsoringFutureReserves'
      );
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('endSponsoringFutureReserves');
    });
  });

  describe('revokeAccountSponsorship()', function() {
    it('creates a revokeAccountSponsorshipOp', function() {
      const account =
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7';
      const op = KurdCoinBase.Operation.revokeAccountSponsorship({
        account
      });
      var xdr = op.toXDR('hex');

      var operation = KurdCoinBase.xdr.Operation.fromXDR(xdr, 'hex');
      expect(operation.body().switch().name).to.equal('revokeSponsorship');
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('revokeAccountSponsorship');
      expect(obj.account).to.be.equal(account);
    });
    it('throws an error when account is invalid', function() {
      expect(() => KurdCoinBase.Operation.revokeAccountSponsorship({})).to.throw(
        /account is invalid/
      );
      expect(() =>
        KurdCoinBase.Operation.revokeAccountSponsorship({
          account: 'GBAD'
        })
      ).to.throw(/account is invalid/);
    });
  });

  describe('revokeTrustlineSponsorship()', function() {
    it('creates a revokeTrustlineSponsorship', function() {
      const account =
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7';
      var asset = new KurdCoinBase.Asset(
        'USDUSD',
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      );
      const op = KurdCoinBase.Operation.revokeTrustlineSponsorship({
        account,
        asset
      });
      var xdr = op.toXDR('hex');

      var operation = KurdCoinBase.xdr.Operation.fromXDR(xdr, 'hex');
      expect(operation.body().switch().name).to.equal('revokeSponsorship');
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('revokeTrustlineSponsorship');
    });
    it('throws an error when account is invalid', function() {
      expect(() =>
        KurdCoinBase.Operation.revokeTrustlineSponsorship({})
      ).to.throw(/account is invalid/);
      expect(() =>
        KurdCoinBase.Operation.revokeTrustlineSponsorship({
          account: 'GBAD'
        })
      ).to.throw(/account is invalid/);
    });
    it('throws an error when asset is invalid', function() {
      expect(() =>
        KurdCoinBase.Operation.revokeTrustlineSponsorship({
          account: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        })
      ).to.throw(/asset is invalid/);
    });
  });

  describe('revokeOfferSponsorship()', function() {
    it('creates a revokeOfferSponsorship', function() {
      const seller = 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7';
      var offerId = '1234';
      const op = KurdCoinBase.Operation.revokeOfferSponsorship({
        seller,
        offerId
      });
      var xdr = op.toXDR('hex');

      var operation = KurdCoinBase.xdr.Operation.fromXDR(xdr, 'hex');
      expect(operation.body().switch().name).to.equal('revokeSponsorship');
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('revokeOfferSponsorship');
      expect(obj.seller).to.be.equal(seller);
      expect(obj.offerId).to.be.equal(offerId);
    });
    it('throws an error when seller is invalid', function() {
      expect(() => KurdCoinBase.Operation.revokeOfferSponsorship({})).to.throw(
        /seller is invalid/
      );
      expect(() =>
        KurdCoinBase.Operation.revokeOfferSponsorship({
          seller: 'GBAD'
        })
      ).to.throw(/seller is invalid/);
    });
    it('throws an error when asset offerId is not included', function() {
      expect(() =>
        KurdCoinBase.Operation.revokeOfferSponsorship({
          seller: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        })
      ).to.throw(/offerId is invalid/);
    });
  });

  describe('revokeDataSponsorship()', function() {
    it('creates a revokeDataSponsorship', function() {
      const account =
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7';
      var name = 'foo';
      const op = KurdCoinBase.Operation.revokeDataSponsorship({
        account,
        name
      });
      var xdr = op.toXDR('hex');

      var operation = KurdCoinBase.xdr.Operation.fromXDR(xdr, 'hex');
      expect(operation.body().switch().name).to.equal('revokeSponsorship');
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('revokeDataSponsorship');
      expect(obj.account).to.be.equal(account);
      expect(obj.name).to.be.equal(name);
    });
    it('throws an error when account is invalid', function() {
      expect(() => KurdCoinBase.Operation.revokeDataSponsorship({})).to.throw(
        /account is invalid/
      );
      expect(() =>
        KurdCoinBase.Operation.revokeDataSponsorship({
          account: 'GBAD'
        })
      ).to.throw(/account is invalid/);
    });
    it('throws an error when data name is not included', function() {
      expect(() =>
        KurdCoinBase.Operation.revokeDataSponsorship({
          account: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
        })
      ).to.throw(/name must be a string, up to 64 characters/);
    });
  });

  describe('revokeClaimableBalanceSponsorship()', function() {
    it('creates a revokeClaimableBalanceSponsorship', function() {
      const balanceId =
        '00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be';
      const op = KurdCoinBase.Operation.revokeClaimableBalanceSponsorship({
        balanceId
      });
      var xdr = op.toXDR('hex');

      var operation = KurdCoinBase.xdr.Operation.fromXDR(xdr, 'hex');
      expect(operation.body().switch().name).to.equal('revokeSponsorship');
      var obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('revokeClaimableBalanceSponsorship');
      expect(obj.balanceId).to.be.equal(balanceId);
    });
    it('throws an error when balanceId is invalid', function() {
      expect(() =>
        KurdCoinBase.Operation.revokeClaimableBalanceSponsorship({})
      ).to.throw(/balanceId is invalid/);
    });
  });

  describe('revokeSignerSponsorship()', function() {
    it('creates a revokeSignerSponsorship', function() {
      const account =
        'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7';
      let signer = {
        ed25519PublicKey:
          'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
      };
      let op = KurdCoinBase.Operation.revokeSignerSponsorship({
        account,
        signer
      });
      let xdr = op.toXDR('hex');

      let operation = KurdCoinBase.xdr.Operation.fromXDR(xdr, 'hex');
      expect(operation.body().switch().name).to.equal('revokeSponsorship');
      let obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('revokeSignerSponsorship');
      expect(obj.account).to.be.equal(account);
      expect(obj.signer.ed25519PublicKey).to.be.equal(signer.ed25519PublicKey);

      // preAuthTx signer
      signer = {
        preAuthTx: KurdCoinBase.hash('Tx hash').toString('hex')
      };
      op = KurdCoinBase.Operation.revokeSignerSponsorship({
        account,
        signer
      });
      operation = KurdCoinBase.xdr.Operation.fromXDR(op.toXDR('hex'), 'hex');
      obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('revokeSignerSponsorship');
      expect(obj.account).to.be.equal(account);
      expect(obj.signer.preAuthTx).to.be.equal(signer.preAuthTx);

      // sha256Hash signer
      signer = {
        sha256Hash: KurdCoinBase.hash('Hash Preimage').toString('hex')
      };
      op = KurdCoinBase.Operation.revokeSignerSponsorship({
        account,
        signer
      });
      operation = KurdCoinBase.xdr.Operation.fromXDR(op.toXDR('hex'), 'hex');
      obj = KurdCoinBase.Operation.fromXDRObject(operation);
      expect(obj.type).to.be.equal('revokeSignerSponsorship');
      expect(obj.account).to.be.equal(account);
      expect(obj.signer.sha256Hash).to.be.equal(signer.sha256Hash);
    });
    it('throws an error when account is invalid', function() {
      const signer = {
        ed25519PublicKey:
          'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
      };
      expect(() =>
        KurdCoinBase.Operation.revokeSignerSponsorship({
          signer
        })
      ).to.throw(/account is invalid/);
    });
  });

  describe('.isValidAmount()', function() {
    it('returns true for valid amounts', function() {
      let amounts = [
        '10',
        '0.10',
        '0.1234567',
        '922337203685.4775807' // MAX
      ];

      for (var i in amounts) {
        expect(KurdCoinBase.Operation.isValidAmount(amounts[i])).to.be.true;
      }
    });

    it('returns false for invalid amounts', function() {
      let amounts = [
        100, // integer
        100.5, // float
        '', // empty string
        'test', // string not representing a number
        '0',
        '-10',
        '-10.5',
        '0.12345678',
        '922337203685.4775808', // Overflow
        'Infinity',
        Infinity,
        'Nan',
        NaN
      ];

      for (var i in amounts) {
        expect(KurdCoinBase.Operation.isValidAmount(amounts[i])).to.be.false;
      }
    });

    it('allows 0 only if allowZero argument is set to true', function() {
      expect(KurdCoinBase.Operation.isValidAmount('0')).to.be.false;
      expect(KurdCoinBase.Operation.isValidAmount('0', true)).to.be.true;
    });
  });

  describe('._fromXDRAmount()', function() {
    it('correctly parses the amount', function() {
      expect(KurdCoinBase.Operation._fromXDRAmount(1)).to.be.equal('0.0000001');
      expect(KurdCoinBase.Operation._fromXDRAmount(10000000)).to.be.equal(
        '1.0000000'
      );
      expect(KurdCoinBase.Operation._fromXDRAmount(10000000000)).to.be.equal(
        '1000.0000000'
      );
      expect(
        KurdCoinBase.Operation._fromXDRAmount(1000000000000000000)
      ).to.be.equal('100000000000.0000000');
    });
  });
});

function expectBuffersToBeEqual(left, right) {
  let leftHex = left.toString('hex');
  let rightHex = right.toString('hex');
  expect(leftHex).to.eql(rightHex);
}
