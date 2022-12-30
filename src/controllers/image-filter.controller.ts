import { TControllerFn } from 'src/types';
import { URL } from 'node:url';
import { checkStatus } from '../errors';
import fetch from 'node-fetch';

export const getFilteredImages: TControllerFn = async (req, res) => {
	res.send('coming soon!');
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

	checkStatus(res);
	const contentType = res.headers.get('Content-Type');

	if (!contentType.startsWith('image')) {
		throw new Error(
			`The provided url does not link to an image. the content type is ${
				contentType || 'not defined'
			}`,
		);
	}

	if (!supportedContentTypes.includes(contentType)) {
		throw new Error(
			`Image not supported! The image format is: "${contentType.replace(
				'image/',
				'',
			)}". The supported image formats are: ${supportedContentTypes
				.map((ct) => ct.replace('image/', ''))
				.join('|')}`,
		);
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
		throw new Error('Invalid url');
	}
};
