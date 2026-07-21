import { api } from './api';

export interface ImageIdentification {
  item_name: string;
  material_guess: string;
  recyclable: boolean;
  disposal_guidance: string;
  environmental_impact: string;
  confidence: string;
}

export interface IdentifyImageResponse {
  identification: ImageIdentification | null;
  is_estimated: boolean;
  message: string | null;
}

export function identifyImage(imageBase64: string, mimeType: string) {
  return api.post<IdentifyImageResponse>('/api/product/identify-image', {
    image_base64: imageBase64,
    mime_type: mimeType,
  });
}

export interface UploadImageResponse {
  image_id: string;
  url: string;
}

export function uploadProductImage(file: File) {
  const form = new FormData();
  form.append('file', file);
  return api.postForm<UploadImageResponse>('/api/product/upload-image', form);
}

export function deleteProductImage(imageId: string) {
  return api.del<{ status: string }>(`/api/product/upload-image/${encodeURIComponent(imageId)}`);
}
