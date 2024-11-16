import path from 'path';
import { promises as fs } from 'fs';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const referenceId = searchParams.get('referenceId');

        
        if (!referenceId) {
            return Response.json({ error: 'Attestation ID is required' }, { status: 400 });
        }

        console.log("Getting status for attestation:", referenceId);
        
        const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'status', 'status.json');
        const fileContent = await fs.readFile(filePath, 'utf8');
        const status = JSON.parse(fileContent);
        

        // Check if the requested attestation matches
        if (status.referenceId === referenceId) {
            return Response.json(status);
        }

        return Response.json({ 
            error: 'Attestation not found',
            message: `No status found for attestation ID: ${referenceId}`
        }, { status: 404 });

    } catch (error) {
        console.error('Status check error:', error);
        return Response.json({ 
            error: 'Failed to get status',
            message: String(error)
        }, { status: 500 });
    }
}