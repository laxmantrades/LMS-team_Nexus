# Project Setup Instructions

Follow the steps below to run the project locally:

---

## 1. Extract the project

Unzip the downloaded project folder.

---

## 2. Open the project in VS Code

Open Visual Studio Code and open the extracted project folder.

---

## 3. Run the Backend Server

Open the terminal in VS Code and run:

```bash
cd backend
npm install
```

## 4: Find server.js in backend and in there create a file named .env( THE OS doesnt let env to be zipped so we have to manually do it )

### Paste the MONGOURI from portfolio 2

#### MONGOURI=your_mongodb_connection_string_here

## 5

```bash
npm run dev
```

## Go to frontend without closing backend

```bash
cd frontend

npm install
npm run dev
```

### 6 The project will run
