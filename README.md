# JS Stellar Base

[![Build Status](https://travis-ci.com/stellar/js-kurdcoin-base.svg?branch=master)](https://travis-ci.com/stellar/js-kurdcoin-base)
[![Code Climate](https://codeclimate.com/github/stellar/js-kurdcoin-base/badges/gpa.svg)](https://codeclimate.com/github/stellar/js-kurdcoin-base)
[![Coverage Status](https://coveralls.io/repos/stellar/js-kurdcoin-base/badge.svg?branch=master&service=github)](https://coveralls.io/github/stellar/js-kurdcoin-base?branch=master)
[![Dependency Status](https://david-dm.org/stellar/js-kurdcoin-base.svg)](https://david-dm.org/stellar/js-kurdcoin-base)

The kurdcoin-base library is the lowest-level stellar helper library. It consists
of classes to read, write, hash, and sign the xdr structures that are used in
[stellar-core](https://github.com/stellar/stellar-core). This is an
implementation in JavaScript that can be used on either Node.js or web browsers.

- **[API Reference](https://stellar.github.io/js-kurdcoin-base/)**

> **Warning!** Node version of this package is using
> [`sodium-native`](https://www.npmjs.com/package/sodium-native) package, a
> native implementation of [Ed25519](https://ed25519.cr.yp.to/) in Node.js, as
> an
> [optional dependency](https://docs.npmjs.com/files/package.json#optionaldependencies).
> This means that if for any reason installation of this package fails,
> `kurdcoin-base` will fallback to the much slower implementation contained in
> [`tweetnacl`](https://www.npmjs.com/package/tweetnacl).
>
> If you are using `kurdcoin-base` in a browser you can ignore this. However, for
> production backend deployments you should definitely be using `sodium-native`.
> If `sodium-native` is successfully installed and working
> `KurdCoinBase.FastSigning` variable will be equal `true`. Otherwise it will be
> `false`.

## Quick start

Using npm to include js-kurdcoin-base in your own project:

```shell
npm install --save kurdcoin-base
```

For browsers, [use Bower to install it](#to-use-in-the-browser). It exports a
variable `KurdCoinBase`. The example below assumes you have `kurdcoin-base.js`
relative to your html file.

```html
<script src="kurdcoin-base.js"></script>
<script>
  console.log(KurdCoinBase);
</script>
```

## Install

### To use as a module in a Node.js project

1. Install it using npm:

```shell
npm install --save kurdcoin-base
```

2. require/import it in your JavaScript:

```js
var KurdCoinBase = require('kurdcoin-base');
```

### To self host for use in the browser

1. Install it using [bower](http://bower.io):

```shell
bower install kurdcoin-base
```

2. Include it in the browser:

```html
<script src="./bower_components/kurdcoin-base/kurdcoin-base.js"></script>
<script>
  console.log(KurdCoinBase);
</script>
```

If you don't want to use install Bower, you can copy built JS files from the
[bower-js-kurdcoin-base repo](https://github.com/stellar/bower-js-kurdcoin-base).

### To use the [cdnjs](https://cdnjs.com/libraries/kurdcoin-base) hosted script in the browser

1. Instruct the browser to fetch the library from
   [cdnjs](https://cdnjs.com/libraries/kurdcoin-base), a 3rd party service that
   hosts js libraries:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/kurdcoin-base/{version}/kurdcoin-base.js"></script>
<script>
  console.log(KurdCoinBase);
</script>
```

Note that this method relies using a third party to host the JS library. This
may not be entirely secure.

Make sure that you are using the latest version number. They can be found on the
[releases page in Github](https://github.com/stellar/js-kurdcoin-base/releases).

### To develop and test js-kurdcoin-base itself

1. Install Node 10.16.3

Because we support earlier versions of Node, please install and develop on Node
10.16.3 so you don't get surprised when your code works locally but breaks in CI.

If you work on several projects that use different Node versions, you might find
helpful to install a nodejs version manager.

- https://github.com/creationix/nvm
- https://github.com/wbyoung/avn
- https://github.com/asdf-vm/asdf

2. Install Yarn

This project uses [Yarn](https://yarnpkg.com/) to manages its dependencies. To
install Yarn, follow the project instructions available at
https://yarnpkg.com/en/docs/install.

3. Clone the repo

```shell
git clone https://github.com/stellar/js-kurdcoin-base.git
```

4. Install dependencies inside js-kurdcoin-base folder

```shell
cd js-kurdcoin-base
yarn install
```

5. Observe the project's code style

While you're making changes, make sure to run the linter-watcher to catch any
linting errors (in addition to making sure your text editor supports ESLint)

```shell
node_modules/.bin/gulp watch
```

If you're working on a file not in `src`, limit your code to Node 6.16 ES! See
what's supported here: https://node.green/ (The reason is that our npm library
must support earlier versions of Node, so the tests need to run on those
versions.)

#### Updating XDR definitions

1. Make sure you have [Ruby](https://www.ruby-lang.org/en/) installed. You can
   either use a global installation, or use a version manager.

- https://www.ruby-lang.org/en/downloads/
- https://github.com/rbenv/rbenv
- https://rvm.io
- https://github.com/asdf-vm/asdf

2. Install [Bundler](https://bundler.io).
3. Install all dependencies.

```shell
bundle install
```

4. Copy xdr files from
   https://github.com/stellar/stellar-core/tree/master/src/xdr to `./xdr`.
5. Run `yarn xdr` js-kurdcoin-base folder.

## Usage

For information on how to use js-kurdcoin-base, take a look at the docs in the
[docs folder](./docs).

## Testing

To run all tests:

```shell
gulp test
```

To run a specific set of tests:

```shell
gulp test:node
gulp test:browser
```

Tests are also run on the
[Travis CI js-kurdcoin-base project](https://travis-ci.org/stellar/js-kurdcoin-base)
automatically.

## Documentation

Documentation for this repo lives inside the [docs folder](./docs).

## Contributing

Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to
contribute to this project.

## Publishing to npm

```
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease]
```

A new version will be published to npm **and** Bower by Travis CI.

npm >=2.13.0 required. Read more about
[npm version](https://docs.npmjs.com/cli/version).

## License

js-kurdcoin-base is licensed under an Apache-2.0 license. See the
[LICENSE](./LICENSE) file for details.
