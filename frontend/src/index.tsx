import { ApolloProvider } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import { apolloClient } from './graphql';
import './index.css';
import { store } from './store';

ReactDOM.render(
  <React.StrictMode>
    {/* <Provider store={store}> */}
    {/* <ApolloProvider client={apolloClient}> */}
    <App />
    {/* </ApolloProvider> */}
    {/* </Provider> */}
  </React.StrictMode>,
  document.getElementById('root')
);
