import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audioDataUri, fileName } = body;

    if (!audioDataUri || !fileName) {
      return NextResponse.json(
        { error: 'Missing audioDataUri or fileName' },
        { status: 400 }
      );
    }
    
    const base64Data = audioDataUri.split(';base64,').pop();
    if (!base64Data) {
        return NextResponse.json(
            { error: 'Invalid data URI' },
            { status: 400 }
        );
    }
    
    const buffer = Buffer.from(base64Data, 'base64');
    
    const publicDir = path.join(process.cwd(), 'public', 'sounds');
    await fs.mkdir(publicDir, { recursive: true });
    
    const filePath = path.join(publicDir, fileName);
    
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ success: true, path: `/sounds/${fileName}` });
  } catch (error: any) {
    console.error('Error saving sound file:', error);
    return NextResponse.json(
      { error: 'Failed to save sound file', details: error.message },
      { status: 500 }
    );
  }
}
