# Rizz_Risk

Prove your health record using zkTLS and TEE Attestation (without revealing your personal data)

## Requirements
- [Node](https://nodejs.org/en) >= v18.18
- [yarn](https://yarnpkg.com/)
- Docker

## Getting Started

We are using the Tappd Simulator and Reclaim Protocol for this project

> NOTE: You will need to set the environment variables in the .env file

## Frontend Setup 

 
https://github.com/predatorx7/medverify.git

## Install dependencies


```bash
yarn
```


First, run the TEE Attestation Simulator:
```bash
docker run --rm -p 8090:8090 phalanetwork/tappd-simulator:latest
```



Build the docker image
```shell
docker build -t your-dapp:latest .
```

After the build is successful, run your docker image to connect to the TEE Attestation Simulator
> NOTE: Your docker image hash will be different than the one listed below.
```shell
docker run --rm -p 3000:3000 your-dapp:latest
```

