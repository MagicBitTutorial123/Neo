import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const pythonFilesDir = join(process.cwd(), 'firmware', 'python files');
    
    // Read all files in the python files directory
    const files = await readdir(pythonFilesDir);
    
    // Filter for .py files only
    const pythonFiles = files.filter(file => file.endsWith('.py'));
    
    // Read content of each Python file
    const filesWithContent = await Promise.all(
      pythonFiles.map(async (filename) => {
        const filePath = join(pythonFilesDir, filename);
        const content = await readFile(filePath, 'utf-8');
        
        return {
          name: filename,
          content: content
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      files: filesWithContent
    });
    
  } catch (error) {
    console.error('Error reading Python files:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to read Python files' 
      },
      { status: 500 }
    );
  }
}
