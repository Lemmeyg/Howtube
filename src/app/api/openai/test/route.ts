import { openai, OPENAI_CONFIG } from '@/lib/openai';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Debug: Log environment variables (masking the API key)
    console.log('OpenAI Config:', {
      model: OPENAI_CONFIG.model,
      maxTokens: OPENAI_CONFIG.maxTokens,
      temperature: OPENAI_CONFIG.temperature,
      apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) + '...'
    });

    // Simple test completion to verify configuration
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "Say 'Hello World'" }],
      model: OPENAI_CONFIG.model,
      max_tokens: 10,
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      message: completion.choices[0].message.content,
      model: OPENAI_CONFIG.model,
      config: {
        model: OPENAI_CONFIG.model,
        maxTokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature,
        apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) + '...'
      }
    });
  } catch (error: any) {
    console.error('OpenAI test failed:', error);
    // Include more detailed error information
    return NextResponse.json({
      success: false,
      error: error.message,
      config: {
        model: OPENAI_CONFIG.model,
        maxTokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature,
        apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) + '...'
      }
    }, { status: 500 });
  }
} 