import { GoogleGenAI, Type } from "@google/genai";
import { MeasurementPoint, CalibrationResult, CalibrationSettings } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const analyzeCalibration = async (measurements: MeasurementPoint[], settings: CalibrationSettings): Promise<CalibrationResult> => {
  const measurementData = measurements.map(m => ({
    target: `RGB(${m.targetColor.r}, ${m.targetColor.g}, ${m.targetColor.b})`,
    measured: m.measuredColor ? `RGB(${m.measuredColor.r}, ${m.measuredColor.g}, ${m.measuredColor.b})` : 'MISSING'
  }));

  const prompt = `
    I am a professional colorist software. I have performed a screen calibration measurement.
    Here is the data comparing the Target colors (what the screen displayed) vs the Measured colors (what the camera saw):
    ${JSON.stringify(measurementData, null, 2)}

    Please analyze this data to generate a calibration profile.
    
    USER TARGET SETTINGS:
    - Target Gamma: ${settings.targetGamma}
    - Target White Point: ${settings.targetWhitePoint}

    Based on the measured data and the USER TARGET SETTINGS above:
    1. Calculate the estimated *current* Gamma of the display.
    2. Calculate the *Gain adjustments* needed for Red, Green, and Blue channels to achieve the Target White Point (${settings.targetWhitePoint}) and neutral grays.
    3. Calculate an approximate average DeltaE.
    4. Provide professional feedback on the display's current state relative to the requested targets.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            profileName: { type: Type.STRING },
            gamma: { type: Type.NUMBER, description: "The measured current gamma of the display" },
            colorTemperature: { type: Type.STRING, description: "The measured current color temp" },
            deltaE: { type: Type.NUMBER },
            redGain: { type: Type.NUMBER, description: "Gain value to achieve target" },
            greenGain: { type: Type.NUMBER, description: "Gain value to achieve target" },
            blueGain: { type: Type.NUMBER, description: "Gain value to achieve target" },
            contrastRatio: { type: Type.STRING },
            feedback: { type: Type.STRING },
          },
          required: ["profileName", "gamma", "colorTemperature", "deltaE", "redGain", "greenGain", "blueGain", "feedback"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CalibrationResult;
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback mock data if API fails or key is missing
    return {
      profileName: `Standard ${settings.targetGamma} (Fallback)`,
      gamma: parseFloat(settings.targetGamma) || 2.2,
      colorTemperature: settings.targetWhitePoint,
      deltaE: 2.4,
      redGain: 0.98,
      greenGain: 1.02,
      blueGain: 0.95,
      contrastRatio: "1000:1",
      feedback: "Analysis service unavailable. Using safe fallback defaults."
    };
  }
};