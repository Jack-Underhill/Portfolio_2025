import { Buffer } from 'node:buffer';

function escapePdfText(text) {
  return text.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
}

export function createPdfBuffer(pageTexts) {
  const pages = Array.isArray(pageTexts) ? pageTexts : [pageTexts];
  const pageCount = pages.length;
  const fontId = 3 + pageCount * 2;
  const kids = pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>\nendobj\n`,
  ];

  pages.forEach((pageText, index) => {
    const pageId = 3 + index * 2;
    const contentId = pageId + 1;
    const stream = pageText
      ? `BT /F1 18 Tf 40 90 Td (${escapePdfText(pageText)}) Tj ET\n`
      : '';

    objects.push(`${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>\nendobj\n`);
    objects.push(`${contentId} 0 obj\n<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream\nendobj\n`);
  });

  objects.push(`${fontId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += object;
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf);
}
