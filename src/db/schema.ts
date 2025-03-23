import { gql } from "apollo-server-express";

// Define schema
const typeDefs = gql`
    type Text {
        title: String
        body: String
    }

    type Image {
        name: String
        url: String
    }

    input TextInput {
        title: String
    }

	type Query {
		getText(input: TextInput!): [Text]
        getImage: [Image]
	}
`;

export default typeDefs;