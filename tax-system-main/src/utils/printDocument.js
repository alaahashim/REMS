const basePrintStyles = `
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    direction: rtl;
    font-family: Arial, Tahoma, sans-serif;
    color: #18212f;
    background: #fff;
  }
  .print-page { width: 100%; }
  .print-header {
    border-bottom: 3px solid #0f766e;
    padding-bottom: 12px;
    margin-bottom: 18px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }
  .print-title { margin: 0; font-size: 22px; color: #0f3d4c; }
  .print-subtitle { color: #667085; margin-top: 5px; font-size: 12px; }
  .print-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 18px;
  }
  .print-field {
    border: 1px solid #d9e2ec;
    border-radius: 6px;
    padding: 10px 12px;
    min-height: 48px;
  }
  .print-label { display: block; color: #667085; font-size: 12px; margin-bottom: 4px; }
  .print-value { font-weight: 700; font-size: 15px; }
  .print-total {
    background: #ecfdf5;
    border-color: #99f6e4;
    color: #0f766e;
  }
  .print-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  .print-table th,
  .print-table td { border: 1px solid #d9e2ec; padding: 8px; text-align: right; }
  .print-table th { background: #f1f5f9; color: #0f3d4c; }
  .print-footer {
    margin-top: 28px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
  }
  .signature-box {
    border-top: 1px solid #98a2b3;
    padding-top: 8px;
    color: #667085;
    min-height: 48px;
  }
`;

export const printDocument = (title, bodyHtml, extraStyles = '') => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>${basePrintStyles}${extraStyles}</style>
      </head>
      <body>${bodyHtml}</body>
    </html>
  `);
  doc.close();

  const runPrint = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => iframe.remove(), 800);
  };

  setTimeout(runPrint, 100);
};
