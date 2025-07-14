## Full-Stack Smart Home Simulator
Welcome to the Full-Stack Smart Home Simulator, a dynamic web application that brings the concept of a smart, automated home to life. This project demonstrates a complete, event-driven system where users can monitor devices, create complex automation rules, and activate scenes in a responsive, real-time environment.

This project stands at the intersection of Building Technology and Computer Science, showcasing how software can be used to model, control, and analyze the intelligent environments of the future.

Note: You can take a screenshot of your running application, place it in a .github folder in your repository, and update the link above to display a preview image.

**✨ Features**
This simulator is packed with features that mirror a real-world smart home system:

Real-Time Device Control: A responsive dashboard to monitor and control various smart devices (lights, thermostats, locks, cameras, and sensors) instantly. All updates are pushed to the UI in real-time using WebSockets.

Room-Based Organization: Devices are logically grouped into rooms (Living Room, Kitchen, etc.), providing an intuitive and organized user experience.

Automation Engine: A powerful "if-this-then-that" (IFTTT) rule engine. Users can create custom rules to automate actions based on device states (e.g., "IF motion is detected, THEN turn on the lights").

Scene Management: Create and activate preset scenes like "Movie Mode" or "Goodnight" to apply multiple device configurations with a single click.

Analytics Dashboard: A dedicated section to monitor system-wide analytics, including total energy consumption, a log of all device and rule activity, and device usage statistics.

Responsive UI: The entire frontend is designed to be fully responsive, providing a seamless experience on both desktop and mobile devices.

**🛠️ Tech Stack**
This project was built using a modern, full-stack technology set.

**Frontend**
Framework: React.js

Language: TypeScript

Styling: Tailwind CSS

Real-time Communication: Socket.IO Client

Build Tool: Vite

**Backend**
Framework: Express.js

Environment: Node.js

Language: TypeScript

Real-time Communication: Socket.IO

**🚀 Getting Started**
To get a local copy up and running, follow these simple steps.

**Prerequisites**
Node.js (v18.x or later)

npm (v9.x or later)

**Installation & Setup**
Clone the repository:

git clone https://github.com/pasivall14/smart-home-simulator.git
cd smart-home-simulator

**Set up the Backend:**

cd backend
npm install
npx tsc
npm start

The backend server will start on http://localhost:4000.

**Set up the Frontend (in a new terminal):**

cd frontend
npm install
npm run dev

The frontend development server will start, typically on http://localhost:5173. Open this URL in your browser to use the application.

**☁️ Deployment**
This application is deployed as two separate services on Render:

Backend (Web Service): The Node.js/Express server runs as a web service, handling all the simulation logic and WebSocket connections.

Frontend (Static Site): The React application is served as a static site, configured to communicate with the live backend service via an environment variable (VITE_API_URL).

This setup demonstrates a standard, scalable approach to deploying modern full-stack applications.

**🤝 Acknowledgements**
This project was built with the help of these incredible open-source libraries and tools:

React

Node.js

Socket.IO

Tailwind CSS

Vite

Lucide Icons
