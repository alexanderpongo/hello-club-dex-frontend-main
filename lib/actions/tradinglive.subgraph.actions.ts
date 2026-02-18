import { GraphQLClient,gql } from 'graphql-request';

const endpoint = process.env
  .NEXT_PUBLIC_PREDICTION_MARKET_GRAPHQL_URL as string;
export const predictionMarketGraphqlClient = new GraphQLClient(endpoint);


export const GET_TOP_PREDICTION_QUERY = gql`
  query GetTopPrediction($where: Prediction_filter) {
    predictions(
      first: 1
      orderBy: predictionVotes
      orderDirection: desc
      where: $where
    ) {
      id
      title
      predictionVotes
      upvotes
      downvotes
      yesVotes
      noVotes
      endTime
    }
  }
`;

// const GET_UP_DOWN_VOTES_BASE_QUERY = `
//   query GetUpAndDownVotes($first: Int!, $skip: Int!, $where: userUpDownVote_filter) {
//     userUpDownVotes(first: $first, skip: $skip, where: $where) {
//       id
//       voter
//       predictionId
//       isUpvote
//       isDownvote
//     }
//   }
// `
// query User {
//   voteCasts(where: {vote: false, voter: ""}) {
//     helloTokens
//     predictionId
//   }
// }

export const GET_USER_VOTE_FOR_PREDICTION_QUERY = gql`
  query GetUserVoteForPrediction($predictionId: String!, $voter: String!) {
    voteCasts(where: {predictionId: $predictionId, voter: $voter}) {
      helloTokens
      vote
    }
  }
`;
