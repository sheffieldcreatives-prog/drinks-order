```markdown
## Deploying to GitHub Pages with Firebase

This repo contains a static frontend (docs/) that uses Firebase Firestore for storage.
To publish to GitHub Pages and use Firebase:

1. Create a Firebase project:
   - Go to https://console.firebase.google.com/
   - Create a new project (no need to enable Google Analytics).
   - In Project settings → Your apps → Add web app, copy the SDK config.

2. Enable Firestore:
   - In the Firebase console, go to Firestore Database → Create database
   - For testing you can set rules to allow reads/writes, but for production lock this down.
   - Example quick rules for testing (NOT for production):
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if true;
         }
       }
     }
     ```

3. Add Firebase config:
   - Create file public/firebase-config.js using the template in the repo.
   - Fill in your project's SDK values.

4. Publish to GitHub Pages:
   - Merge changes to main (the workflow runs on push to main).
   - The workflow will publish ./docs to the gh-pages branch automatically.
   - In repository settings → Pages, set the Source to the gh-pages branch (if not set automatically).
   - Your site will be available at https://<your-org-or-username>.github.io/<repo>.

5. QR code:
   - Open https://<your-pages-url>/qr.html to view and print the QR code that points to the site root.

Notes:
- The firebase config keys are public-facing (they are meant to be included in client bundles), but secure your Firestore rules to prevent abuse.
- If you want me to push these files and set up the branch and workflow, tell me the branch name to push to (I used firebase-gh-pages as a suggested branch), and whether to open a PR to merge to main.
```
