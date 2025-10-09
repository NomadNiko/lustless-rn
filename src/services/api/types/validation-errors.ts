import HTTP_CODES_ENUM from "./http-codes";

export type ValidationErrors = {
  status:
    | HTTP_CODES_ENUM.BAD_REQUEST
    | HTTP_CODES_ENUM.UNAUTHORIZED
    | HTTP_CODES_ENUM.FORBIDDEN
    | HTTP_CODES_ENUM.NOT_FOUND
    | HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY;
  data: {
    message?: string | string[];
    errors?: Record<string, string[]>;
  };
};
