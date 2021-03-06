
describe('Account.constructor', function() {
  it("fails to create Account object from an invalid address", function() {
    expect(() => new KurdCoinBase.Account('GBBB')).to.throw(/accountId is invalid/);
  });

  it("fails to create Account object from an invalid sequence number", function() {
    expect(() => new KurdCoinBase.Account('GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB', 100)).to.throw(/sequence must be of type string/);
  });

  it("creates an Account object", function() {
    let account = new KurdCoinBase.Account('GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB', '100');
    expect(account.accountId()).to.equal("GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB");
    expect(account.sequenceNumber()).to.equal("100");
  });
});

describe('Account.incrementSequenceNumber', function() {
  it("correctly increments the sequence number", function() {
    let account = new KurdCoinBase.Account('GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB', '100');
    account.incrementSequenceNumber();
    expect(account.sequenceNumber()).to.equal("101");
    account.incrementSequenceNumber();
    account.incrementSequenceNumber();
    expect(account.sequenceNumber()).to.equal("103");
  });
});
