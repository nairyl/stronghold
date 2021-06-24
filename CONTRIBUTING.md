# Contributing

Thank you for considering contributing to the Stronghold project. We want to make contributing to this project as easy and transparent as possible, whether it's about:

* Discussing the current state of the code
* Documenting the code
* Reporting a bug
* Reporting a security threat
* Submitting a fix
* Suggesting a new feature

We welcome contributions from anyone on the internet, and are grateful for even a one-word correction! Note that we have a [code of conduct](./CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.


Thanks in advance for your help.


## We develop with Github

We use Github to host code, to track issues and feature requests, as well as accept pull requests.


## Pull Requests Guidelines

Pull requests are the best way to propose a new change to the codebase (we use the classic [Github Flow](https://guides.github.com/introduction/flow/index.html)).

To create a new pull request:
1. Fork the repo and check out a new branch from `master`.
2. Add test - if your code change doesn't require a test change, please explain why in the PR description.
3. Update the documentation - Especially if you've changed APIs or created new functions.
4. Ensure the test suite passes by running `yarn test`.
5. Make sure your code lints by running `yarn lint`.
6. Once 4 & 5 are passing, create a new pull request on Github.
7. Add the right label to your PR `documentation`, `bug`, `security-issue`, or `enhancement`.
8. Add a description of what the PR is changing:
   * What problem is the PR solving
   * Explain if it's adding a breaking change for clients
   * Explain how you've tested your change

Once the PR is created, one of the maintainers will review it and merge it into the master branch.

If you are thinking of working on a complex change, do not hesitate to discuss the change you wish to make via a Github Issue. You can also request feedback early, by opening a WIP pull request or discuss with a maintainer to ensure your work is in line with the philosophy and roadmap of Iron Fish.


## Where to start

Please read our [README.md](./README.md) first, to learn how to set up Stronghold.

If you don't know what contribution you can work on, here are a few suggestions:
* Take a look at our current [list of issues](https://github.com/stronghold-financial/stronghold/issues). Update the issue if you are interested in working on it.
* Take a look at our current [pull requests](https://github.com/stronghold-financial/stronghold/pulls) and help review them.
* Help us add new tests. More testing allow everyone to ship quality code faster.
* Write documentation or fix the existing documentation
* If you still don't know what could be a good task for you, do not hesitate to contact us.


## Testing

You can run the entire test suite by running `yarn test` on our TypeScript codebase.
You can run the test suite by entering the command `cargo-test` for each package (`stronghold-rust` or `stronghold-wasm`) within our Rust codebase.


## Continuous integration

After creating a PR on Github, the code will be tested automatically by GitHub Action. The tests can take up to 15 minutes to pass. We ask you to test your code on your machine before submitting a PR.


## Style Guide

Stronghold uses `eslint` and `prettier` to maintain consistent formatting on the TypeScript codebase.
For the Rust codebase, we are using `rustfmt`.

Please run it before submitting a change.


# Licensing

Any contribution will be under the MIT Software License. (See license file)
When you submit a code change, your submissions are understood to be under the same license that covers the project.

Please contact us if this a concern for you.


# Contact Us

In case of problems with trying to contribute to Stronghold, you can contact us:
* Via [email](camerondball@yahoo.com)
