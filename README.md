## Description

PixelMap Adventure MMO Game Server

## Installation

```bash
npm install
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Initialize Database
```bash
# Initialize Schema
npx mikro-orm schema:update -r

# Seed initial data
npx mikro-orm seeder:run
```
