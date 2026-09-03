import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Server-side Gemini AI client initialization
  let aiClient: GoogleGenAI | null = null;
  function getAIClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI C-Tutor Endpoint
  app.post('/api/ai-tutor', async (req, res) => {
    const { prompt, code, problemTitle, senderName, senderRole, isDraftForAdmin } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
      const ai = getAIClient();

      if (ai) {
        const systemInstruction = isDraftForAdmin
          ? `You are an expert Assistant for CS201 C Programming Course Instructor CYRUS. Draft a clear, pedagogically sound, encouraging reply to a student question about C programming. Provide short, clean C code snippets if helpful. Keep it concise, friendly, and precise.`
          : `You are an intelligent, friendly AI C Programming Tutor for university students in CS201 (C Systems & Architecture).
Your goal is to guide students through C concepts (pointers, memory management, stack vs heap, arrays, strings, structs, loops, recursion, bitwise operations, segmentation faults, and standard library functions).
Provide clear explanations with code snippets where helpful. Highlight common pitfalls and explain the "why" behind C memory architecture.`;

        let contents = `Student Question / Query: ${prompt}`;
        if (problemTitle) {
          contents += `\nRelated Practice Problem: ${problemTitle}`;
        }
        if (code) {
          contents += `\nStudent's C Code Snippet:\n\`\`\`c\n${code}\n\`\`\``;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const replyText = response.text || 'I analyzed your C programming query.';
        return res.json({ reply: replyText, source: 'gemini' });
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local C knowledge base:', err?.message);
    }

    // Fallback C Knowledge Engine
    const lowerPrompt = prompt.toLowerCase();
    let fallbackReply = '';

    if (lowerPrompt.includes('pointer') || lowerPrompt.includes('dereference') || lowerPrompt.includes('*') || lowerPrompt.includes('&')) {
      fallbackReply = `### 📌 Pointer Concept Explanation
In C, a **pointer** is a variable that stores the memory address of another variable.

- \`int *ptr = &x;\` stores the address of \`x\` in \`ptr\`.
- \`*ptr = 20;\` (*dereferencing*) accesses or alters the value stored at that address.

**Why use pointers?**
1. Pass-by-reference in functions (allowing functions to modify caller variables).
2. Dynamic memory allocation on the Heap (\`malloc\` / \`calloc\`).
3. Efficient array and buffer traversal without copying large data structures.`;
    } else if (lowerPrompt.includes('malloc') || lowerPrompt.includes('free') || lowerPrompt.includes('leak') || lowerPrompt.includes('heap')) {
      fallbackReply = `### 🧠 Dynamic Memory & Heap Management
1. **Allocation**: \`int *arr = (int *)malloc(n * sizeof(int));\`
2. **Safety Check**: Always check if \`arr == NULL\` before use!
3. **Deallocation**: Every \`malloc\` must have a matching \`free(arr);\` to prevent memory leaks.
4. **Best Practice**: After \`free(arr);\`, set \`arr = NULL;\` to avoid dangling pointers.`;
    } else if (lowerPrompt.includes('seg') || lowerPrompt.includes('segmentation fault') || lowerPrompt.includes('crash')) {
      fallbackReply = `### ⚠️ Debugging Segmentation Faults (SIGSEGV)
A Segmentation Fault happens when your program tries to access memory it doesn't have permission to read/write.

**Common Causes in C:**
1. **Dereferencing a NULL or uninitialized pointer** (\`int *p; *p = 5;\`).
2. **Buffer Overflow**: Accessing array indices outside bounds (\`arr[10]\` in a size-10 array, where valid indices are 0–9).
3. **Using memory after \`free()\`** (Dangling pointer).
4. **Missing \`&\` in \`scanf\`**: e.g., \`scanf("%d", num);\` instead of \`scanf("%d", &num);\`.`;
    } else if (lowerPrompt.includes('struct') || lowerPrompt.includes('typedef')) {
      fallbackReply = `### 📦 Structs & Custom Data Types in C
A \`struct\` groups related variables of different types into a single unit:

\`\`\`c
typedef struct {
    char name[50];
    int id;
    float gpa;
} Student;

// Usage:
Student s1 = {"Alex", 101, 3.85f};
printf("Name: %s, GPA: %.2f\\n", s1.name, s1.gpa);
\`\`\`

When accessing via a pointer, use the arrow operator \`->\`: \`ptr->gpa = 4.0f;\`.`;
    } else {
      fallbackReply = `Hello! In C systems programming, writing clean, memory-safe code is essential. 

Key principles to keep in mind:
- **Always initialize your variables** to prevent garbage values.
- **Bounds check all arrays & buffers** to avoid buffer overflows.
- **Match every \`malloc\` with a \`free\`** to maintain zero memory leaks.

Feel free to ask a specific question about your active code or a problem concept!`;
    }

    return res.json({ reply: fallbackReply, source: 'fallback-tutor' });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`C Practice Studio server running at http://localhost:${PORT}`);
  });
}

startServer();
