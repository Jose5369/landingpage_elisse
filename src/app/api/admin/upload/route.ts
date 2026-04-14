import { NextRequest } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth';

const ALLOWED_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

const VALID_UPLOAD_TYPES = ['logo', 'logo_white', 'favicon'];

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Request body inválido' }, { status: 400 });
  }

  const file = formData.get('file');
  const type = formData.get('type');

  if (!file || !(file instanceof File)) {
    return Response.json({ error: 'Campo "file" requerido' }, { status: 400 });
  }

  if (!type || typeof type !== 'string' || !VALID_UPLOAD_TYPES.includes(type)) {
    return Response.json(
      { error: `Campo "type" debe ser uno de: ${VALID_UPLOAD_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return Response.json(
      { error: 'Tipo de archivo no permitido. Solo se aceptan PNG, JPEG, WebP y SVG.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return Response.json(
      { error: 'El archivo excede el límite de 2 MB.' },
      { status: 413 }
    );
  }

  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${type}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, bytes);

    return Response.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('[POST /api/admin/upload]', error);
    return Response.json({ error: 'Error al guardar el archivo' }, { status: 500 });
  }
}
