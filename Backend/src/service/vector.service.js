// Import the Pinecone library
const {Pinecone} = require('@pinecone-database/pinecone');


// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const chatgptIndex=pc.Index("chat-gpt-pro")



async function createMemory({vector,metadata,messageId}) {
    
    await chatgptIndex.upsert([{

        id:messageId,
        values:vector,
        metadata
    }])
}


async function queryMemory({queryvector,limit=5,metadata}){


    const data=await chatgptIndex.query({
        vector:queryvector,
        topK:limit,
     filter:metadata?metadata :undefined,
        includeMetadata:true
    })

    return data.matches
}


module.exports={
    createMemory,queryMemory
}