import { GraphQLFormattedError } from "graphql";

type Error = {
  message: string;
  statusCode: string;
};

const customFetch = async (url: string, options: RequestInit) => {
  const accessToken = localStorage.getItem("access_token");
  const headers = options.headers as Record<string, string>;

  return await fetch(url, {
    ...options,
    headers: {
      ...headers,
      Authorization: headers?.Authorization || `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Apollo-Require-Preflight": "true",
    },
  });
};

export const fetchWrapper = async (url: string, options: RequestInit) => {
  console.log("Fetch request:", url, options); // Log the request
  const response = await customFetch(url, options);
  
  console.log("Fetch response status:", response.status); // Log the response status
  
  const responseClone = response.clone();
  const body = await responseClone.json();
  console.log("Fetch response body:", body); // Log the response body
  
  const error = getGraphQLErrors(body);
  
  if (error) {
    console.error("GraphQL error:", error); // Log any GraphQL errors
    throw error;
  }
  
  return response;
};

const getGraphQLErrors = (
  body: Record<"errors", GraphQLFormattedError[] | undefined>,
): Error | null => {
  if (!body) {
    return {
      message: "Unknown error",
      statusCode: "INTERNAL_SERVER_ERROR",
    };
  }

  if ("errors" in body) {
    const errors = body?.errors;
    const messages = errors?.map((error) => error?.message)?.join("");
    const code = errors?.[0]?.extensions?.code;

    return {
      message: messages || JSON.stringify(errors),
      statusCode: code || 500,
    };
  }

  return null;
};