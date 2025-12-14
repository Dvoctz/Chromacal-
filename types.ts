
export enum AppMode {
  LANDING = 'LANDING',
  DISPLAY_SOURCE = 'DISPLAY_SOURCE', // The screen being calibrated
  SENSOR_DEVICE = 'SENSOR_DEVICE',   // The camera measuring colors
  REPORT = 'REPORT',
  PAYMENT = 'PAYMENT',
  MANUAL = 'MANUAL'
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface MeasurementPoint {
  label: string;
  targetColor: RGB;
  measuredColor?: RGB;
}

export interface CalibrationResult {
  profileName: string;
  gamma: number;
  colorTemperature: string;
  deltaE: number;
  redGain: number;
  greenGain: number;
  blueGain: number;
  contrastRatio: string;
  feedback: string;
}

export interface CalibrationSettings {
  targetGamma: string;
  targetWhitePoint: string;
}

export const DEFAULT_SETTINGS: CalibrationSettings = {
  targetGamma: '2.2',
  targetWhitePoint: 'D65 (6500K)'
};

// Reordered: White is now first to allow Camera Exposure Locking phase
export const TARGET_POINTS: MeasurementPoint[] = [
  { label: 'Reference White (Lock Exposure)', targetColor: { r: 255, g: 255, b: 255 } },
  { label: 'Red Reference', targetColor: { r: 255, g: 0, b: 0 } },
  { label: 'Green Reference', targetColor: { r: 0, g: 255, b: 0 } },
  { label: 'Blue Reference', targetColor: { r: 0, g: 0, b: 255 } },
  { label: 'Black Point', targetColor: { r: 0, g: 0, b: 0 } },
  { label: '50% Gray', targetColor: { r: 128, g: 128, b: 128 } },
];
