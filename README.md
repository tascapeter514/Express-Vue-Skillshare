VUE EXPRESS SKILLSHARE WEBSITE

https://gitlab.com/tascapeter514/express-vue-skillshare.git
git@gitlab.com:tascapeter514/express-vue-skillshare.git

by Peter Tasca 2024

The following skillshare website allows users to view, post, add, delete, and make comments to talks. It also allows users to filter these talks based on the current user, the most recently added talk, and whether a talk has comments. 

This skillshare website was inspired by the last chapter of Eloquent Javascript: https://eloquentjavascript.net/21_skillsharing.html. Whereas the Eloquent Javascript version uses only vanilla Javascript, this version has been refactored and rebuilt with Vue.js, Express.js, and PostgreSQL. 

Both versions employ a long-polling technique with header tags so that users can instantly see updates. Originally, the talk JSON data was written to file. This version stores the talk data in a Postgre database with two tables -- one for the talks and one for the comments.

In order to use this website, you must install the following:

Node/Nodemon
Cors
Express
Morgan
Postgres
Vue
Vite

To begin installation, simply:

1.) Clone the project repository, with either:
   a.) SSH: git@gitlab.com:tascapeter514/express-vue-skillshare.git
   b.) HTTPS: https://gitlab.com/tascapeter514/express-vue-skillshare.git

2.) Open two terminal windows.

3.) In the first terminal, enter CD or "change directory" as well as the frontend directory:
   Example: "cd frontend"
   Once you are in the frontend folder, enter "npm run dev" and enter "http://localhost:5173/" into your browser url.
   This should start the frontend host portal.

4.) Next, in the second terminal, enter CD or "change directory" as well as the backend directory:
    Example: "cd backend"
    Once you are in the backend folder, enter "nodemon run dev" to initialize the backend server. 
    This should start the backend host portal.

5.) Once the backend server is initialized, you are able to view, add, delete, and make comments to talks. 

