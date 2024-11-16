import {
    SignProtocolClient,
    SpMode,
    EvmChains,
    delegateSignAttestation,
    delegateSignRevokeAttestation,
    delegateSignSchema,
    
  } from "@ethsign/sp-sdk";
  import {TappdClient} from '@phala/dstack-sdk'
import 'dotenv/config'
import { privateKeyToAccount } from 'viem/accounts'
import {keccak256, toBytes,  } from "viem";
import path from 'path';
import { verifyProof} from '@reclaimprotocol/js-sdk'
import 'dotenv/config'

import { promises as fs } from 'fs';

const endpoint = process.env.DSTACK_SIMULATOR_ENDPOINT || 'http://localhost:8090'

const statusFilePath = path.join(process.cwd(), 'src', 'app', 'api', 'status', 'status.json');

const privateKey = process.env.PRIVATE_KEY

export const dynamic = 'force-dynamic'


export function transformProof(proof: any) {
    if (!proof || !proof.claim || !proof.signatures) {
      throw new Error("Invalid proof object");
    }
    return {
      claimData: proof.claim,
      identifier: proof.claim.identifier,
      signatures: [
        "0x" + Buffer.from(proof.signatures.claimSignature).toString("hex"),
      ],
      extractedParameterValues: proof?.claim?.context ? JSON?.parse(proof?.claim?.context)?.extractedParameters : '',
      witnesses: [
        {
          id: proof?.signatures?.attestorAddress,
          url: "wss://witness.reclaimprotocol.org/ws",
        },
      ],
    };
  }


  export async function updateStatus(referenceId: string, attestationId: string, schemaId: string, error: string, status: string, message: string, isPositive: string) {
    const statusObject = {
        referenceId, attestationId, schemaId, error, status, message, isPositive
    }
    await fs.writeFile(statusFilePath, JSON.stringify(statusObject, null, 2))
  }

export async function POST(request: Request) {
    const res = await request.json()
   console.log("Received request")
    const { imgProof, aiProof, fromAddress, toAddress, referenceId } = res
    console.log(imgProof, aiProof, fromAddress, toAddress, referenceId)
    try {
      await updateStatus(referenceId,"", "", "", "pending", "", "")

    


        if(!imgProof || !aiProof){
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }
      
 
      
           const verifyImageProof = await verifyProof(imgProof)
           if(!verifyImageProof){
            return Response.json({ error: 'Failed to verify image proof' }, { status: 500 });
           }
           const verifyAiProof = await verifyProof(aiProof)
           if(!verifyAiProof){
            return Response.json({ error: 'Failed to verify ai proof' }, { status: 500 });
           }

           console.log("Verified proofs", )
           //SON?.parse(data?.imgProof?.claimData?.context)?.extractedParameters?.data
            const extractedParameters = JSON?.parse(aiProof?.claimData?.context)?.extractedParameters
           console.log(extractedParameters)
           const JSONParsed = JSON.parse(extractedParameters?.data)?.choices[0]?.message?.content
      
           const userInfo = JSONParsed?.replace(/```json|```/g, '')
      
           console.log(userInfo)
        
            
           const JSONParsedUserInfo = JSON.parse(userInfo)
           const userInfoObject = {
            isPositive: JSONParsedUserInfo?.isPositive,
           }
      
           const tapClient = new TappdClient(endpoint)
      
           
          const getRemoteAttestation = await tapClient.tdxQuote(JSON.stringify(userInfoObject));
   
 console.log("Got remote attestation", getRemoteAttestation)


        const client = new SignProtocolClient(SpMode.OnChain, {
            chain: EvmChains.polygonAmoy,
            account: privateKeyToAccount(privateKey as `0x${string}`)
        });
      
      // encrypt the result with the sender's public key using viem
      const messageHash = 'true'
      const encryptedResult = messageHash

        // Delegated create schema
        const delegationPrivateKey = process.env.DELEGATION_PRIVATE_KEY
        const schemaInfo = await delegateSignSchema(
            {
                name: "Medical Report",
                data: [{ name: "toAddress", type: "address" }, { name: "result", type: "string" }, { name: "quote", type: "string" }],
            },
            {
                chain: EvmChains.polygonAmoy,
                delegationAccount: privateKeyToAccount(delegationPrivateKey as `0x${string}`),
            }
        );

        const schemaId = '0xb2'
        // Create attestation using schema ID from schemaInfo
        const attestationInfo = await delegateSignAttestation(
            {
                schemaId: schemaId, // Use the schema ID from schemaInfo
                data: { toAddress, result: encryptedResult, quote: getRemoteAttestation },
                indexingValue: toAddress,
            },
            {
                chain: EvmChains.polygonAmoy,
                delegationAccount: privateKeyToAccount(delegationPrivateKey as `0x${string}`),
            }
        );

        const delegationCreateAttestationRes = await client.createAttestation(
            attestationInfo.attestation,
            {
                delegationSignature: attestationInfo.delegationSignature,
            }
        );

        // Convert any BigInt values to strings before JSON serialization
        const response = {
            attestation: delegationCreateAttestationRes.attestationId.toString(),
            schema: schemaId
        };

     
        await updateStatus(referenceId, delegationCreateAttestationRes.attestationId.toString(), schemaId, "", "success", "", JSONParsedUserInfo?.isPositive)
        return Response.json(response);

    } catch (error) {
        console.log(error)
        await updateStatus(referenceId, "", "", String(error), "error", "", "")
     
        return Response.json({
            error: String(error),
        });
    }
}


