export type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi';

export interface QRData {
  type: QRType;
  value: string;
}

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QROptions {
  width: number;
  height: number;
  margin: number;
  data: string;
  image?: string;
  dotsOptions: {
    color: string;
    type: 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
    gradient?: {
      type: 'linear' | 'radial';
      colorStops: { offset: number; color: string }[];
    };
  };
  backgroundOptions: {
    color: string;
  };
  imageOptions: {
    crossOrigin: string;
    margin: number;
  };
  cornersSquareOptions: {
    color: string;
    type: 'dot' | 'square' | 'extra-rounded';
  };
  cornersDotOptions: {
    color: string;
    type: 'dot' | 'square';
  };
  qrOptions: {
    errorCorrectionLevel: ErrorCorrectionLevel;
  };
}
