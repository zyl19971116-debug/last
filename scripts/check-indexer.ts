import {prisma} from '../lib/prisma';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log('BLOCKED: DATABASE_URL is not configured');
    return;
  }

  try {
    const cursor = await prisma.indexerCursor.findUnique({where: {chainId: 46630}});
    console.log(
      cursor
        ? JSON.stringify(
            {
              status: 'PASS',
              nextBlock: cursor.nextBlock.toString(),
              lastBlockHash: cursor.lastBlockHash,
              error: cursor.error,
            },
            null,
            2,
          )
        : 'BLOCKED: indexer cursor has not been initialized',
    );
  } finally {
    await prisma.$disconnect();
  }
}

main();
