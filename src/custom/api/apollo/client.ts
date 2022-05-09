import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://18.167.42.106:8080/subgraphs/name/davekaj/pancake',
  }),
  cache: new InMemoryCache(),
})

export const cowClient = new ApolloClient({
  link: new HttpLink({
    uri: 'http://18.167.42.106:8080/subgraphs/name/davekaj/cow',
  }),
  cache: new InMemoryCache(),
})
