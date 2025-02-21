# GitHub Explorer Mobile App

## Objective

The GitHub Explorer Mobile App allows users to search for GitHub repositories, view their details, and mark repositories as favorites. The app is built using React Native and the GitHub REST API.

---

## Features

1. **Search for Repositories**:
   - A search bar where users can type the name of a repository.
   - Fetches and displays a list of repositories matching the search query using the GitHub REST API.

2. **Repository Details**:
   - Displays detailed information about each repository, including:
     - Repository name
     - Description
     - Number of stars
     - Number of forks
     - Primary programming language
     - Owner's username and avatar

3. **Favorites**:
   - Users can mark repositories as "favorites."
   - A separate screen is provided to view the list of favorite repositories.

4. **Responsive Design**:
   - The app is designed to work seamlessly across different screen sizes.

5. **Error Handling**:
   - Gracefully handles errors such as no internet connection or no repositories found.

---

## Technical Requirements

- **React Native**: Built using React Native framework.
- **GitHub REST API**: Used for fetching repository data from the GitHub API.
  - **Search Repositories Endpoint**: `https://api.github.com/search/repositories?q={query}`
- **State Management**: Uses Redux for managing the state of the app (favorites, search results, etc.).
- **Navigation**: Implemented using React Navigation for handling multiple screens.
- **Styling**: Styled using React Native components and custom CSS.

---

## Installation and Setup

To set up the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd GitHub-Explorer-App
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. To run the app in **debug mode** on an Android device or emulator:
   ```bash
   npx react-native run-android
   ```

4. To create a **release build** of the app (APK file):
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   The APK file will be generated in `android/app/build/outputs/apk/release/`.

---

## Usage

- **Search for Repositories**: Enter a repository name in the search bar and press search to view matching repositories.
- **View Repository Details**: Tap on a repository to view detailed information.
- **Favorite a Repository**: In the repository details view, tap "Add to Favorites" or "Remove from Favorites" to toggle favorites.
- **View Favorite Repositories**: Navigate to the Favorites screen to view your saved repositories.

---

