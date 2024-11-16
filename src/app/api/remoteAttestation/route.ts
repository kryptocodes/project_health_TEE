import {TappdClient} from '@phala/dstack-sdk'
import { verifyProof} from '@reclaimprotocol/js-sdk'
import 'dotenv/config'

export const dynamic = 'force-dynamic'

const endpoint = process.env.DSTACK_SIMULATOR_ENDPOINT || 'http://localhost:8090'

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


export async function POST(request: Request) {
  try{
    const res = await request.json()
    const { imageProof, aiProof } = res
   

    if(!imageProof || !aiProof){
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transformedImageProof = transformProof(imageProof)
    const transformedAiProof = transformProof(aiProof)

     const verifyImageProof = await verifyProof(transformedImageProof)
     if(!verifyImageProof){
      return Response.json({ error: 'Failed to verify image proof' }, { status: 500 });
     }
     const verifyAiProof = await verifyProof(transformedAiProof)
     if(!verifyAiProof){
      return Response.json({ error: 'Failed to verify ai proof' }, { status: 500 });
     }

     console.log(transformedAiProof?.extractedParameterValues)
     const JSONParsed = JSON.parse(transformedAiProof?.extractedParameterValues?.data)?.choices[0]?.message?.content

     const userInfo = JSONParsed?.replace(/```json|```/g, '')

     console.log(userInfo)
  
      
     const JSONParsedUserInfo = JSON.parse(userInfo)
     const userInfoObject = {
      isPositive: JSONParsedUserInfo?.isPositive,
     }

     const client = new TappdClient(endpoint)

    const getRemoteAttestation = await client.tdxQuote(JSON.stringify(userInfoObject));
    return Response.json({
      attestation: getRemoteAttestation,
      response: userInfoObject
    });

  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to get remote attestation' }, { status: 500 });
  }
}
