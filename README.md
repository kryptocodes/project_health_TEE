# Rizz_Risk

Securely shared a medical report using zero-knowledge proofs—verifying the information without exposing personal details. A new standard for privacy and trust in sensitive conversations. It’s time to normalize secure and respectful health disclosures

![zkTLS](https://img.shields.io/badge/Security-zkTLS-blue)
![TEE](https://img.shields.io/badge/Privacy-TEE-green)
![SignProtocol](https://img.shields.io/badge/Protocol-Sign-orange)


## How it's Made
Privacy-Centric Medical Report Management System

Our project is designed with a strong focus on privacy at every stage: data collection, processing, and sharing. Below is a structured breakdown of our approach:

1. Data Collection
Medical reports are commonly shared via two primary methods: email and online portals. To ensure these reports originate from legitimate sources, we employ the following:

zkFetch Integration:
Using zkFetch (https://docs.reclaimprotocol.org/zkfetch), we verify that data is fetched from private and authentic sources. This ensures the reports come from trusted entities.

ZkEmail Integration (In Progress):
We are integrating ZkEmail (https://prove.email/), which enables users to submit reports directly from their email inbox while preserving privacy.

While these measures confirm the authenticity of the source, we also need to ensure the reports belong to the intended user and not someone else.

2. Sybil Resistance
To verify that users are submitting their own reports, we are integrating the Reclaim Protocol (https://reclaimprotocol.org/) along with a nation-level identity provider:

Government ID Verification:
Users authenticate their identity through a government ID portal. The verified name is then cross-checked to ensure that uploaded reports belong to the correct user.
This mechanism prevents users from uploading reports that do not belong to them, ensuring data integrity and privacy.

3. Document Processing
Once we verify both the user’s authenticity and the data source, the next step is processing the report to extract its content securely:

Challenges with zkVMs:
After evaluating options like zkVM (https://github.com/succinctlabs/sp1) and ezkl (https://ezkl.xyz/), we found they faced limitations in handling large models or multiple model scenarios.

Solution – Verifiable API Calls:
To overcome these limitations, we use a verifiable API call to OpenAI, which generates a cryptographic proof about the document's content. This ensures the integrity of the processing stage.

4. Verifying Compute and Enabling Private Sharing
After generating proofs for all steps, users can privately share their attested proofs with others. Here's how we ensure privacy in this process:

Proof Verification in a TEE:
Using a Trusted Execution Environment (TEE) provided by Phala Network (https://github.com/Phala-Network):

Proofs are verified to ensure the data processed matches the original data fetched from the portal.
The TEE confirms that the uploaded report belongs to the verified user.
Encrypted Proof Sharing:
The TEE encrypts the result and generates an attestation, which can only be decrypted by the recipient using their private key. This ensures:

No private information, such as the user's name or health records, is exposed.
Data remains secure and inaccessible to unauthorized parties.
On-Chain Privacy via Sign Protocol:
Using Sign Protocol (https://docs.sign.global/), attestations are recorded on-chain. However:

The public key of the sharer is not exposed.
Only a "proof request" event is publicly visible.

5. Privacy-Preserving Experience
By combining these elements, we create a system where users can share attestations of medical reports securely and privately. The key highlights include:

Verifiable data authenticity and user identity.
Cryptographic proof of document content.
Private sharing mechanisms that safeguard sensitive information.
Minimal public on-chain exposure.
This end-to-end privacy-focused workflow enables a seamless and secure experience for managing and sharing sensitive medical reports.



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

