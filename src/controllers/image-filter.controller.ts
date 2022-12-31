import {
  ExternalHTTPResponseError,
  HTTPResponseError,
  checkStatus,
} from '../errors';

import { TControllerFn } from 'src/types';
import { URL } from 'node:url';
import fetch from 'node-fetch';

export const getFilteredImages: TControllerFn = async (req, res) => {
  const imageUrl = req.query.image_url as string;

  if (!imageUrl) {
    res.status(400);
    return res.send('The image_url parameter is required');
  }
  try {
    const contentType = await verifyImageUrl(imageUrl);
    res.send(contentType);
  } catch (e) {
    if (
      e instanceof ExternalHTTPResponseError ||
      e instanceof HTTPResponseError
    ) {
      res.status(e.statusCode);
      return res.send(e.message);
    }

    res.status(500);
    res.send('Oops! Internal server error.');
  }
};

export const verifyImageUrl = async (url: string) => {
  const supportedContentTypes = [
    'image/bmp',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/tiff',
  ];

  const serializedUrl = serializeUrl(url);

  const res = await fetch(serializedUrl, { method: 'HEAD' });

  checkStatus(res, 'Image from the provided url');
  const contentType = res.headers.get('Content-Type');

  if (!contentType.startsWith('image')) {
    throw new HTTPResponseError({
      statusCode: 400,
      message: `The provided url does not link to an image. the content type is ${
        contentType || 'not defined'
      }`,
    });
  }

  if (!supportedContentTypes.includes(contentType)) {
    throw new HTTPResponseError({
      statusCode: 400,
      message: `Image not supported! The image format is: "${contentType.replace(
        'image/',
        '',
      )}". The supported image formats are: ${supportedContentTypes
        .map((ct) => ct.replace('image/', ''))
        .join(' | ')}.`,
    });
  }

  return contentType;
};

export const isValidUrl = (url: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch (_) {
    return false;
  }
};

export const serializeUrl = (url: string) => {
  if (isValidUrl(url)) {
    const urlObj = new URL(url);
    return urlObj.href;
  } else {
    throw new HTTPResponseError({ statusCode: 400, message: 'Invalid url' });
  }
};
