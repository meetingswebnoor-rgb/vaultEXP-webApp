const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectDocs() {
  try {
    const docs = await prisma.document.findMany({
      select: {
        id: true,
        originalName: true,
        extractedText: true,
        aiSummary: true
      },
      take: 5
    });
    console.log(JSON.stringify(docs, null, 2));
    await prisma.$disconnect();
  } catch (err) {
    console.error(err);
  }
}

inspectDocs();
