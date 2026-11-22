// Languages offered for live captions (BCP-47 codes understood by the browser's SpeechRecognition).

export const STT_LANG_STORAGE_KEY = "airsend.meet.stt-lang";

export const STT_LANGUAGES: ReadonlyArray<{ code: string; label: string }> = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "en-IN", label: "English (India)" },
  { code: "en-AU", label: "English (Australia)" },
  { code: "hi-IN", label: "Hindi" },
  { code: "bn-IN", label: "Bengali" },
  { code: "ta-IN", label: "Tamil" },
  { code: "te-IN", label: "Telugu" },
  { code: "mr-IN", label: "Marathi" },
  { code: "es-ES", label: "Spanish (Spain)" },
  { code: "es-MX", label: "Spanish (Mexico)" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "it-IT", label: "Italian" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
  { code: "pt-PT", label: "Portuguese (Portugal)" },
  { code: "nl-NL", label: "Dutch" },
  { code: "ru-RU", label: "Russian" },
  { code: "tr-TR", label: "Turkish" },
  { code: "ar-SA", label: "Arabic" },
  { code: "id-ID", label: "Indonesian" },
  { code: "ja-JP", label: "Japanese" },
  { code: "ko-KR", label: "Korean" },
  { code: "zh-CN", label: "Chinese (Mandarin)" },
];

const LANG_PATTERN = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

export const isValidSttLang = (value: unknown): value is string => typeof value === "string" && LANG_PATTERN.test(value);

export function defaultSttLang(): string {
  if (typeof navigator === "undefined") return "en-US";
  return isValidSttLang(navigator.language) ? navigator.language : "en-US";
}

export function readStoredSttLang(): string | null {
  try {
    const value = window.localStorage.getItem(STT_LANG_STORAGE_KEY);
    return isValidSttLang(value) ? value : null;
  } catch {
    return null;
  }
}

export function storeSttLang(lang: string): void {
  try {
    window.localStorage.setItem(STT_LANG_STORAGE_KEY, lang);
  } catch {
    // private mode / storage disabled: the choice just lasts for this session
  }
}

export function sttLanguageLabel(code: string): string {
  return STT_LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase())?.label ?? code;
}

/** The list for a picker, with the active language added when it is not one of the common ones (e.g. a browser locale). */
export function sttLanguageOptions(current: string): ReadonlyArray<{ code: string; label: string }> {
  return STT_LANGUAGES.some((l) => l.code.toLowerCase() === current.toLowerCase())
    ? STT_LANGUAGES
    : [{ code: current, label: current }, ...STT_LANGUAGES];
}
