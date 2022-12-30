import { Response } from 'node-fetch';

export class HTTPResponseError extends Error {
  response: Response;
  statusCode: number;
  constructor(response: Response) {
  	super(`HTTP Error Response: ${response.status} ${response.statusText}`);
  	this.response = response;
  	this.statusCode = response.status;
  }
}

export const checkStatus = (response: Response) => {
	if (response.ok) {
		// response.status >= 200 && response.status < 300
		return response;
	} else {
		throw new HTTPResponseError(response);
	}
};
