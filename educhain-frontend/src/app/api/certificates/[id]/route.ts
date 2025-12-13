import { NextResponse } from 'next/server';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

function getNetwork(): 'localnet' | 'devnet' | 'testnet' | 'mainnet' {
  const raw = process.env.NEXT_PUBLIC_SUI_NETWORK;
  const v = raw && typeof raw === 'string' ? raw.trim() : '';
  if (v === 'localnet' || v === 'devnet' || v === 'testnet' || v === 'mainnet') return v;
  return 'testnet';
}

function getRpcUrl() {
  const raw = process.env.NEXT_PUBLIC_SUI_RPC_URL;
  const v = raw && typeof raw === 'string' ? raw.trim() : '';
  return v || getFullnodeUrl(getNetwork());
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  try {
    const client = new SuiClient({ url: getRpcUrl() });
    const obj = await client.getObject({ id, options: { showContent: true, showType: true } });

    const content: any = obj?.data?.content;
    const fields: any = content && typeof content === 'object' ? (content as any).fields : null;
    const type: string | undefined = obj?.data?.type ? String(obj.data.type) : undefined;

    if (!fields) {
      return NextResponse.json({ error: 'Object has no readable fields', objectId: id }, { status: 404 });
    }

    // Best-effort validation: ensure it looks like an EduChain Certificate.
    if (!type || !type.includes('::educhain::Certificate')) {
      return NextResponse.json(
        { error: 'Object is not an educhain::Certificate', objectId: id, type: type ?? null },
        { status: 400 },
      );
    }

    const courseId = fields.course_id != null ? String(fields.course_id) : '';
    const score = fields.score != null ? String(fields.score) : '';
    const student = fields.student != null ? String(fields.student) : '';

    const metadata = {
      name: `EduChain Certificate — Course #${courseId || '?'}`,
      description: 'On-chain completion certificate minted by EduChain.',
      external_url: `https://suiexplorer.com/object/${id}?network=${getNetwork()}`,
      attributes: [
        { trait_type: 'course_id', value: courseId || null },
        { trait_type: 'score', value: score || null },
        { trait_type: 'student', value: student || null },
        { trait_type: 'certificate_object_id', value: id },
      ],
    };

    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Failed to load certificate', objectId: id },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}


