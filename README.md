🧪 Playwright E2E Testing for Pinoy Pet Plan  
An automated end-to-end testing suite for the [Pinoy Pet Plan](https://pinoypetplan.com) website, built with Playwright and TypeScript.  
This project ensures the core UI and user navigation flows work as expected, enhancing the reliability of the site for Filipino pet owners.

This project uses the **Page Object Model (POM)** for organized, maintainable, and scalable test architecture.

---

👤 Author  
👨‍💻 Software QA Engineer  
Dedicated to delivering robust and automated testing frameworks that improve quality and reduce regressions.

📧 Email: ravrommelbanaag@gmail.com  
🐱 GitHub: [banaagravrommel](https://github.com/banaagravrommel)  
💼 Upwork: [banaagravrommel](https://www.upwork.com/freelancers/~0123456789abcdef)

---

✅ Features Tested

🌐 **Homepage Navigation**  
- Validates navbar/menu links  
- Ensures footer and logo visibility  
- Responsive layout testing (optional)

📄 **Article Page Validation**  
- Verifies presence of title, author, content blocks  
- Ensures sidebar widgets and newsletter sections are visible  
- Confirms article images and metadata load properly

📱 **Mobile/Tablet Responsiveness**  
- Optional viewport-based validations

---

🧰 Tech Stack  
- Playwright (v1.43+)  
- Node.js (v18+ recommended)  
- TypeScript  
- GitHub for version control  

---

📁 Project Structure

playwright-pinoypetplan/
│
├── pages/ # Page Object Model structure
│ ├── HomePage.ts
│ └── ArticlePage.ts
│
├── tests/ # Test specifications
│ ├── home.spec.ts
│ └── article-cat.spec.ts
│
├── playwright.config.ts # Playwright configuration
├── package.json # Project metadata and dependencies
└── README.md # You're here!

yaml
Copy
Edit

---

🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
Install Playwright browsers

bash
Copy
Edit
npx playwright install
Run the tests

bash
Copy
Edit
npx playwright test
Run tests with interactive UI

bash
Copy
Edit
npx playwright test --ui
⚠️ Notes

This project tests a live production website, so any UI/content changes might cause test instability.

Ensure element selectors are stable and periodically update them if the site layout changes.

🏁 Contributing
Have suggestions or want to contribute test cases? Feel free to fork this repo and submit a pull request!
