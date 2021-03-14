describe('Asset', function() {
  describe('constructor', function() {
    it("throws an error when there's no issuer for non XLM type asset", function() {
      expect(() => new KurdCoinBase.Asset('USD')).to.throw(
        /Issuer cannot be null/
      );
    });

    it('throws an error when code is invalid', function() {
      expect(
        () =>
          new KurdCoinBase.Asset(
            '',
            'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
          )
      ).to.throw(/Asset code is invalid/);
      expect(
        () =>
          new KurdCoinBase.Asset(
            '1234567890123',
            'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
          )
      ).to.throw(/Asset code is invalid/);
      expect(
        () =>
          new KurdCoinBase.Asset(
            'ab_',
            'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
          )
      ).to.throw(/Asset code is invalid/);
    });

    it('throws an error when issuer is invalid', function() {
      expect(() => new KurdCoinBase.Asset('USD', 'GCEZWKCA5')).to.throw(
        /Issuer is invalid/
      );
    });
  });

  describe('getCode()', function() {
    it('returns a code for a native asset object', function() {
      var asset = new KurdCoinBase.Asset.native();
      expect(asset.getCode()).to.be.equal('XLM');
    });

    it('returns a code for a non-native asset', function() {
      var asset = new KurdCoinBase.Asset(
        'USD',
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
      );
      expect(asset.getCode()).to.be.equal('USD');
    });
  });

  describe('getIssuer()', function() {
    it('returns a code for a native asset object', function() {
      var asset = new KurdCoinBase.Asset.native();
      expect(asset.getIssuer()).to.be.undefined;
    });

    it('returns a code for a non-native asset', function() {
      var asset = new KurdCoinBase.Asset(
        'USD',
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
      );
      expect(asset.getIssuer()).to.be.equal(
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
      );
    });
  });

  describe('getAssetType()', function() {
    it('returns native for native assets', function() {
      var asset = KurdCoinBase.Asset.native();
      expect(asset.getAssetType()).to.eq('native');
    });

    it('returns credit_alphanum4 if the asset code length is between 1 and 4', function() {
      var asset = new KurdCoinBase.Asset(
        'ABCD',
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
      );
      expect(asset.getAssetType()).to.eq('credit_alphanum4');
    });

    it('returns credit_alphanum12 if the asset code length is between 5 and 12', function() {
      var asset = new KurdCoinBase.Asset(
        'ABCDEF',
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
      );
      expect(asset.getAssetType()).to.eq('credit_alphanum12');
    });
  });

  describe('toXDRObject()', function() {
    it('parses a native asset object', function() {
      var asset = new KurdCoinBase.Asset.native();
      var xdr = asset.toXDRObject();
      expect(xdr.toXDR().toString()).to.be.equal(
        Buffer.from([0, 0, 0, 0]).toString()
      );
    });

    it('parses a 3-alphanum asset object', function() {
      var asset = new KurdCoinBase.Asset(
        'USD',
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
      );
      var xdr = asset.toXDRObject();

      expect(xdr).to.be.instanceof(KurdCoinBase.xdr.Asset);
      expect(() => xdr.toXDR('hex')).to.not.throw();

      expect(xdr.arm()).to.equal('alphaNum4');
      expect(xdr.value().assetCode()).to.equal('USD\0');
    });

    it('parses a 4-alphanum asset object', function() {
      var asset = new KurdCoinBase.Asset(
        'BART',
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
      );
      var xdr = asset.toXDRObject();

      expect(xdr).to.be.instanceof(KurdCoinBase.xdr.Asset);
      expect(() => xdr.toXDR('hex')).to.not.throw();

      expect(xdr.arm()).to.equal('alphaNum4');
      expect(xdr.value().assetCode()).to.equal('BART');
    });

    it('parses a 5-alphanum asset object', function() {
      var asset = new KurdCoinBase.Asset(
        '12345',
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
      );
      var xdr = asset.toXDRObject();

      expect(xdr).to.be.instanceof(KurdCoinBase.xdr.Asset);
      expect(() => xdr.toXDR('hex')).to.not.throw();

      expect(xdr.arm()).to.equal('alphaNum12');
      expect(xdr.value().assetCode()).to.equal('12345\0\0\0\0\0\0\0');
    });

    it('parses a 12-alphanum asset object', function() {
      var asset = new KurdCoinBase.Asset(
        '123456789012',
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
      );
      var xdr = asset.toXDRObject();

      expect(xdr).to.be.instanceof(KurdCoinBase.xdr.Asset);
      expect(() => xdr.toXDR('hex')).to.not.throw();

      expect(xdr.arm()).to.equal('alphaNum12');
      expect(xdr.value().assetCode()).to.equal('123456789012');
    });
  });

  describe('fromOperation()', function() {
    it('parses a native asset XDR', function() {
      var xdr = new KurdCoinBase.xdr.Asset.assetTypeNative();
      var asset = KurdCoinBase.Asset.fromOperation(xdr);

      expect(asset).to.be.instanceof(KurdCoinBase.Asset);
      expect(asset.isNative()).to.equal(true);
    });

    it('parses a 4-alphanum asset XDR', function() {
      var issuer = 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ';
      var assetCode = 'KHL';
      var assetType = new KurdCoinBase.xdr.AssetAlphaNum4({
        assetCode: assetCode + '\0',
        issuer: KurdCoinBase.Keypair.fromPublicKey(issuer).xdrAccountId()
      });
      var xdr = new KurdCoinBase.xdr.Asset(
        'assetTypeCreditAlphanum4',
        assetType
      );

      var asset = KurdCoinBase.Asset.fromOperation(xdr);

      expect(asset).to.be.instanceof(KurdCoinBase.Asset);
      expect(asset.getCode()).to.equal(assetCode);
      expect(asset.getIssuer()).to.equal(issuer);
    });

    it('parses a 12-alphanum asset XDR', function() {
      var issuer = 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ';
      var assetCode = 'KHLTOKEN';
      var assetType = new KurdCoinBase.xdr.AssetAlphaNum4({
        assetCode: assetCode + '\0\0\0\0',
        issuer: KurdCoinBase.Keypair.fromPublicKey(issuer).xdrAccountId()
      });
      var xdr = new KurdCoinBase.xdr.Asset(
        'assetTypeCreditAlphanum12',
        assetType
      );

      var asset = KurdCoinBase.Asset.fromOperation(xdr);

      expect(asset).to.be.instanceof(KurdCoinBase.Asset);
      expect(asset.getCode()).to.equal(assetCode);
      expect(asset.getIssuer()).to.equal(issuer);
    });
  });

  describe('toString()', function() {
    it("returns 'native' for native asset", function() {
      var asset = KurdCoinBase.Asset.native();
      expect(asset.toString()).to.be.equal('native');
    });

    it("returns 'code:issuer' for non-native asset", function() {
      var asset = new KurdCoinBase.Asset(
        'USD',
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
      );
      expect(asset.toString()).to.be.equal(
        'USD:GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
      );
    });
  });
});
