
# Database Replication

**The goal of this project is to start a real database to store application data**<br/>
**The project requirements are listed below.**

1. A mongo database in a docker container.
2. A server that handles requests from clients.
3. A JWT token system and encrypt user passwords with bcrypt.
4. Database replication, disaster recovery, and prevent system downtime.
5. Docker compose


Database replication is the process of maintaining multiple copies of the application's database.  Replication can be useful for keeping data safe from failures, avoiding service disruptions, and helping to mitigate high volumes of traffic by distributing it across database replicas.  As an application grows, replication becomes increasingly important, and most larger production applications use some form of database replication.


Database replication checklist
1. At least 2 database replicas must be maintained, each running in a separate Docker container.
2. Each replica must contain a complete copy of the entire database.
3. Take down one or two containers and the server should stay working as normal. 
4. Each database replica runs in its own separate Docker container. A replication scheme with 3 replicas of the database should have 3 separate Docker containers, one running each of the replicas.
5. Docker containers needs to be connected using Docker networking in order for them to successfully replicate each other.
6. Check that the replicaiton is sucesfull by looking up that the data inserted into one of the replicas is successfully copied to the other replicas


**Setup**

The starter code's API server is implemented in `server.js`, and individual routes are modularized within the `api/` directory.  Tests and a testing environment for the API are included in the `tests/` directory.  You can import these tests into either Postman or Insomnia and build on them if you like.  Note that, depending on where you're running your API server, you may need to update the `baseUrl` variable in the included testing environment to reflect the URL for your own server.

The starter code also includes an `openapi.yaml` file in the `public/` directory.  You can import this file into the OpenAPI editor at https://editor.swagger.io/ to generate documentation for the server to see how its endpoints are set up.


## Use a database to power your API

This code runs an API server which uses a database to store the following resources:
  * Businesses
  * Reviews
  * Photos

This project uses the [official MongoDB Docker image](https://hub.docker.com/_/mongo) from Docker Hub to power your database. 

## Database initialization

Before you run your application for the first time, you'll have to make sure your database is initialized and ready to store your application data.  Use the mechanisms described below to initialize your database when you launch the database container, so the database is ready to use when you launch your app.

### MongoDB

You should make sure to set the following environment variables when launching your database container (you can read more under the "Environment Variables" section of the [MongoDB Docker image docs](https://hub.docker.com/_/mongo/)):
  * `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_USERNAME` - These are used to create the MongoDB `root` user.
  * `MONGO_INITDB_DATABASE` - This specifies the name of a MongoDB database to be created when your container first starts.

**While it is a security risk to do so in a production setting**, it's fine if you interact with the database from the API server as the ROOT user for testing.  Because MongoDB generally uses a "create on first use" approach, you won't have to worry about initializing collections.

## Database organization

Your database should store all resource data (i.e. businesses, photos, and reviews) for the API.  Because the resources you're working with are closely tied to each other (e.g. each review is tied to both a specific business and a specific user), you'll have to think carefully about how you organize and access them in your database.  Some suggestions are included below for each database.


### MongoDB

There are many valid ways to organize data in your database.  For example, you could use three separate collections to store businesses, reviews, and photos.  In this case, you can either use [`$lookup` aggregation](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/) or multiple queries to gather data for a specific business (i.e. for the `GET /businesses/{id}` endpoint).

Alternatively, you could store all photos and reviews as subdocuments of their corresponding business document.  In this case, you'll likely want to use [a projection](https://docs.mongodb.com/manual/tutorial/project-fields-from-query-results/) to omit the photo and review data from businesses when returning a list of all businesses (i.e. from the `GET /businesses` endpoint).  You'll also have to think carefully about how you find data for a specific user, e.g. a specific user's photos or reviews.  Do do this, you can use [subdocument array queries](https://docs.mongodb.com/manual/tutorial/query-array-of-documents/) to select businesses with reviews/photos by the specified user, and then you can use some custom JS to select only matching reviews/photos from those businesses.  Alternatively, you can use MongoDB's [aggregation pipeline](https://docs.mongodb.com/manual/core/aggregation-pipeline/) to structure a single query to fetch exactly the reviews/photos you're interested in.

## Connecting the API server to your database

Your API server should read the location (i.e. hostname, port, and database name) and credentials (i.e. username and password) for your database from environment variables.

