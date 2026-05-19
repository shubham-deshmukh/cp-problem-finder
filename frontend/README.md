# CP Problem Finder

A fast and intuitive search engine frontend for Competitive Programming (CP) and Data Structures & Algorithms (DSA) problems. Built with React and TypeScript, it allows users to easily search, browse, and organize coding problems.

## 🚀 Features

* **Real-time Search:** Filter problems instantly by title or tags (e.g., dynamic programming, graphs, greedy).
* **Theme Support:** Toggle between Dark and Light modes for a comfortable viewing experience.
* **Rich Problem Table:** View essential problem information at a glance, including Platform icons, Title, Color-coded Tags, and Difficulty.
* **Modern UI/UX:** Clean, responsive design built with custom CSS, featuring clearable search inputs and a Floating Action Button (FAB).

## 🛠️ Tech Stack

* **Framework:** React 18
* **Language:** TypeScript
* **Build Tool:** Vite
* **Styling:** Vanilla CSS

## 📦 Getting Started

### Prerequisites
* Node.js (v18+ recommended)
* npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 ToDo / Future Improvements

* **Backend Integration:** Replace the current `mockProblems` static data with real REST/GraphQL API calls.
* **Add Problem Feature:** Connect the Floating Action Button (FAB) to a modal or form allowing users to submit new problems to the database.
* **Advanced Filtering:** Introduce dedicated dropdowns to filter problems specifically by Platform (e.g., LeetCode, Codeforces) and Difficulty (Easy, Medium, Hard).
* **Pagination & Sorting:** Implement pagination or infinite scrolling for the problem table, along with column sorting.
* **User Authentication:** Add login/registration to support personalized problem lists, favorites, and user profiles.
* **Notifications:** Implement a functional notification dropdown for the bell icon in the header.
* **Global State Management:** Integrate Redux, Zustand, or React Context to manage complex states as the app grows.
* **Auto-suggestions:** Add intelligent auto-complete/suggestions to the search bar based on available tags in the database.