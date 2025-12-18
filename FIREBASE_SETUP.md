# Firebase Quiz Upload Setup

## Prerequisites

Before running the upload script, you need to set up Firebase Admin SDK authentication.

### Step 1: Generate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project "demoteachers"
3. Click **Settings** (⚙️) > **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `serviceAccountKey.json` in the root directory

### Step 2: Add to .gitignore

Make sure to add the service account key to `.gitignore`:

```
serviceAccountKey.json
```

### Step 3: Run the Upload Script

```bash
npm run upload:quizzes
```

This will:
- Read `src/data/quizzes.json`
- Create a collection called "quizzes" in Firestore
- Upload each quiz with its questions as a subcollection

## Script Details

The script ([scripts/uploadQuizzes.ts](scripts/uploadQuizzes.ts)) does the following:

- Uses Firebase Admin SDK to authenticate
- Uploads each quiz as a document in the "quizzes" collection
- Creates a "questions" subcollection under each quiz
- Adds server timestamps for `createdAt` and `updatedAt`

## Firestore Structure

After running the script, your Firestore will have:

```
quizzes/
├── quiz-1/
│   ├── title: "General Knowledge"
│   ├── description: "..."
│   ├── difficulty: "easy"
│   ├── category: "General"
│   └── questions/ (subcollection)
│       ├── q1
│       ├── q2
│       ├── q3
│       └── q4
├── quiz-2/
│   └── ...
└── quiz-3/
    └── ...
```

## Troubleshooting

**Permission denied error:**
- Make sure your service account has Firestore admin permissions
- Check Firebase Console > Firestore > Rules

**Module not found errors:**
- Run `npm install` to ensure all dependencies are installed
- Make sure you're in the project root directory

**File not found:**
- Ensure `src/data/quizzes.json` exists
- Check the file path in the script
