# Equipment Loan Application

The **_Equipment Loan Application_** is a web application that provides a solution for efficient equipment borrowing, returning, and tracking in various companies. Through the implementation of modern technologies, it ensures reliable and fast access to data, enabling effective management of users, equipment, and related requests. With its tailored user interface, it offers an intuitive experience for all users, while simultaneously ensuring maximum security and data protection.

---
<br>

## Project Team

- **FrontEnd Developer:** *univ.bacc.ing.comp. [__Milica Bago__](https://github.com/milicabago)*
- **BackEnd Developer:** *univ.bacc.ing.comp. [__Dario Klarić__](https://github.com/dklaric00)*

---
<br>

## Table of Contents

1. [Installation](#installation)

   1.1. [Getting Started](#getting-started)

   1.2. [FrontEnd](#frontend)

   1.3. [BackEnd](#backend)

2. [FrontEnd Technologies](#frontend-technologies)

   2.1. [Next.js](#nextjs)

   2.2. [Dependencies and DevDependencies (FrontEnd)](#dependencies-and-devdependencies-frontend)
   
3. [BackEnd Technologies](#backend-technologies)

   3.1. [Node.js](#nodejs)

   3.2. [Express.js](#expressjs)

   3.3. [MongoDB](#mongodb)

   3.4. [Dependencies and DevDependencies (BackEnd)](#dependencies-and-devdependencies-backend)
   
4. [Use Case Diagram](#use-case-diagram)

   4.1. [Administrator](#administrator)

   4.2. [Users](#users)
   
5. [Conclusion](#conclusion)
   
6. [App Preview](#app-preview)

   6.1. [Login, Register and Reset Password](#login-register-and-reset-password)

   6.2. [As an Administrator](#as-an-administrator)
   
   6.3. [As a User](#as-a-user)

---
<br>

## Installation

> ### Getting Started

- Clone the repository:

   ```
   git clone https://github.com/dklaric00/Equipment-Loan-App.git
   ```
   
- Run the code in one of the editors → *[VS Code](https://code.visualstudio.com/), [Sublime Text](https://www.sublimetext.com/), [Atom](https://atom-editor.cc/)* or any other editor of your choice.
  
<br>

> ### FrontEnd

- Navigate to the FrontEnd directory: ```cd FrontEnd```
- Install dependencies: ```npm install```
- Start the application: ```npm run dev```

> [!IMPORTANT]
> Before starting the application, it is necessary to create a ```.env.local``` file with the following content:
```
NEXT_PUBLIC_BASE_URL = http://localhost:5001/api/ # PORT from BackEnd
```

<br>

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
> Database create on [__MongoDB__](https://account.mongodb.com/account/login)

---
<br>

## FrontEnd Technologies

The entire FrontEnd code is written in __HTML__, __CSS__ and __JavaScript__ programming languages.

<p align="center">
  <img src="https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/e7a3ff60-954f-452f-ae45-6a7610992b84" width="55%" height="55%">
</p>

<br>

> ### Next.js

React framework, preferred for FrontEnd development, that simplifies building full-stack web applications by providing additional features and optimizations while abstracting and configuring necessary tooling for React development

<br>

> ### Dependencies and DevDependencies (FrontEnd)

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

---
<br>

## Backend Technologies

The entire BackEnd code is written in __JavaScript__ programming lenguage.

<p align="center">
  <img src="https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/14257639-84ad-424d-b8e9-83a8471bd6a2" width="50%" height="50%">
</p>

<br>

> ### Node.js

JavaScript runtime. It is used to execute JavaScript code on the server-side, enabling the development of fast web applications.

<br>

> ### Express.js

 Web framework for Node.js. It is used for its simplicity and flexibility in building web applications and APIs, which speeds up the development process.

<br>

> ### MongoDB

NoSQL database. It is popular for its scalability and ease of use, allowing data storage in a flexible format (JSON).

<br>

> ### Dependencies and DevDependencies (BackEnd)

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

---
<br>

## Use Case Diagram
<br>
<p align="center">
  <img src="https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/32408dcf-3978-4b49-ad41-0a8d0cdc90af" width="55%" height="55%">
</p>
<br>

> ### Administrator

*__Administrator__* has the authority to manage all available resources, users, and requests. He is granted all CRUD operations for resources and users, including assigning roles, job positions, as well as managing resource allocation through requests, rejecting requests, and deleting resources and users. The administrator is allowed to change only certain user data, while, of course, he can change his own personal data.

<br>

> ### Users
*__User__* can manage only the resources he uses, borrow and return resources, and view the borrowing history. Each user can change their personal data.

---
<br>

## Conclusion

The *__Equipment Loan Application__* represents a robust solution for efficient equipment management within various organizations. By leveraging modern technologies, such as Node.js, Express.js, React, and MongoDB, it offers a seamless experience for users in borrowing, returning, and tracking equipment. The application's intuitive user interface enhances usability, while its emphasis on security ensures data protection and integrity.

the application has been meticulously crafted to meet the diverse needs of users, administrators, and stakeholders alike. As we continue to refine and enhance its functionality, we remain committed to delivering a reliable and user-centric platform that streamlines equipment management processes and fosters productivity across organizations.

We express our sincere gratitude to *[globalsoft](https://www.globalsoft.ba/)* company for providing us with the opportunity to develop such an impactful application during our research internship as part of our graduate studies. Their support and collaboration have been instrumental in facilitating the acquisition of knowledge and programming skills essential for our professional growth. 

We look forward to furthering the development of this application and embracing future challenges.

---
<br>

## App Preview

> ### Login, Register and Reset Password

![Login](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/9677b43e-7a25-4dbb-a06e-40fdf6476e3d)


![Register](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/e153fc00-9510-45a9-8692-19bf597da83d)


![Forgot_Password](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/449fcec6-3991-49aa-bf33-a8e391312dae)


![Reset_Password](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/f1d84019-12a0-4df9-adf7-d7f3d5402614)

<br>

> ### As an Administrator

![Dashboard](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/1ee698b8-599d-40f0-a2cd-b872259f391d)


![Requests](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/5c10dac8-67cd-48d0-83e5-992e71c934fb)


![Users](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/e8d3ec19-9349-418b-ad25-ba352c106b2d)


![Equipment](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/e6d6b9a3-ba9d-4b01-a204-a0b4b327536c)


![Create_User](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/58d1b918-c983-4e58-8cbf-e29009377e94)


![Add Equipment](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/39cde03b-ea29-4fc4-92a2-37a91ed3247d)


![Settings](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/3d48d705-3b3c-4d9d-9b1e-9bac37409542)

<br>

> ### As a User

![Dashboard](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/ba6d09d7-be85-45f9-84ef-828a1085e809)


![Equipment](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/3b0589d3-9c49-487d-af7f-5d35d8a4743e)


![History](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/32f565af-969f-4822-add9-62e8679b3a44)


![Settings](https://github.com/dklaric00/Equipment-Loan-App/assets/94640801/88a0224a-c188-4cf7-8c9d-cb2be4c66697)

---
<br>

© Equipment-Loan-App 2024.
