import graphqlDataProvider, { 
    GraphQLClient,
    liveProvider as graphqlLiveProvider 
    } from "@refinedev/nestjs-query";
import { createClient } from "graphql-ws";
import { fetchWrapper } from "./fetch-wrapper";

export const API_BASE_URL = 'http://127.0.0.1:8000';
export const API_URL = `${API_BASE_URL}/graphql`;
export const WS_URL = 'ws://127.0.0.1:8000/graphql';

export const client = new GraphQLClient(API_URL, {
    fetch: (url: string, options: RequestInit) => {
        const token = localStorage.getItem("token");
        if (token) {
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            };
        }
        return fetchWrapper(url, options);
    }
});

export const wsClient = typeof window !== "undefined"
    ? createClient({
        url: WS_URL,
        connectionParams: () => {
            const accessToken = localStorage.getItem("access_token");
            return {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }
        }
    })
    : undefined;

export const dataProvider = graphqlDataProvider(client);
export const liveProvider = wsClient ? graphqlLiveProvider(wsClient) : undefined;