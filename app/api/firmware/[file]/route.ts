import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  try {
    // Prevent path traversal by resolving only the basename
    const resolvedParams = await params;
    const fileName = path.basename(resolvedParams.file);
    const firmwarePath = path.join(process.cwd(), 'firmware', fileName);

    const data = await fs.readFile(firmwarePath);

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    const message = (err as Error)?.message || 'Unknown error';
    return NextResponse.json({ error: 'Not Found', message }, { status: 404 });
  }
}


