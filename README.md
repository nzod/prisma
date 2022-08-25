<p align="center">
  <br>
  <p align="center">
    ✨ Generate N'Zod contracts and DTOs from Prisma Schema ✨
  </p>
</p>
<br/>
<p align="center">
  <a href="https://github.com/nzod/prisma/actions?query=branch%3Amain">
    <img src="https://github.com/nzod/prisma/actions/workflows/test-and-build.yml/badge.svg?event=push&branch=main" alt="typescript-library CI Status" />
  </a>
  <a href="https://opensource.org/licenses/MIT" rel="nofollow">
    <img src="https://img.shields.io/github/license/nzod/prisma" alt="License">
  </a>
  <a href="https://www.npmjs.com/package/@nzod/prisma" rel="nofollow">
    <img src="https://img.shields.io/npm/dw/@nzod/prisma.svg" alt="npm">
  </a>
  <a href="https://www.npmjs.com/package/@nzod/prisma" rel="nofollow">
    <img src="https://img.shields.io/github/stars/nzod/prisma" alt="stars">
  </a>
</p>

## Template Features

- 🚀 Blazingly fast and easy installation
- 💡 CI workflows configured for changelogs and release/prerelease cycles
- 🧱 Perfect and easy-to-support tooling setup without any conflicts with CI environment
- 📚 Well-documented conventions for project maintaining (commits, pull-requests, branches)

## Before you start

The README on `main` branch may contain some unreleased changes.

Go to [`release/latest`](https://github.com/nzod/prisma/tree/release/latest) branch to see the actual README for the latest version from NPM.

## Navigation

- [Installation](#installation)
- [Contrubuting](#contributing)
- [Maintenance](#maintenance)
  - [Regular flow](#regular-flow)
  - [Prerelease from](#prerelease-flow)
  - [Conventions](#conventions)

## Installation

```shell
yarn add @nzod/prisma

npm install @nzod/prisma
```

## Usage

```prisma
generator nzod {
  provider = "nzod-prisma"
  output   = "../src/generated/nzod"
}
```

### What will be generated?

For each model:

- `{ModelName}Schema`

  Exact `prisma` -> `nzod` mapping.

- `{ModelName}InputSchema`

  The same as the regular schema, but nullable fields are optional.

- `{ModelName}RelatedSchema`

  If the model has relations, the related schema will be generated.  
  It contains all fields from the regular schema plus relations.

- `{ModelName}RelatedInputSchema`

  If the model has relations, the related schema will be generated.  
  It contains all fields from the input schema plus relations (optional when nullable).

- `{ModelName}Dto` (when `generateDto` is set to `true`)

  The DTO constructor for the regular schema.

- `{ModelName}InputDto` (when `generateDto` is set to `true`)

  The DTO constructor for the regular schema.

### Creating DTOs

Install N'Zod DTO library:

```shell
yarn add @nzod/dto

npm install @nzod/dto
```

Set `generateDto` to `true`:

```prisma
generator nzod {
  provider    = "nzod-prisma"
  output      = "../src/generated/nzod"
  generateDto = true
}
```

### Using `decimal.js` for Decimal fields

Install `decimal.js`:

```shell
yarn add decimal.js

npm install decimal.js
```

Set `useDecimalJs` to `true`:

```prisma
generator nzod {
  provider     = "nzod-prisma"
  output       = "../src/generated/nzod"
  useDecimalJs = true
}
```

## Contributing

1. Fork this repo
2. Use the [Regular flow](#regular-flow)

Please follow [Conventions](#conventions)

## Maintenance

The dev branch is `main` - any developer changes is merged in there.

Also, there is a `release/latest` branch. It always contains the actual source code for release published with `latest` tag.

All changes is made using Pull Requests - push is forbidden. PR can be merged only after successfull `test-and-build` workflow checks.

When PR is merged, `release-drafter` workflow creates/updates a draft release. The changelog is built from the merged branch scope (`feat`, `fix`, etc) and PR title. When release is ready - we publish the draft.

Then, the `release` workflow handles everything:

- It runs tests, builds a package, and publishes it
- It synchronizes released tag with `release/latest` branch

### Regular flow

1. Create [feature branch](#conventions)
2. Make changes in your feature branch and [commit](#conventions)
3. Create a Pull Request from your feature branch to `main`  
   The PR is needed to test the code before pushing to release branch
4. If your PR contains breaking changes, don't forget to put a `BREAKING CHANGES` label
5. Merge the PR in `main`
6. All done! Now you have a drafted release - just publish it when ready

### Prerelease flow

1. Assume your prerelease tag is `beta`
2. Create `release/beta` branch
3. Create [feature branch](#conventions)
4. Make changes in your feature branch and [commit](#conventions)
5. Create a Pull Request from your feature branch to `release/beta`  
   The PR is needed to test the code before pushing to release branch
6. Create Github release with tag like `v1.0.0-beta`, pointing to `release/beta` branch  
   For next `beta` versions use semver build syntax: `v1.0.0-beta+1`
7. After that, the `release` workflow will publish your package with the `beta` tag
8. When the `beta` version is ready to become `latest` - create a Pull Request from `release/beta` to `main` branch
9. Continue from the [Regular flow's](#regular-flow) #5 step

### Conventions

**Feature branches**:

- Should start with `feat/`, `fix/`, `docs/`, `refactor/`, and etc., depending on the changes you want to propose (see [pr-labeler.yml](./.github/pr-labeler.yml) for a full list of scopes)

**Commits**:

- Should follow the [Conventional Commits specification](https://www.conventionalcommits.org)
- You can find supported types and scopes into `.cz-config.js`

**Pull requests**:

- Should have human-readable name, for example: "Add a TODO list feature"
- Should describe changes
- Should have correct labels (handled by PR Labeler in most cases)
