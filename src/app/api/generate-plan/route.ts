import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key is not configured." },
      { status: 500 }
    );
  }

  try {
    const { examName, timeAvailable, proficiency } = await req.json();

    if (!examName || !timeAvailable || !proficiency) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      Create a detailed study plan for the following exam:
      Exam: ${examName}
      Preparation Time: ${timeAvailable}
      Current Proficiency: ${proficiency}

      Please provide the response in a structured JSON format with the following keys:
      - "examTitle": The full name of the exam.
      - "overview": A brief summary of the preparation strategy.
      - "syllabus": An array of objects, each with "subject" and "subtopics" (array of strings).
      - "schedule": An array of "milestones", each with "timeframe" (e.g., Week 1) and "goals" (array of strings).
      - "tips": An array of general study tips for this specific exam.

      Ensure the JSON is valid and the content is accurate for the ${examName} exam.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to extract JSON if the model wrapped it in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : text;
    
    const studyPlan = JSON.parse(jsonString);

    return NextResponse.json(studyPlan);
  } catch (error: unknown) {
    console.error("Error generating study plan:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate study plan. Please try again.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
