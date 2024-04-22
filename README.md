# Assignment 2

**Assignment due at 11:59pm on Monday 5/6/2024**<br/>
**Demo due by 11:59pm on Monday 5/20/2024**

The goal of this assignment is to start using a real database to store application data.  The assignment requirements are listed below.

You are provided some starter code in this repository that implements a solution to assignment 1.  The starter code's API server is implemented in `server.js`, and individual routes are modularized within the `api/` directory.  Tests and a testing environment for the API are included in the `tests/` directory.  You can import these tests into either Postman or Insomnia and build on them if you like.  Note that, depending on where you're running your API server, you may need to update the `baseUrl` variable in the included testing environment to reflect the URL for your own server.

The starter code also includes an `openapi.yaml` file in the `public/` directory.  You can import this file into the OpenAPI editor at https://editor.swagger.io/ to generate documentation for the server to see how its endpoints are set up.

Feel free to use this code as your starting point for this assignment.  You may also use your own solution to assignment 1 as your starting point if you like.

## Use a database to power your API

Your overarching goal for this assignment is to modify the API server to use a database to store the following resources:
  * Businesses
  * Reviews
  * Photos

You may choose either MySQL or MongoDB for this purpose (or another DB implementation you're interested in, with permission).  Whichever database you choose, it should completely replace the starter code's existing JSON/in-memory storage for these resources.  In other words, you should update all API endpoints in the original starter code to use your database.

You should use the [official MySQL Docker image](https://hub.docker.com/_/mysql/) or the [official MongoDB Docker image](https://hub.docker.com/_/mongo) from Docker Hub to power your database.  Whichever database you choose, your implementation should satisfy the criteria described below.

## Database initialization

Before you run your application for the first time, you'll have to make sure your database is initialized and ready to store your application data.  Use the mechanisms described below to initialize your database when you launch the database container, so the database is ready to use when you launch your app.

### MySQL

If you're using MySQL, you should make sure to set the following environment variables when launching your database container (you can read more under the "Environment Variables" section of the [MySQL Docker image docs](https://hub.docker.com/_/mysql/)):
  * `MYSQL_ROOT_PASSWORD` - This specifies the password that is set for the MySQL `root` user.  You can also use `MYSQL_RANDOM_ROOT_PASSWORD` to allow the container to generate a random password.
  * `MYSQL_DATABASE` - This specifies the name of a MySQL database to be created when your container first starts.
  * `MYSQL_USER` and `MYSQL_PASSWORD` - These are used to create a new user, in addition to the `root` user, who will have permissions only for the database named in `MYSQL_DATABASE`.  This is the user you should use to connect to your database from your API server.

If you use Sequelize to interact with your MySQL database, Sequelize will handle the creation of tables for you.

### MongoDB

If you're using MongoDB, you should make sure to set the following environment variables when launching your database container (you can read more under the "Environment Variables" section of the [MongoDB Docker image docs](https://hub.docker.com/_/mongo/)):
  * `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_USERNAME` - These are used to create the MongoDB `root` user.
  * `MONGO_INITDB_DATABASE` - This specifies the name of a MongoDB database to be created when your container first starts.

**While it is a security risk to do so in a production setting**, it's fine if you interact with the database from your API server as the ROOT user for this assignment.  Because MongoDB generally uses a "create on first use" approach, you won't have to worry about initializing collections.

## Database organization

Your database should store all resource data (i.e. businesses, photos, and reviews) for the API.  Because the resources you're working with are closely tied to each other (e.g. each review is tied to both a specific business and a specific user), you'll have to think carefully about how you organize and access them in your database.  Some suggestions are included below for each database.

### MySQL

If you're using MySQL, you will likely want to use [foreign keys](https://dev.mysql.com/doc/refman/8.0/en/example-foreign-keys.html) to link reviews and photos to their corresponding business.  If you're using Sequelize, you can use [associations](https://sequelize.org/docs/v6/core-concepts/assocs/) to automatically manage foreign keys for you.

### MongoDB

If you're using MongoDB, there are many valid ways to organize data in your database.  For example, you could use three separate collections to store businesses, reviews, and photos.  In this case, you can either use [`$lookup` aggregation](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/) or multiple queries to gather data for a specific business (i.e. for the `GET /businesses/{id}` endpoint).

Alternatively, you could store all photos and reviews as subdocuments of their corresponding business document.  In this case, you'll likely want to use [a projection](https://docs.mongodb.com/manual/tutorial/project-fields-from-query-results/) to omit the photo and review data from businesses when returning a list of all businesses (i.e. from the `GET /businesses` endpoint).  You'll also have to think carefully about how you find data for a specific user, e.g. a specific user's photos or reviews.  Do do this, you can use [subdocument array queries](https://docs.mongodb.com/manual/tutorial/query-array-of-documents/) to select businesses with reviews/photos by the specified user, and then you can use some custom JS to select only matching reviews/photos from those businesses.  Alternatively, you can use MongoDB's [aggregation pipeline](https://docs.mongodb.com/manual/core/aggregation-pipeline/) to structure a single query to fetch exactly the reviews/photos you're interested in.

## Connecting the API server to your database

Your API server should read the location (i.e. hostname, port, and database name) and credentials (i.e. username and password) for your database from environment variables.

## CS 599 only: Perform database replication

This application's challenge for students in the grad section of the course is to implement a database replication scheme for your application.  Database replication is the process of maintaining multiple copies of the application's database.  Replication can be useful for keeping data safe from failures, avoiding service disruptions, and helping to mitigate high volumes of traffic by distributing it across database replicas.  As an application grows, replication becomes increasingly important, and most larger production applications use some form of database replication.

If you are in the grad section of the course, you must set up your application to maintain at least 2 replicas of your database.  Both replicas should contain a complete copy of the entire database.  If you're using MySQL for this assignment, you'll use its [Group Replication](https://dev.mysql.com/doc/refman/8.3/en/group-replication.html) feature to implement replication.  If you're using MongoDB, you'll use a [Replica Set](https://www.mongodb.com/docs/manual/replication/).

Regardless of which database implementation you're using, your replication implementation should meet the following requirements:
  * Each database replica should run in its own separate Docker container.  For example, if you implement a replication scheme with 3 replicas of the database, you should have 3 separate Docker containers, one running each of the replicas.
  * Your Docker containers will need to be connected using Docker networking in order for them to successfully replicate each other.
  * It is fine for you to manually configure replication, e.g. by manually creating multiple Docker containers and running commnands in each container to connect it to the other replicas.  You may do this ahead of your grading demo.  However, you should be prepared to demonstrate to the TA during your grading demo how your replication implementation was configured.
  * Each database replica should maintain a complete copy of the entire database.  You should be prepared to demonstrate the successful replication of data to the TA during your grading demo (e.g. by showing that data inserted into one of the replicas is successfully copied to the other replicas).

## Running code in GitHub Codespaces

For this assignment, I've enabled a feature called [GitHub Codespaces](https://docs.github.com/en/codespaces/) that will provide you with a private online environment where you can develop and test your code for the assignment.  This environment will be centered around a browser-based version of the [VS Code](https://code.visualstudio.com/) editor.  You can access the Codespace by clicking "Create codespace on main" under the "Code" button in your assignment repository on GitHub:

![Image of GitHub Codespaces button](https://www.dropbox.com/s/wvijvh130fjuud5/Screen%20Shot%202022-05-24%20at%2011.17.58%20AM.png?raw=true)

You may use this browser-based editor as much or as little as you like, and in general, I encourage you to stick with whatever development setup already works best for you (i.e. your preferred editor running on your preferred development machine).

The reason I'm providing the Codespace is to provide an environment where it will be easy to use Docker if you've been having trouble running Docker on your development machine.  In particular, Docker should be already installed in the Codespace when you launch it, and you can use it through the Codespace terminal just as we discussed in lecture.

You can access the Codespace terminal through the menu of the browser-based version of VS Code associated with the Codespace:

![Image of Codespace terminal access](https://www.dropbox.com/s/nqebudssjvcwyw5/Screen%20Shot%202022-05-24%20at%2011.45.34%20AM.png?raw=true)

Inside this terminal, you should be able to run your code as described above.

If you're editing outside the browser-based version of VS Code associated with your Codespace, and you want to test your code inside the Codespace, you'll need to make sure you use Git to pull your most recent commit(s) into the Codespace.  You can do this through the browser-based VS Code's Git integration:

![Image of VS Code Git pull command](https://www.dropbox.com/s/d4rlv954af0q6r4/Screen%20Shot%202022-05-24%20at%2011.37.23%20AM.png?raw=true)

## Submission

We'll be using GitHub Classroom for this assignment, and you will submit your assignment via GitHub.  Just make sure your completed files are committed and pushed by the assignment's deadline to the main branch of the GitHub repo that was created for you by GitHub Classroom.  A good way to check whether your files are safely submitted is to look at the main branch your assignment repo on the github.com website (i.e. https://github.com/osu-cs493-sp24/assignment-2-YourGitHubUsername/). If your changes show up there, you can consider your files submitted.

## Grading criteria

This assignment is worth 100 total points, broken down as follows:

  * 20 points: Chosen database runs in a Docker container that is correctly initialized (e.g. by using appropriate environment variables the first time the container is launched).

  * 70 points: All existing API endpoints in the starter code (in the `api/` directory) are modified to use your database.
    * All existing functionality, including pagination, data validation, etc., must be retained.
    * 20 points: All `/businesses` endpoints are correctly modified to use the database.
    * 20 points: All `/photos` endpoints are correctly modified to use the database.
    * 20 points: All `/reviews` endpoints are correctly modified to use the database.
    * 10 points: All `/users` endpoints are correctly modified to use the database.

  * 10 points: Database connection parameters are correctly provided to API server via environment variables.
    * API server must successfully connect to the database.

In addition, the assignment for the grad section of the course has the following additional grading criteria, making the grad section's version of the assignment worth 125 points total:

  * 25 points: Database replication is successfully implemented.
    * At least 2 database replicas must be maintained, each running in a separate Docker container.
    * Each replica must contain a copy of the entire database.
