# **Course Finder**

A platform to help users find the best online courses by comparing top-rated courses from various websites, including Coursera, LinkedIn, Pluralsight, and YouTube. The website allows users to search for courses on specific topics, view their ratings, reviews, and other details, and choose the best one for their learning journey.

## **Features**
- **Search Courses**: Users can search for courses based on a specific topic.
- **Compare Courses**: The platform compares top-rated courses from multiple websites based on their ratings, reviews, and other parameters.
- **Filter and Sort**: Users can filter courses by rating, reviews, and other metadata.
- **Course Details**: View course information such as duration, level, and provider.
- **Persistent Data**: Once the data is scraped for a search query, it is stored in MongoDB for future reference, reducing the need to scrape the same data multiple times.

## **Technologies Used**
### **Frontend:**
- React.js
- HTML, CSS

### **Backend:**
- Node.js with Express.js
- MongoDB for data storage
- Axios for API calls to scrape courses from websites

### **Scraping:**
- Python scripts for scraping data from Coursera, LinkedIn, Pluralsight, and YouTube.

### **Deployment:**
- Vercel for frontend deployment
- Heroku or another platform for backend deployment (optional)

## **How to Run Locally**

### **Prerequisites**
Before you start, ensure you have the following installed:
- **Node.js and npm**: [Install Node.js](https://nodejs.org/)
- **MongoDB**: If you don't have MongoDB installed locally, you can use a cloud database like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- **Python**: Ensure Python is installed to run the scraping scripts.

### **Steps to Run Locally**
1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/course-finder.git
    cd course-finder
    ```

2. **Install dependencies**:
    - For the frontend:
        ```bash
        cd frontend
        npm install
        ```
    - For the backend:
        ```bash
        cd backend
        npm install
        ```

3. **Set up environment variables**:
    - Create a `.env` file in the root of the backend directory and add the following:
      ```bash
      MONGO_URI=your-mongodb-connection-string
      PORT=5000
      ```

4. **Start the application**:
    - Backend (API):
      ```bash
      cd backend
      npm start
      ```
    - Frontend (React app):
      ```bash
      cd frontend
      npm start
      ```
    The app should now be running at `http://localhost:3000` for the frontend and `http://localhost:5000` for the backend.

5. **Scrape courses**:
    - To manually run the scrapers, navigate to the `backend/scrapers` directory and run the appropriate Python script with the desired search query. For example:
      ```bash
      python coursera.py "python"
      ```

### **Testing**
To test the application, you can use Postman to test the backend APIs. The following endpoints are available:
- **GET /api/courses** - Get all courses.
- **GET /api/courses/:query** - Get courses based on the search query (e.g., `python`).
- **POST /api/courses/compare** - Compare courses based on rating and reviews.

## **How to Deploy**
### **Frontend Deployment:**
To deploy the frontend to Vercel, create an account on Vercel, connect your GitHub repository, and follow the prompts for automatic deployment.

### **Backend Deployment:**
You can deploy the backend to platforms like Heroku, DigitalOcean, or Vercel (for serverless functions). Ensure to configure your MongoDB connection URI and other environment variables correctly.

## **Contribution**
Feel free to fork this repository, submit issues, and create pull requests. Contributions are welcome!
