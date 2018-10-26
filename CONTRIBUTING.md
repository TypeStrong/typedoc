# Contributing to TypeDoc

Thanks for taking the time to contribute! TypeDoc is a volunteer-run project and we couldn't do it without your help.

This document includes a set of guidelines for contributing to TypeDoc. These are guidelines, not rules. If something seems off, please feel free to propose changes to this document in a pull request.

## Table of Contents

1. [How Can I Contribute?](#how-can-i-contribute)
   - [Bug Reports](#bug-reports)
   - [Suggestions](#suggestions)
   - [Code](#code)
1. [Setup - Git, GitHub, and Node](#setup---git-github-and-node)
1. [Linting, Building, and Testing](#linting-building-and-testing)
1. [Pull Requests](#pull-requests)
1. [Updating Your Branch](#updating-your-branch)


## How Can I Contribute?

### Bug Reports

This section guides you through submitting a bug report for TypeDoc. Following these guidelines helps others understand your report and resolve the issue.

Before creating a bug report please check [this list][bugs] list to see if it has already been reported. If the issue is closed, please open a new issue and link to the original issue.

When creating a bug report, explain the problem and include as much additional information as necessary to help maintainers reproduce it. Ideally, provide an example project which highlights the problem.

- **Use a clear and descriptive title** for the issue to identify the problem
- **Describe your project setup**. The easier it is for maintainers to reproduce your problem, the more likely it is to be fixed quickly.
- **Explain what you expected to see instead and why**

### Suggestions

This section guides you through submitting an enhancement suggestion for Typedoc.

Before creating a feature request, please check [this list][suggestions] to see if it has already been requested.

When creating an enhancement request, explain your use case and ultimate goal. This will make it possible for contributors to suggest existing alternatives which may already meet your requirements.

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide an example where this enhancement would improve TypeDoc**
- **If possible, list another documentation generator where this feature exists**

### Code

Unsure of where to begin contributing to TypeDoc? You can start by looking through the issues labeled [good-first-issue] and [help-wanted]. Issues labeled with [good-first-issue] should only require changing a few lines of code and a test or two. Issues labeled with [help-wanted] can be considerably more involved and may require changing multiple files.

For instructions on setting up your environment, see the [setup](#setup---git-github-and-node) instructions in this document.

If you have started work on an issue and get stuck or want a second opinion on your implementation feel free to reach out through [Gitter].

## Setup - Git, GitHub, and Node

If you don't already have [Git] installed, install it first. You will need it to contribute to TypeDoc. You will also need to install [Node]. TypeDoc requires at least npm 4, so if you are running Node 7.3.0 or older you will need to upgrade npm using `npm install --global npm@^4`.

#### Installation

1. Fork the TypeDoc repository - https://github.com/TypeStrong/typedoc/fork
1. Open a terminal, or "Git Bash" on Windows.
1. Use `cd` to move to the directory that you want to work in.
1. Clone your repository, replace USER with your GitHub username:
   ```bash
   git clone https://github.com/USER/typedoc
   ```
1. Add the TypeDoc repo as a remote repository
   ```bash
   git remote add typedoc https://github.com/TypeStrong/typedoc
   ```
1. Install dependencies and build the latest version:
   ```bash
   npm install
   ```
1. Open the typedoc folder in your favorite editor. If you don't have one, try [Visual Studio Code][VSCode] or [Atom]

## Linting, Building, and Testing

Once you have cloned TypeDoc, you can lint, build, and test the code from your terminal.

#### Linting

To lint the TypeDoc code, run `npm run lint`. This will start tslint and check all files for stylistic problems. You can also install a tslint plugin for your editor to show most style problems as you type.

You can automatically fix some style problems by running `npm run lint -- --fix`.

#### Building

To compile the TypeDoc source, run `npm run grunt`. This will start the TypeScript compiler and output the compiled JavaScript to the `dist` folder. If you want to build and test in one step, run `npm run build`.

#### Testing

TypeDoc includes an extensive set of tests that describe its output. To validate any changes you have made, build the project and then run `npm test`. Alternatively, to rebuild with your changes and then immediately test, run `npm run build`.

If you have changed the TypeDoc output, it will cause tests to fail. Once you have validated that the introduced changes were intended, run `npm run grunt -- update-specs` to update the spec files for the new output.

## Pull Requests

Once you have finished working on an issue, you can submit a pull request to have your changes merged into the TypeDoc repository and included in the next release.

Before submitting a pull request, make sure that there are no linting problems (`npm run lint`), all tests pass (`npm test`), and your branch is up to date. Its also a good idea to join the TypeDoc [Gitter] room to discuss how best to implement changes.

Please do not change the project version number in a pull request.

## Updating Your Branch

If the TypeDoc repository has changed since you originally forked it, you will need to update your repository with the latest changes before submitting a pull request. To pull the latest changes from the TypeDoc repo, run `git pull typedoc master`.

[bugs]: https://github.com/TypeStrong/typedoc/labels/bug
[suggestions]: https://github.com/TypeStrong/typedoc/labels/enhancement
[good-first-issue]: https://github.com/TypeStrong/typedoc/labels/good%20first%20issue
[help-wanted]: https://github.com/TypeStrong/typedoc/labels/help%20wanted

[Gitter]: https://gitter.im/TypeStrong/typedoc
[GitHub]: https://github.com
[Git]: https://git-scm.com
[Node]: https://nodejs.org/en/
[VSCode]: https://code.visualstudio.com/
[Atom]: https://atom.io/
