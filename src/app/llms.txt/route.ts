import { getSource } from '@/lib/source';
import { llms } from 'fumadocs-core/source';

export const revalidate = false;

export async function GET() {
  const source = await getSource();
  return new Response(llms(source).index());
}