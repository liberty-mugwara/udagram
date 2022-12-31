import {
  isValidUrl,
  serializeUrl,
  verifyImageUrl,
} from '../src/controllers/image-filter.controller';

import { ExternalHTTPResponseError } from '../src/errors';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Image Filter Tests', () => {
  describe('Image Url tests', () => {
    const validUrls = [
      'https://httpbin.org/image/png',
      'https://httpbin.org/image/jpeg',
      'https://httpbin.org/image/svg',
      'https://httpbin.org/image/webp',
      'https://httpbin.org/anything',
    ];
    const invalidUrls = [
      'httpbin.org/image/png',
      'www.example.com/main.html',
      'ssh://www.example.com/main.html',
    ];
    const fixableInvalidUrls = [
      'https:///httpbin.org/image/png',
      'https:/httpbin.org/image/jpeg',
      'https:httpbin.org/image/svg',
    ];

    it('isValidUrl() can correctly identify valid urls', () => {
      for (const validUrl of validUrls) {
        expect(isValidUrl(validUrl)).to.be.true;
      }
    });

    it('isValidUrl() can correctly identify invalid urls', () => {
      for (const invalidUrl of invalidUrls) {
        expect(isValidUrl(invalidUrl)).to.be.false;
      }
    });

    it('isValidUrl() can accept malformed urls that can be fixed', () => {
      for (const fixableInvalidUrl of fixableInvalidUrls) {
        expect(isValidUrl(fixableInvalidUrl)).to.be.true;
      }
    });

    it('serializeUrl() can serialize valid urls', () => {
      for (const validUrl of validUrls) {
        expect(serializeUrl(validUrl)).to.be.string;
      }
    });

    it('serializeUrl() rejects invalid urls', () => {
      for (const invalidUrl of invalidUrls) {
        expect(() => serializeUrl(invalidUrl)).to.throw('Invalid url');
      }
    });

    it('serializeUrl() can fix fixable malformed urls', () => {
      expect(serializeUrl('https:/www.example.com/main.html')).to.equal(
        'https://www.example.com/main.html',
      );
      expect(serializeUrl('http:www.example.com/main.html')).to.equal(
        'http://www.example.com/main.html',
      );
      expect(serializeUrl('https:///www.example.com/main.html')).to.equal(
        'https://www.example.com/main.html',
      );
    });

    it('verifyImageUrl() can fetch url content type', async () => {
      const url = 'https://httpbin.org/image/jpeg';
      await expect(verifyImageUrl(url)).to.eventually.equal('image/jpeg');
    });

    it('verifyImageUrl() rejects urls that does not link to an image', async () => {
      const url = 'https://httpbin.org/anything';
      await expect(verifyImageUrl(url)).to.be.rejectedWith(Error);
    });

    it('verifyImageUrl() can identify supported image formats', async () => {
      return Promise.all([
        expect(
          verifyImageUrl('https://httpbin.org/image/jpeg'),
        ).to.eventually.equal('image/jpeg'),
        expect(
          verifyImageUrl('https://httpbin.org/image/png'),
        ).to.eventually.equal('image/png'),
      ]);
    });

    it('verifyImageUrl() can reject unsupported image formats', async () => {
      return Promise.all([
        expect(
          verifyImageUrl('https://httpbin.org/image/svg'),
        ).to.be.rejectedWith(Error),
        expect(
          verifyImageUrl('https://httpbin.org/image/webp'),
        ).to.be.rejectedWith(Error),
      ]);
    });

    it('verifyImageUrl() can handle 404 errors', async () => {
      const url = 'https://httpbin.org/status/404';
      await expect(verifyImageUrl(url))
        .to.be.rejectedWith(
          ExternalHTTPResponseError,
          'The Image from the provided url was not found!',
        )
        .with.eventually.property('statusCode', 404);
    });

    it('verifyImageUrl() can handle 400 errors', async () => {
      const url = 'https://httpbin.org/status/400';
      await expect(verifyImageUrl(url))
        .to.be.rejectedWith(
          ExternalHTTPResponseError,
          'HTTP Error Response: 400 BAD REQUEST',
        )
        .with.eventually.property('statusCode', 400);
    });

    it('verifyImageUrl() can handle 401 authentication errors', async () => {
      const url = 'https://httpbin.org/status/401';
      await expect(verifyImageUrl(url))
        .to.be.rejectedWith(
          ExternalHTTPResponseError,
          'You are not authenticated/authorized to access the Image from the provided url.',
        )
        .with.eventually.property('statusCode', 401);
    });

    it('verifyImageUrl() can handle 403 authorization errors', async () => {
      const url = 'https://httpbin.org/status/403';
      await expect(verifyImageUrl(url))
        .to.be.rejectedWith(
          ExternalHTTPResponseError,
          'You do not have the permissions to access the Image from the provided url.',
        )
        .with.eventually.property('statusCode', 403);
    });

    it('verifyImageUrl() can handle 500 server errors', async () => {
      const url = 'https://httpbin.org/status/500';
      await expect(verifyImageUrl(url))
        .to.be.rejectedWith(
          ExternalHTTPResponseError,
          'The server hosting the Image from the provided url has encountered an internal error.',
        )
        .with.eventually.property('statusCode', 500);
    });
  });
});
