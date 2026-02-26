import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    AlignmentType,
} from 'docx';
import { saveAs } from 'file-saver';

interface ParsedLine {
    type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet' | 'checkbox' | 'table-header' | 'table-row' | 'empty';
    text: string;
    cells?: string[];
    checked?: boolean;
}

function parseMarkdownLines(markdown: string): ParsedLine[] {
    const lines = markdown.split('\n');
    return lines.map((line): ParsedLine => {
        const trimmed = line.trim();
        if (!trimmed) return { type: 'empty', text: '' };
        if (trimmed.startsWith('# ')) return { type: 'h1', text: trimmed.slice(2) };
        if (trimmed.startsWith('## ')) return { type: 'h2', text: trimmed.slice(3) };
        if (trimmed.startsWith('### ')) return { type: 'h3', text: trimmed.slice(4) };
        if (trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] '))
            return { type: 'checkbox', text: trimmed.slice(6), checked: true };
        if (trimmed.startsWith('- [ ] '))
            return { type: 'checkbox', text: trimmed.slice(6), checked: false };
        if (trimmed.startsWith('- ') || trimmed.startsWith('* '))
            return { type: 'bullet', text: trimmed.slice(2) };
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            const cells = trimmed.split('|').filter(Boolean).map((c) => c.trim());
            if (cells.every((c) => /^[-:]+$/.test(c))) return { type: 'empty', text: '' };
            return { type: 'table-row', text: trimmed, cells };
        }
        return { type: 'paragraph', text: trimmed };
    });
}

function cleanBold(text: string): TextRun[] {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return new TextRun({ text: part.slice(2, -2), bold: true, size: 22 });
        }
        return new TextRun({ text: part, size: 22 });
    });
}

export async function exportToDocx(markdown: string, title: string): Promise<void> {
    const parsed = parseMarkdownLines(markdown);
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(
        new Paragraph({
            children: [new TextRun({ text: title, bold: true, size: 36, color: '0A5C60' })],
            heading: HeadingLevel.TITLE,
            spacing: { after: 400 },
        })
    );

    let tableRows: TableRow[] = [];
    let inTable = false;

    for (const line of parsed) {
        if (line.type === 'table-row' && line.cells) {
            if (!inTable) {
                inTable = true;
                tableRows = [];
            }
            tableRows.push(
                new TableRow({
                    children: line.cells.map(
                        (cell) =>
                            new TableCell({
                                children: [new Paragraph({ children: cleanBold(cell) })],
                                width: { size: 100 / line.cells!.length, type: WidthType.PERCENTAGE },
                                borders: {
                                    top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                                    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                                    left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                                    right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
                                },
                            })
                    ),
                })
            );
            continue;
        }

        if (inTable && tableRows.length > 0) {
            children.push(
                new Table({
                    rows: tableRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                })
            );
            children.push(new Paragraph({ text: '' }));
            tableRows = [];
            inTable = false;
        }

        switch (line.type) {
            case 'h1':
                children.push(
                    new Paragraph({
                        children: [new TextRun({ text: line.text, bold: true, size: 32, color: '0A5C60' })],
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 },
                    })
                );
                break;
            case 'h2':
                children.push(
                    new Paragraph({
                        children: [new TextRun({ text: line.text, bold: true, size: 28, color: '0B7B6E' })],
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 300, after: 150 },
                    })
                );
                break;
            case 'h3':
                children.push(
                    new Paragraph({
                        children: [new TextRun({ text: line.text, bold: true, size: 24 })],
                        heading: HeadingLevel.HEADING_3,
                        spacing: { before: 200, after: 100 },
                    })
                );
                break;
            case 'bullet':
                children.push(
                    new Paragraph({
                        children: cleanBold(line.text),
                        bullet: { level: 0 },
                        spacing: { after: 80 },
                    })
                );
                break;
            case 'checkbox':
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: line.checked ? '☑ ' : '☐ ', size: 22 }),
                            ...cleanBold(line.text),
                        ],
                        spacing: { after: 80 },
                        indent: { left: 360 },
                    })
                );
                break;
            case 'paragraph':
                children.push(
                    new Paragraph({
                        children: cleanBold(line.text),
                        spacing: { after: 120 },
                        alignment: AlignmentType.JUSTIFIED,
                    })
                );
                break;
            default:
                break;
        }
    }

    // Flush remaining table
    if (inTable && tableRows.length > 0) {
        children.push(
            new Table({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
            })
        );
    }

    const doc = new Document({
        sections: [{ children }],
        styles: {
            default: {
                document: {
                    run: { font: 'Calibri', size: 22 },
                },
            },
        },
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title.replace(/[^a-zA-Z0-9]/g, '_')}_brief.docx`);
}
