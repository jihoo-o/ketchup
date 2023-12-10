import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

interface Boosting {
  words: string;
}

interface Diarization {
  enable: boolean;
}

interface Params {
  language: string;
  completion?: string;
  callback?: string;
  userdata?: object;
  wordAlignment?: boolean;
  fullText?: boolean;
  resultToObs?: boolean;
  noiseFiltering?: boolean;
  boostings?: Boosting[];
  useDomainBoostings?: boolean;
  forbiddens?: string;
  diarization?: Diarization;
}

export class ClovaService {
  private invokeUrl: string;
  private secretKey: string;

  constructor(invokeUrl: string, secretKey: string) {
    this.invokeUrl = invokeUrl;
    this.secretKey = secretKey;
  }

  public async recognizeSpeech(filePath: string, params: Params) {
    const formData = new FormData();
    formData.append('media', fs.createReadStream(filePath));
    formData.append('params', JSON.stringify(params));

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-CLOVASPEECH-API-KEY': this.secretKey,
        ...formData.getHeaders(),
      },
    };

    try {
      const response = await axios.post(
        `${this.invokeUrl}/recognizer/upload`,
        formData,
        config
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to recognize speech: ${error}`);
    }
  }
}

export default ClovaService;
