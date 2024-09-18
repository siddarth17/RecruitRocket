
# Recruit-Rocket

Recruit Rocket is an AI-powered CRM application designed to streamline the recruiting process for organizations. It provides features to track applicant statistics, update applicants' profile and performance notes, generate AI-driven summaries based on organizational rubrics and values, and manage the application process effectively. Recruit Rocket is currently being used by various USC clubs to enhance their recruiting processes.

Features
AI-powered Summaries: Generate applicant summaries based on the organization's rubrics and values.
Application Round Management: Monitor different stages of the recruiting process.
Applicant Statistics: Displays detailed statistics of all applicants, such as qualifications, skills, and other criteria.
Bulk CSV Upload: Supports CSV uploads to quickly parse and manage applicant data.
Real-time Synchronization: Keeps track of updates and changes in real-time using Refine hooks and Live Provider.
CRUD Operations: Manage applicant profiles with optimized CRUD operations using FastAPI and GraphQL.
User Authentication: JWT-based user authentication to ensure secure access.
Scalable Data Storage: Uses MongoDB for efficient and scalable storage of applicant data.
Containerized Deployment: Fully containerized using Docker to ensure smooth collaboration and deployment.

Tech Stack
Frontend: React, Refine
Backend: FastAPI, GraphQL
Database: MongoDB
Authentication: JWT (JSON Web Token)
Containerization: Docker
Deployment: Vercel
Real-time Sync: Refine hooks, Live Provider

Usage
Login: Access the dashboard after authenticating using JWT.
Upload CSV: Upload CSV files to bulk import applicant profiles.
Manage Applicants: View, update, and score applicants' details and performance based on customizable rubrics.
Real-time Updates: The dashboard updates automatically with any changes in applicant data or statuses.
