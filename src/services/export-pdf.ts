export async function exportToPdf(
    contentElement: HTMLElement,
    title: string
): Promise<void> {
    const html2pdf = (await import('html2pdf.js')).default;

    const opt = {
        margin: [15, 15, 15, 15],
        filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}_brief.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait' as const,
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    await (html2pdf as any)().set(opt).from(contentElement).save();
}
