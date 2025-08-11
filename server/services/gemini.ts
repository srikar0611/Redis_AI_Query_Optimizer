import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface OptimizationSuggestion {
  optimizationType: "index" | "rewrite" | "cache" | "partition";
  suggestion: string;
  confidence: number;
  estimatedImprovement: number;
  sqlBefore?: string;
  sqlAfter?: string;
}

export async function analyzeQueryForOptimization(
  queryText: string,
  executionTime: number,
  tableSchema?: string
): Promise<OptimizationSuggestion[]> {
  try {
    const systemPrompt = `You are a database optimization expert. Analyze SQL queries and provide specific optimization suggestions.
    
Context:
- Query execution time: ${executionTime}ms
- Database: PostgreSQL
- ${tableSchema ? `Table schema: ${tableSchema}` : ''}

Provide optimization suggestions in JSON format with the following structure:
{
  "suggestions": [
    {
      "optimizationType": "index|rewrite|cache|partition",
      "suggestion": "Detailed explanation of the optimization",
      "confidence": 85,
      "estimatedImprovement": 67,
      "sqlBefore": "original query if relevant",
      "sqlAfter": "optimized query if suggesting rewrite"
    }
  ]
}

Focus on practical, actionable recommendations.`;

    const userPrompt = `Analyze this SQL query for optimization opportunities:

Query: ${queryText}
Execution Time: ${executionTime}ms

Provide specific suggestions to improve performance.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  optimizationType: { type: "string" },
                  suggestion: { type: "string" },
                  confidence: { type: "number" },
                  estimatedImprovement: { type: "number" },
                  sqlBefore: { type: "string" },
                  sqlAfter: { type: "string" }
                },
                required: ["optimizationType", "suggestion", "confidence", "estimatedImprovement"]
              }
            }
          },
          required: ["suggestions"]
        }
      },
      contents: userPrompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return data.suggestions || [];
    }

    return [];
  } catch (error) {
    console.error("Failed to analyze query with AI:", error);
    return [];
  }
}

export async function generateQueryInsights(queries: Array<{
  queryText: string;
  executionTime: number;
  frequency: number;
}>): Promise<{
  summary: string;
  topIssues: string[];
  recommendations: string[];
}> {
  try {
    const systemPrompt = `You are a database performance analyst. Analyze a collection of queries and provide insights about overall database health and optimization opportunities.

Provide insights in JSON format:
{
  "summary": "Overall assessment of database performance",
  "topIssues": ["Issue 1", "Issue 2", "Issue 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}`;

    const querySummary = queries.map((q, i) => 
      `Query ${i + 1}: ${q.queryText.substring(0, 100)}... (${q.executionTime}ms, frequency: ${q.frequency})`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            topIssues: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array", 
              items: { type: "string" }
            }
          },
          required: ["summary", "topIssues", "recommendations"]
        }
      },
      contents: `Analyze these database queries:\n\n${querySummary}`,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    }

    return {
      summary: "Unable to generate insights",
      topIssues: [],
      recommendations: []
    };
  } catch (error) {
    console.error("Failed to generate query insights:", error);
    return {
      summary: "Error generating insights",
      topIssues: [],
      recommendations: []
    };
  }
}
