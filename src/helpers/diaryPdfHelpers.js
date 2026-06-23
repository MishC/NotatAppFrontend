import { escapeHtml, sanitizeFileName } from "./diaryHelpers";

export function openDiaryPdfWindow({ pages, title }) {
  const pagesHtml = pages
    .map(
      (page) => `
        <section class="pdf-page">
          <main class="pdf-content">${page.html || ""}</main>
        </section>
      `
    )
    .join("");
  const printWindow = window.open("", "_blank", "width=900,height=1100");

  if (!printWindow) return false;

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(sanitizeFileName(title))}.pdf</title>
        <style>
          @page { size: A4; margin: 14mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: white;
            color: #1f2937;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          .pdf-page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 14mm;
            page-break-after: always;
            background: white;
          }
          .pdf-page:last-child {
            page-break-after: auto;
          }
          .pdf-content {
            min-height: calc(297mm - 28mm);
            font-size: 18px;
            line-height: 2;
            white-space: normal;
            overflow-wrap: anywhere;
          }
          .pdf-content img {
            display: block;
            max-width: 100%;
            max-height: 320px;
            margin: 12px 0;
            border-radius: 16px;
            object-fit: contain;
          }
          @media print {
            body { background: white; margin: 0; }
            .pdf-page {
              width: auto;
              min-height: auto;
              margin: 0;
              padding: 0;
            }
            .pdf-content {
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>${pagesHtml}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  return true;
}
