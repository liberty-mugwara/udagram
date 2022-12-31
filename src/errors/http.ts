import { Response } from 'node-fetch';

export class ExternalHTTPResponseError extends Error {
  response: Response;
  statusCode: number;
  constructor({ response, message }: { response: Response; message?: string }) {
    super(
      message ||
        `HTTP Error Response: ${response.status} ${response.statusText}`,
    );
    this.response = response;
    this.statusCode = response.status;
  }
}

export class HTTPResponseError extends Error {
  statusCode: number;
  constructor({
    statusCode,
    message,
  }: {
    statusCode: number;
    message: string;
  }) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const checkStatus = (response: Response, resourceName: string) => {
  const statusMap = {
    404: `The ${resourceName} was not found!`,
    401: `You are not authenticated/authorized to access the ${resourceName}.`,
    403: `You do not have the permissions to access the ${resourceName}.`,
    500: `The server hosting the ${resourceName} has encountered an internal error.`,
  };
  if (response.ok) {
    // response.status >= 200 && response.status < 300
    return response;
  } else {
    throw new ExternalHTTPResponseError({
      response,
      message: statusMap[response.status],
    });
  }
};
