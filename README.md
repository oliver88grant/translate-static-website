### this is a utility to translate static website programmatically using openai restful api


my-project/
├── node_modules/         # Installed npm dependencies
├── site/                 # this is the original static website,you can put the source files here, usually contain a index.html file and other static folders
├── translated-sites/     # this is the translated website root folder, contain all translated websites
│   ├── es/               # this is the translated website root folder for a specifical language, with the language code as folder name
├── .env                  # Environment variables
├── .gitignore            # Git ignored files and folders
├── index.js              # entry to run the translate program
├── package.json          # Project metadata and dependencies
└── README.md             # Project documentation


### .env file
```
OPENAI_URL=
OPENAI_MODEL=
OPENAI_API_KEY=

## optional
GEMINI_API_KEY=
```
