import { type Environment } from './environment.js';

export type AppProps = {
  app: {
    environment: (typeof Environment)[keyof typeof Environment];
    name: string;
    version: string;
  };
};

export type WithAppProps<T> = T & AppProps;
