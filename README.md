# Equipment Loan Application

The **_Equipment Loan Application_** is a web-based solution designed for efficient equipment borrowing, returning, and tracking within companies. Developed using modern technologies, it ensures fast and reliable data access, enabling seamless management of users, equipment, and requests. Its intuitive user interface provides an excellent user experience, while robust security measures guarantee data protection.

This application was developed during an internship at *[globalsoft](https://www.globalsoft.ba/)* and serves as the author's project for their master's thesis.

---
<br>

## Project Team

- **FrontEnd Developer:** *[__Milica Bago__](https://github.com/milicabago)*
- **BackEnd Developer:** *[__Dario Klarić__](https://github.com/dklaric00)*

---
<br>

## Table of Contents

1. [Installation](#installation)

2. [FrontEnd Technologies](#frontend-technologies)
   
3. [BackEnd Technologies](#backend-technologies)
   
4. [Features](#features)

   4.1. [Administrators](#administrators)

   4.2. [Users](#users)
   
6. [App Preview](#app-preview)

---
<br>

## Installation

> ### Getting Started

- Clone the repository:

   ```
   git clone https://github.com/dklaric00/Equipment-Loan-App.git
   ```
   
- Open the project folder in an editor such as *[VS Code](https://code.visualstudio.com/)* or any other editor of your choice.
  
<br>

> ### FrontEnd

- Navigate to the FrontEnd directory: ```cd FrontEnd```
> [!IMPORTANT]
> Before starting the application, it is necessary to create an ```.env.local``` file with the following content in the current __FrontEnd__ directory:
```
NEXT_PUBLIC_BASE_URL = http://localhost:5001/api/ # PORT from BackEnd
```
- Install dependencies: ```npm install```
- Start the application: ```npm run dev```

<br>

 > ### BackEnd

- Navigate to the BackEnd directory: ```cd BackEnd```
> [!IMPORTANT]
> Before starting the application, it is necessary to create a ```.env``` file with the following content in the current __BackEnd__ directory:
```
PORT=5001 # PORT for server (BackEnd)
# Add your database CONNECTION_STRING 
CONNECTION_STRING=mongodb+srv://<username>:<password>@<cluster_name>...=<cluster_name>
RESET_PASSWORD_URL=http://localhost:3000/auth/resetPassword # PORT from FrontEnd
ACCESS_TOKEN_SECRET=YourSecretAccessToken
EMAIL_ADDRESS=YourEmail@gmail.com
EMAIL_PASSWORD=YourPassword
```
- Install dependencies: ```npm install```
- Start the application: ```npm run dev```

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

## BackEnd Technologies

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

> [!NOTE]
> Database create on [__MongoDB__](https://account.mongodb.com/account/login)

<br>

## Features
<br>
<p align="center">
  <img src="https://github.com/user-attachments/assets/5314cdc8-e6b4-4ef8-8455-20517f4db183" width="55%" height="55%">
</p>

<br>

> ### Administrators

- **User Management** – The administrator has the ability to create new users through the *__Create User__* component, assign roles and job positions, and edit specific user details such as username, role, and job position. The administrator can only modify their own personal information, while for other users, they can manage only the specified data.
  
- **Resource Management** – The administrator can add new resources using the *__Add Equipment__* component, view and edit existing resources within the *__Equipment__* component, and manage borrowing and returning requests through the *__Requests__* component. Additionally, the administrator can delete resources and users from the system.
  
- **History Overview** – The administrator has access to the return history of all users within the *__History__* component, providing detailed insights into all activities related to equipment returns.
  
- **Settings and Logout** – The administrator can access and modify their personal information within the *__Settings__* component and log out of the system via the *__Logout__* component.

<br>

> ### Users

- **Request Submission** – Users can submit requests for borrowing or returning resources via the *__Requests__* component. These requests are exclusively related to the resources associated with their user account.

- **History Overview** – Users can review the history of their returns within the *__History__* component, which provides insight into all previous actions related to the resources they have used.

- **Settings and Logout** – Users can access and update their personal information within the *__Settings__* component and log out of the system via the *__Logout__* component.

<br>

For security reasons, users can only be registered by an administrator. A user can login to the system only after being registered by an admin.

---
<br>

## App Preview

> ### Login and Reset Password

![Login](https://github.com/user-attachments/assets/cd377139-28d2-4bdc-903b-9182655ce7f4)

![Forgot_Password](https://github.com/user-attachments/assets/24f93c4b-045e-4038-96fc-0a273df41917)

![Reset_Password](https://github.com/user-attachments/assets/143b1210-e5b4-431f-ae67-c7c28789c0ca)

<br>

> ### As an Administrator

![Dashboard](https://github.com/user-attachments/assets/06e4c383-26b7-4150-a1f0-c5e803d61386)

![Requests](https://github.com/user-attachments/assets/76ac8d1f-458e-40ea-92bb-7b3d099d87ed)

![Users](https://github.com/user-attachments/assets/ee231132-f65f-4a70-befe-969264704914)

![Equipment](https://github.com/user-attachments/assets/87163cf6-78e0-4bdd-ae81-cc2580c46271)

![Create_User](https://github.com/user-attachments/assets/53932da5-9a5a-4099-a7d2-1068fe95dcd0)

![Add Equipment](https://github.com/user-attachments/assets/0eee2bff-d97e-4cea-bd51-67ae617df430)

![History](https://github.com/user-attachments/assets/a5382b87-82c0-464f-ace4-518a94effaab)

![Settings](https://github.com/user-attachments/assets/3b7432c3-6f2e-4728-bf96-436d719f3933)

<br>

> ### As a User

![Dashboard](https://github.com/user-attachments/assets/2d38d272-84d5-4266-97ef-2c029b9e5079)

![Requests](https://github.com/user-attachments/assets/fdda5700-4b7a-4be9-ab79-f381e2c758f0)

![Equipment](https://github.com/user-attachments/assets/3414e362-4dcd-45dd-9467-ef269746f2a1)

![History](https://github.com/user-attachments/assets/aadaa378-1e47-430e-acfa-ed7fbfe6aeb3)

![Settings](https://github.com/user-attachments/assets/0b65939c-15de-4003-8ea2-df0fca997370)

---
<br>

© Equipment-Loan-App 2024.
