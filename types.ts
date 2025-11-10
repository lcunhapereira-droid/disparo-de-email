
export interface ImagePayload {
  data: string; // Base64 encoded string with data URL prefix
  mimeType: string;
}

export interface GeneratedImage {
  src: string; // Base64 data URL
  title: string;
}
