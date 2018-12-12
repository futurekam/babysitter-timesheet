import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ApolloProvider, Query } from 'react-apollo';
import gql from 'graphql-tag';
import ApolloClient from 'apollo-boost';
import MyProfile from './screens/MyProfile';
import NewChild from './screens/NewChild';
import LoginSignup from './screens/LoginSignup';
import ChildInfo from './screens/ChildInfo';
import Main from './screens/Main';
import { Layout } from './components/Layout';
import { RequireSubscription } from './hocs/RequireSubscription';
import { typeDefs } from './graphql/resolvers';

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_SERVER,
  credentials: 'include',
  clientState: {
    defaults: {
      isLoggedIn: !!window.localStorage.getItem('sid'),
    },
    resolvers: {
      Query: {
        isLoggedIn: () => !!window.localStorage.getItem('sid'),
      },
    },
    typeDefs,
  },
});

const NotFound = () => <h1>404</h1>;

const IS_LOGGED_IN = gql`
  {
    isLoggedIn @client
  }
`;

const loggedInRoutes = isLoggedIn => isLoggedIn && (
  <Route
    path="/"
    component={RequireSubscription(() => (
      <Switch>
        <Route exact path="/child/:id" component={ChildInfo} />
        <Route exact path="/new-sitte" component={NewChild} />
        <Route exact path="/my-profile" render={MyProfile} />
        <Route exact path="/sheet/:date" component={Main} />
      </Switch>
    ))}
  />
);

const App = () => (
  <ApolloProvider client={client}>
    <Router>
      {/** Add user state here  */}
      <Query query={IS_LOGGED_IN}>
        {({ data, loading, error }) => {
          if (loading) {
            return 'Loading...';
          }
          if (error) {
            return 'Something went wrong';
          }

          return (
            <Layout isLoggedIn={data.isLoggedIn}>
              <Switch>
                <Route exact path="/" component={() => <h1>Welcome to sitter sheet</h1>} />
                <Route exact path="/register" component={LoginSignup} />
                {loggedInRoutes(data.isLoggedIn)}
                <Route component={NotFound} />
              </Switch>
            </Layout>
          );
        }}
      </Query>
    </Router>
  </ApolloProvider>
);

export default App;
