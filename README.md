# Equipment Loan Application

The **_Equipment Loan Application_** is a web application that provides a solution for efficient equipment borrowing, returning, and tracking in various companies. Through the implementation of modern technologies, it ensures reliable and fast access to data, enabling effective management of users, equipment, and related requests. With its tailored user interface, it offers an intuitive experience for all users, while simultaneously ensuring maximum security and data protection.

## Project Team

- **FrontEnd Developer:** *univ.bacc.ing.comp. Milica Bago*
- **BackEnd Developer:** *univ.bacc.ing.comp. Dario Klarić*

## Table of Contents

1. [Installation](#installation)
2. [FrontEnd Technologies](#frontend-technologies)
3. [BackEnd Technologies](#backend-technologies)
4. [User Roles](#user-roles)

   a) [Administrator](#administrator)

   b) [User](#user)

6. [Conclusion](#conclusion)

## Installation

> ### Getting Started

- Clone the repository:

   ```
   git clone https://github.com/dklaric00/Equipment-Loan-App.git
   ```
   
- Run the code in one of the editors → _VS Code, Sublime Text, Atom_ or any other editor of your choice.

> ### FrontEnd

- Navigate to the FrontEnd directory: ```cd FrontEnd```
- Install dependencies: ```npm install```
- Start the application: ```npm run dev```

> [!IMPORTANT]
> Before starting the application, it is necessary to create a ```.env.local``` file with the following content:
```
NEXT_PUBLIC_BASE_URL = http://localhost:5001/api/ # PORT from BackEnd
```

 > ### BackEnd

- Navigate to the BackEnd directory: ```cd BackEnd```
- Install dependencies: ```npm install```
- Start the application: ```npm run dev```

> [!IMPORTANT]
> Before starting the application, it is necessary to create a ```.env``` file with the following content:
```
PORT=5001 # PORT for server (BackEnd)
# Add your database CONNECTION_STRING 
CONNECTION_STRING=mongodb+srv://<username>:<password>@<cluster_name>...=<cluster_name>
RESET_PASSWORD_URL=http://localhost:3000/auth/resetPassword # PORT from FrontEnd
ACCESS_TOKEN_SECRET=YourSecretAccessToken
EMAIL_ADDRESS=YourEmail@gmail.com
EMAIL_PASSWORD=YourPassword
```
> [!NOTE]
> You can create the database on [__MongoDB__](https://account.mongodb.com/account/login)

## FrontEnd Technologies

The entire FrontEnd code is written in __JavaScript__ and __CSS__ programming languages.

> ### Next.js

React framework, preferred for FrontEnd development, that simplifies building full-stack web applications by providing additional features and optimizations while abstracting and configuring necessary tooling for React development

> ### Dependencies and DevDependencies

| Dependencies        | Description ↴                                                                    | DevDependencies            | Description ↴                                               |
| :---                | :---                                                                             | :---                       | :---                                                        | 
| @hookform/resolvers | Provides resolvers for form validation in React                                  | @babel/preset-react        | Babel preset for transforming JSX syntax                    |
| @nextui-org/react   | Contains a set of UI components for React applications                           | @babel/preset-env          | Babel preset for transforming modern JavaScript syntax      |
| react-hook-form     | Enables form management in React applications                                    | eslint-config-next         | ESLint configurations tailored for Next.js projects         |
| react-hot-toast     | A library for displaying notifications (toasts) in React applications            | @babel/core                | Core module for Babel JavaScript compiler                   |
| react-cookie        | Facilitates working with cookies in React applications                           | eslint                     | Tool for identifying and reporting JavaScript code patterns |
| react-modal         | Enables modal window display in React applications                               |                            |                                                             |
| react-icons         | Contains icons that can be used in React applications                            |                            |                                                             |
| jwt-decode          | Used for decoding JSON Web Tokens (JWT) to extract user information              |                            |                                                             |
| react-dom           | Used for manipulating the DOM in React applications                              |                            |                                                             |
| react               | A library for building user interfaces in React applications                     |                            |                                                             |
| axios               | An HTTP client for making HTTP request                                           |                            |                                                             |
| yup                 | A library for schema-based data validation in JavaScript                         |                            |                                                             |

## Backend Technologies

The entire BackEnd code is written in __JavaScript__ programming lenguage.

> ### Node.js

JavaScript runtime. It is used to execute JavaScript code on the server-side, enabling the development of fast web applications.

> ### Express.js

 Web framework for Node.js. It is used for its simplicity and flexibility in building web applications and APIs, which speeds up the development process.

> ### MongoDB

NoSQL database. It is popular for its scalability and ease of use, allowing data storage in a flexible format (JSON).

> ### Dependencies and DevDependencies

| Dependencies           | Description ↴                                                         | DevDependencies | Description ↴                                                                        |
| :---                   | :---                                                                  | :---            | :---                                                                                  |
| express-async-handler  | Middleware for handling asynchronous exceptions in Express.js         | nodemon         | Utility for monitoring changes in source code and automatically restarting the server |
| cookie-parser          | Middleware for parsing cookies in requests                            |                 |                                                                                       |
| jsonwebtoken           | JSON Web Token (JWT) authentication implementation                    |                 |                                                                                       |
| nodemailer             | Library for sending email messages                                    |                 |                                                                                       |
| mongoose               | MongoDB library for Node.js, offering schema-based data modeling      |                 |                                                                                       |
| express                | Fast, minimalist web framework for Node.js                            |                 |                                                                                       |
| dotenv                 | Library for loading environment variables from a ```.env``` file      |                 |                                                                                       |
| bcrypt                 | Secure password hashing library                                       |                 |                                                                                       |
| cors                   | Middleware for enabling Cross-Origin Resource Sharing (CORS) requests |                 |                                                                                       |
| joi                    | Data validation and schema description library                        |                 |                                                                                       |

## User Roles

### Administrator

Description of Administrator role and capabilities.

### User

Description of User role and capabilities.

## Conclusion

Concluding remarks about the project.
