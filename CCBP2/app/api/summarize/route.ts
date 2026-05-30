import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { article, length, tone } = await req.json();

    // 1. Validation
    if (!article || typeof article !== 'string' || article.trim() === '') {
      return NextResponse.json(
        { error: 'దయచేసి విశ్లేషించడానికి వార్తా కథనాన్ని నమోదు చేయండి. (Please enter a news article to analyze.)' },
        { status: 400 }
      );
    }

    // Defensive Security Check: Prevent API key leak in the article body
    if (/AIzaSy/i.test(article)) {
      return NextResponse.json(
        { error: 'భద్రతా లోపం: సమర్పించిన వార్తా కథనంలో ఏఐ కీ (API Key) గుర్తించబడింది. భద్రతా కారణాల దృష్ట్యా ఈ అభ్యర్థన నిరోధించబడింది. (Security Violation: An API Key was detected in the submitted news article. This request has been blocked for your safety.)' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return NextResponse.json(
        {
          error: 'Gemini API Key is missing or unconfigured. దయచేసి పర్యావరణ వేరియబుల్స్ లో GEMINI_API_KEY ని కాన్ఫిగర్ చేయండి. (Please configure your actual GEMINI_API_KEY in the .env.local file.)',
          isConfigError: true
        },
        { status: 500 }
      );
    }

    // 2. Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 3. Craft system prompt and instruction
    const systemPrompt = `You are an expert Telugu Newsroom AI Assistant, simulating a top-tier digital media editor (similar to chief editors at Namaste Telangana, Eenadu, or Sakshi). 
Your task is to analyze the provided Telugu news article and generate a highly professional, structured editorial suite of content in Telugu.

The requested output MUST be a single, valid JSON object containing exactly the following keys, conforming strictly to the requested types and Telugu language standards:

{
  "shortSummary": "A concise 1-2 sentence overview of the news in pure, professional Telugu (తెలుగు). It should be direct and clear.",
  "detailedSummary": "A detailed summary of 1-2 cohesive paragraphs in professional Telugu (తెలుగు) detailing the who, what, when, where, why, and how of the article.",
  "keyPoints": [
    "4 to 6 critical bulleted facts, statistics, or key decisions from the article in Telugu. Each item must be a complete sentence."
  ],
  "whatsappFriendly": "A short, engaging summary in Telugu optimized for mobile readers on WhatsApp. Must include relevant emojis (like 📢, 📍, 💰, 🚀) to make it highly scannable, starting with a catchy headline line and structured using clean line breaks.",
  "readerHighlights": [
    "Exactly 3 quick-glance, high-impact reader takeaways or soundbites in Telugu. Keep them short, punchy, and highly informative."
  ],
  "suggestedHeadlines": [
    "3 to 5 highly engaging, SEO-friendly, and click-worthy news headlines in Telugu. Vary the style (e.g., formal, breaking news, action-oriented)."
  ],
  "socialMediaBrief": "A highly engaging, brief social media post in Telugu suitable for Twitter/X or Facebook. It must capture the core hook of the story and include 3-4 relevant hashtags (e.g., #TeluguNews, plus story-specific ones)."
}

CRITICAL RULES:
1. All generated text (except hashtags or specific proper nouns where English is preferred) MUST be in high-quality, grammatical, and natural Telugu (తెలుగు).
2. The Telugu vocabulary should be professional, elegant, and standard for Telugu print and digital media (e.g., using terms like 'ఆమోదం', 'కీలక నిర్ణయం', 'ఆర్థిక వృద్ధి'). Avoid informal or slang Telugu.
3. Length Control: The summaries should be adapted to the requested length: "${length}" (Short, Medium, Detailed).
   - "Short": Keep 'shortSummary' and 'detailedSummary' highly concise and punchy.
   - "Medium": Standard, balanced summaries.
   - "Detailed": Elaborate on details, background, and implications in the summaries.
4. Tone Control: The style and vocabulary must be adapted to the requested tone: "${tone}" (Professional, Simple, Social Media, Breaking News).
   - "Professional": Formal, editorial, traditional journalistic style.
   - "Simple": Easy-to-understand, simple Telugu for general readers, explaining complex terms.
   - "Social Media": Energetic, engaging, hook-driven, high readability.
   - "Breaking News": Alert-oriented, urgent, high-impact, starting with 'తాజా సమాచారం' or 'బ్రేకింగ్ న్యూస్' or 'సంచలనం'.
5. Strictly adhere to the facts presented in the input article. DO NOT hallucinate, assume, or add external news facts.
6. The output must be pure, valid JSON. Do not wrap the JSON output in markdown code blocks.`;

    const userPrompt = `Here is the Telugu news article to process:\n\n${article}`;

    // 4. Invoke model using a self-healing fallback sequence
    // In 2026, we check the latest models (gemini-2.5-flash) and fall back to 1.5 versions if not yet available in the key's region/tier.
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    let responseText = '';
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Connecting to Gemini API using model: ${modelName}...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          systemInstruction: systemPrompt,
        });

        if (result && result.response) {
          const text = result.response.text();
          if (text && text.trim() !== '') {
            responseText = text;
            console.log(`Successfully completed analysis using model: ${modelName}`);
            break; // Success! Exit the fallback loop.
          }
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or is not available:`, err.message || err);
        lastError = err;
        const errMsg = (err.message || '').toLowerCase();
        
        // If it's a 404 model not found / unsupported error, we proceed to the next fallback model.
        if (errMsg.includes('not found') || errMsg.includes('not supported') || errMsg.includes('404')) {
          continue;
        } else {
          // For permission errors, invalid API keys, safety blocks, or quota limitations, throw immediately.
          throw err;
        }
      }
    }

    if (!responseText) {
      throw lastError || new Error('All Gemini models failed to process the request.');
    }

    // 5. Parse and Return
    const parsedData = JSON.parse(responseText.trim());
    return NextResponse.json({ data: parsedData });

  } catch (error: any) {
    console.error('Error in summarize API:', error);
    
    let errorMessage = 'సర్వర్ లో సమస్య ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి. (An error occurred on the server. Please try again.)';
    if (error.message && error.message.includes('API key')) {
      errorMessage = 'Invalid Gemini API Key. దయచేసి సరైన GEMINI_API_KEY ని నమోదు చేయండి.';
    } else if (error instanceof SyntaxError) {
      errorMessage = 'AI ప్రతిస్పందనను అన్వయించడంలో విఫలమైంది. దయచేసి మళ్లీ సమర్పించండి. (Failed to parse AI response. Please submit again.)';
    }

    return NextResponse.json(
      { error: error.message || errorMessage },
      { status: 500 }
    );
  }
}
