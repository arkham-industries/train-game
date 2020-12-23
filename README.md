![Node.js CI](https://github.com/arkham-industries/train-game/workflows/Node.js%20CI/badge.svg)

# Train Game

A web version of the wildly popular Mexican Train domino game, suitable for all ages!

## Local Development

```
> npm i
> npm run start:watch
```

go to `http://localhost:3000`. The watch task watches all files in `/client`.

## Tests

Test run via Jest using the command 

```
> npm test
```

## Deployment

Heroku has a CI hook for commits into the `master` branch and is deployed to

https://m-train.herokuapp.com/
