
This is the core API for interacting with transactions and the chain. It's essentially a facade to a lot of different projects.

This is the only Stronghold project that knows about the
[Sapling](https://github.com/zcash/librustzcash/tree/master/sapling-crypto)
api and its zero knowledge proving mechanism.

There are theoretically different kinds of elliptical curves that can be used with Sapling, but we are currently
depending on the BLS12 curve. Everything in stronghold-rust is parameterized on the curve type, but there
are easy facades exported from sapling::bls12 for the different struct types.

This layer is tangentially aware of the chain. It is not aware of the peer to peer network or client APIs.