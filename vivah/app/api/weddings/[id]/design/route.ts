import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data', 'design');

function filePath(id: string) {
  return path.join(dataDir, id + '.json');
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const fp = filePath(params.id);
  if (!fs.existsSync(fp)) {
    return NextResponse.json({ theme: 'Royal Heritage', decor: [], menu: [], designNotes: '' });
  }
  const raw = fs.readFileSync(fp, 'utf-8');
  return NextResponse.json(JSON.parse(raw));
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(filePath(params.id), JSON.stringify(body, null, 2), 'utf-8');
  return NextResponse.json({ ok: true });
}