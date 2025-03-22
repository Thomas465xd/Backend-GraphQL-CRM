const texts = [
    {
        title: "Hello, World! 1",
        body: "This is a simple example of a GraphQL query.",

        name: "Image 1",
        url: "https://example.com/image1.jpg"


    }, 
    {
        title: "Hello, World! 2 ",
        body: "This is a simple example of a GraphQL query.",

        name: "Image 2",
        url: "https://example.com/image1.jpg"
    }, 
    {
        title: "Hello, World! 3",
        body: "This is a simple example of a GraphQL query.",

        name: "Image 3",
        url: "https://example.com/image1.jpg"
    }
]

// Define resolvers
const resolvers = {
	Query: {
		getText: (_, { input }, ctx ) => {
            //console.log("input", input)
            const result = texts.filter((text) => text.title === input.title);
            return result.length > 0 ? result : texts;
        }, 
        getImage: () => texts
	},
};

export default resolvers