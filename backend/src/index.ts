import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const roastsStore = new Map<string, any>();

app.use(cors());
app.use(express.json());

// Set up multer for temporary file storage
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'AI CV Roaster Backend is running!' });
});

// Endpoint for CV upload and text extraction
app.post('/api/roast', upload.single('cv'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;
  const extension = path.extname(req.file.originalname).toLowerCase();
  
  let extractedText = '';

  try {
    if (mimeType === 'application/pdf' || extension === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      extension === '.docx'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (mimeType === 'text/plain' || extension === '.txt') {
      extractedText = fs.readFileSync(filePath, 'utf-8');
    } else {
      // Clean up the file
      fs.unlinkSync(filePath);
      res.status(400).json({ error: 'Unsupported file type. Only PDF, DOCX, and TXT are allowed.' });
      return;
    }

    // Clean up the temporary file after extraction
    fs.unlinkSync(filePath);

    // Clean extracted text: remove excessive whitespace
    const cleanedText = extractedText.replace(/\s+/g, ' ').trim();

    // Call OpenAI API for roasting
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `You are AI CV Roaster. Roast resumes humorously but professionally. Be funny, sarcastic, but never offensive. Provide structured feedback and improvements.

Return STRICT JSON:

{
  "overallScore": number,
  "roastLevel": string,
  "summary": string,
  "finalVerdict": string,
  "categories": [
    {
      "name": string,
      "score": number,
      "roast": string,
      "suggestions": string[]
    }
  ]
}

Return only JSON, no extra text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the resume text:\n\n${cleanedText}` }
      ],
      response_format: { type: "json_object" }
    });

    const roastResultStr = completion.choices[0]?.message?.content || "{}";
    const roastResult = JSON.parse(roastResultStr);

    // Save to in-memory store
    const roastId = crypto.randomUUID();
    roastsStore.set(roastId, roastResult);

    // Return the structured response
    res.json({ id: roastId, ...roastResult });
  } catch (error) {
    console.error('Error extracting text:', error);
    // Ensure we clean up the file in case of error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: 'Failed to process file' });
  }
});

app.get('/api/download-report', (req: Request, res: Response): void => {
  const { id } = req.query;
  const result = roastsStore.get(id as string);
  
  if (!result) {
    res.status(404).json({ error: 'Report not found or expired' });
    return;
  }

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="cv-roast-report-${id}.pdf"`);
  doc.pipe(res);

  doc.fontSize(25).text('AI CV Roast Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(16).text(`Overall Score: ${result.overallScore} / 100`);
  doc.fontSize(14).text(`Roast Level: ${result.roastLevel}`);
  doc.moveDown();

  doc.fontSize(14).text('Summary:', { underline: true });
  doc.fontSize(12).text(result.summary);
  doc.moveDown();

  doc.fontSize(16).text('Category Feedback', { underline: true });
  doc.moveDown();

  result.categories.forEach((cat: any) => {
    doc.fontSize(14).text(`${cat.name} - Score: ${cat.score}/100`);
    doc.fontSize(12).text(`Roast: ${cat.roast}`, { oblique: true });
    
    if (cat.suggestions && cat.suggestions.length > 0) {
      doc.moveDown(0.5);
      doc.fontSize(12).text('Suggestions:');
      cat.suggestions.forEach((sug: string) => {
        doc.fontSize(10).text(`• ${sug}`, { indent: 20 });
      });
    }
    doc.moveDown();
  });

  doc.moveDown();
  doc.fontSize(14).text('Final Verdict:', { underline: true });
  doc.fontSize(12).text(`You survived the roast. Use the suggestions above to improve your CV.`);

  doc.end();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
