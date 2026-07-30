export default {
  async fetch(request) {
    const url = new URL(request.url);
    const rawCode = url.searchParams.get("code") || `
      shellprint_pt[Welcome to Web PPLS]
      top[Running PPLS script on Cloudflare Workers]
      mathop[10 + 5]printop
    `;

    const lines = rawCode.split('\n');
    let outputLogs = [];
    let labels = {};

    // First pass: locate labels
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      let labelMatch = line.match(/label\[(.*?)\]/);
      if (labelMatch) {
        labels[labelMatch[1]] = i;
      }
    }

    // Execution pass (web-compatible commands only)
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line || line.startsWith('//')) continue;

      // shellprint_pt[text]
      let printPtMatch = line.match(/shellprint_pt\[(.*?)\]/);
      if (printPtMatch) {
        outputLogs.push(`<p>${printPtMatch[1]}</p>`);
        continue;
      }

      // top[text]
      let topMatch = line.match(/top\[(.*?)\]/);
      if (topMatch) {
        outputLogs.push(`<p><b>[TOP]:</b> ${topMatch[1]}</p>`);
        continue;
      }

      // mathop[expr]printop
      let mathMatch = line.match(/mathop\[(.*?)\]printop/);
      if (mathMatch) {
        try {
          let expr = mathMatch[1].replace(/×/g, '*').replace(/÷/g, '/');
          let result = Function(`'use strict'; return (${expr})`)();
          outputLogs.push(`<p><b>[MATH RESULT]:</b> ${result}</p>`);
        } catch (e) {
          outputLogs.push(`<p style="color:red;">[MATH ERROR]: Invalid expression</p>`);
        }
        continue;
      }
    }

    const html = `<!DOCTYPE html>
<html>
<head>
<title>Web PPLS Interpreter</title>
</head>
<body style="background:#1e1e1e;color:#d4d4d4;font-family:monospace;padding:20px;">
<h2>Web PPLS Custom Language Console</h2>
<p style="color:#6a9955;">// Pass your PPLS script using the ?code= query parameter</p>
<hr style="border-color:#333;">
<h3>Output Window:</h3>
<div style="background:#000;padding:15px;border:1px solid #444;border-radius:4px;">
${outputLogs.length > 0 ? outputLogs.join('') : '<p>No output generated or empty script.</p>'}
</div>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8"
      }
    });
  }
};
