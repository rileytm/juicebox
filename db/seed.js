const { 
    client,
    getAllUsers,
    createUser,
    updateUser,
    createPost,
    updatePost,
    getAllPosts,
    getPostsByUser,
    getUserById,
    createTags,
    addTagsToPost,
    getPostById
 } = require('./index');

async function dropTables() {
    try {
        console.log("Starting to drop tables - ");

        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `);

        console.log("Dropped tables");
    } catch (error) {
        console.error("Error dropping tables!");
        throw error;
    }
}

async function createTables() {
    try {
        console.log("Starting to build tables - ");

        await client.query(`
            CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
            );
        `);

        await client.query(`
            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true
            );
        `);

        await client.query(`
            CREATE TABLE tags (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE
            );
        `);

        await client.query(`
            CREATE TABLE post_tags (
                id SERIAL PRIMARY KEY,
                "postId" INTEGER REFERENCES posts(id),
                "tagId" INTEGER REFERENCES tags(id),
                CONSTRAINT Unq_Tag UNIQUE ("postId", "tagId")
            );
        `);


        console.log("Finished building tables");
    } catch (error) {
        console.error("Error building tables");
        throw error;
    }
}

async function createInitialUsers() {
    try {
        console.log("Starting to create users");
        const albert = await createUser({
            username: "albert",
            password: "bertie99",
            name: "Al Bert",
            location: "Sydney, Australia",
            active: true });
        const sandra = await createUser({
            username: "sandra",
            password: "2sandy4me",
            name: "Just Sandra",
            location: "Ain't tellin",
            active: true });
        const glamgal = await createUser({
            username: "glamgal",
            password: "soglam",
            name: "Joshua",
            location: "Upper East Side",
            active: true });

        console.log("Finished creating users!");
    } catch (error) {
        console.error("Error creating users!");
        throw error;
    }
}

async function createInitialPosts() {
    try {
        const [albert, sandra, glamgal] = await getAllUsers();

        await createPost({
            authorId: albert.id,
            title: "First post",
            content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
            tags: ["happy", "#youcandoanything"]
        });

        await createPost({
            authorId: sandra.id,
            title: "Sandra Sandra Sandra, Sandra",
            content: "Sandra, sandra sandra Sandra sandra. Sandra, Sandra & Sandra sandra sandra sandra sandra sandra, Sandra.",
            tags: ["#happy", "#worst-day-ever"]
        });

        await createPost({
            authorId: glamgal.id,
            title: "I'm Glamgal",
            content: "G - L - A - M - O - R - O - U - S",
            tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
        });

    } catch (error) {
        throw error;
    }
}

async function createInitialTags() {
    try {
        console.log("Starting to create tags...");
    
        const [happy, sad, inspo, catman] = await createTags([
            '#happy', 
            '#worst-day-ever', 
            '#youcandoanything',
            '#catmandoeverything'
        ]);
    
        const [postOne, postTwo, postThree] = await getAllPosts();

        await addTagsToPost(postOne.id, [happy, inspo]);
        await addTagsToPost(postTwo.id, [sad, inspo]);
        await addTagsToPost(postThree.id, [happy, catman, inspo]);
    
        } catch (error) {
        console.log("Error creating tags!");
        throw error;
    }
  }

async function rebuildDB() {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
        await createInitialTags();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function testDB() {
    try {
        console.log("Starting to test database...");

        console.log("Getting all users")
            const users = await getAllUsers();
        console.log("Results:", users);

        console.log("Calling updateUser on users[0]")
            const updateUserResult = await updateUser(users[0].id, {
                name: "Newname Sogood",
                location: "Lesterville, KY"
            });
        console.log("Result: ", updateUserResult);

        console.log("Calling getAllPosts");
            const posts = await getAllPosts();
        console.log("Result: ", posts);

        console.log("Called getPostById with 1")
            const onePost = await getPostById(1);
        console.log("Post is ", onePost);

        console.log("Calling updatePost on posts[0]");
            const updatePostResult = await updatePost(posts[0].id, {
                title: "New Title",
                content: "Updated Content"
            });
        console.log("Result: ",  updatePostResult);

        console.log("Calling getPostsByUser with 1");
            const usersPosts = await getPostsByUser(1);
        console.log("Result: ", usersPosts);

        console.log("Calling getUserById with 1");
            const albert = await getUserById(1);
        console.log("Result: ", albert);

        console.log("Finished database tests!");
    } catch (error) {
        console.error("Error testing database!");
        throw error;
    }
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());