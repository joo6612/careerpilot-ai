import { Career } from './models';

// Helper to stringify mock roadmap templates
const buildRoadmapTemplate = (careerTitle: string, milestones: Array<{ title: string; desc: string; duration: string; skills: string[]; topics: string[] }>) => {
  return JSON.stringify(
    milestones.map((m, idx) => ({
      id: `rm-${idx + 1}`,
      title: m.title,
      description: m.desc,
      status: idx === 0 ? 'in-progress' : 'locked',
      duration: m.duration,
      skills: m.skills,
      topics: m.topics
    }))
  );
};

export const CAREER_CATALOG: Career[] = [
  {
    id: 'AI_ENGINEER',
    title: 'AI Engineer',
    shortDescription: 'Builds, deploys, and optimizes AI models and LLM integrations.',
    fullDescription: 'AI Engineers integrate artificial intelligence models, such as large language models (LLMs) and computer vision APIs, into production applications. They specialize in prompt engineering, fine-tuning, retrieval-augmented generation (RAG), and agentic workflows.',
    category: 'Artificial Intelligence',
    requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'Prompt Engineering', 'LangChain', 'RAG Architecture', 'Git', 'API Integration'],
    beginnerSkills: ['Python', 'Git', 'API Integration'],
    intermediateSkills: ['Prompt Engineering', 'LangChain', 'SQL'],
    advancedSkills: ['TensorFlow', 'PyTorch', 'RAG Architecture'],
    salaryRange: { min: 110000, max: 195000, currency: 'USD' },
    growthTrend: 'Explosive (Growth: +45% YoY)',
    remoteAvailability: 90,
    educationRequirement: "Bachelor's in Computer Science or equivalent practical portfolio",
    certifications: ['Google Cloud Professional Machine Learning Engineer', 'TensorFlow Developer Certificate'],
    tools: ['Jupyter Notebooks', 'VS Code', 'Hugging Face', 'Weights & Biases'],
    technologies: ['OpenAI API', 'LlamaIndex', 'Pinecone Vector DB', 'Docker'],
    difficulty: 'Advanced',
    tags: ['AI', 'LLM', 'Machine Learning', 'Data Science', 'Python'],
    roadmapTemplate: buildRoadmapTemplate('AI Engineer', [
      {
        title: 'Foundations of Python & Git',
        desc: 'Master the basic syntax of Python and version control flows.',
        duration: '4 weeks',
        skills: ['Python', 'Git'],
        topics: ['Python Syntax & OOP', 'Command Line', 'Git Workflows & Collaboration', 'Virtual Environments']
      },
      {
        title: 'API Integrations & Prompt Engineering',
        desc: 'Connect to external LLMs and design optimal prompts.',
        duration: '5 weeks',
        skills: ['API Integration', 'Prompt Engineering'],
        topics: ['HTTP Clients & Requests', 'System vs User Prompts', 'Few-shot & Zero-shot learning', 'Chaining LLMs']
      },
      {
        title: 'LangChain & Vector DBs (RAG)',
        desc: 'Build intelligent search indexing systems using vector stores.',
        duration: '6 weeks',
        skills: ['LangChain', 'RAG Architecture'],
        topics: ['Vector Databases (Pinecone)', 'Embeddings & Chunking', 'LangChain Expression Language (LCEL)', 'Memory & Chatbots']
      },
      {
        title: 'Model Orchestration & Deployments',
        desc: 'Deploy and monitor production AI applications with Docker.',
        duration: '5 weeks',
        skills: ['TensorFlow', 'PyTorch'],
        topics: ['Docker Containerization', 'Fine-Tuning Open Source LLMs', 'Model Evaluation & Tracking', 'Cloud deployment (AWS/GCP)']
      }
    ])
  },
  {
    id: 'ML_ENGINEER',
    title: 'Machine Learning Engineer',
    shortDescription: 'Designs and builds algorithms that learn from and make predictions on data.',
    fullDescription: 'Machine Learning Engineers focus on designing and implementing ML algorithms and systems. They build statistical models, write scalable training pipelines, and coordinate ML Operations (MLOps) to deploy predictive features to production.',
    category: 'Artificial Intelligence',
    requiredSkills: ['Python', 'Scikit-Learn', 'PyTorch', 'Pandas', 'NumPy', 'MLOps', 'Feature Engineering', 'SQL'],
    beginnerSkills: ['Python', 'Pandas', 'NumPy'],
    intermediateSkills: ['Scikit-Learn', 'Feature Engineering', 'SQL'],
    advancedSkills: ['PyTorch', 'MLOps'],
    salaryRange: { min: 115000, max: 200000, currency: 'USD' },
    growthTrend: 'Very High (Growth: +32% YoY)',
    remoteAvailability: 80,
    educationRequirement: "Bachelor's or Master's in Computer Science, Math, or Statistics",
    certifications: ['AWS Certified Machine Learning - Specialty', 'Google Cloud Professional ML Engineer'],
    tools: ['MLflow', 'DVC', 'Kubeflow', 'Jupyter Notebooks'],
    technologies: ['Apache Spark', 'Docker', 'CUDA', 'Git'],
    difficulty: 'Advanced',
    tags: ['Machine Learning', 'Data Science', 'Algorithms', 'Python'],
    roadmapTemplate: buildRoadmapTemplate('Machine Learning Engineer', [
      {
        title: 'Math & Python Foundations',
        desc: 'Learn Linear Algebra, Calculus, and numerical libraries.',
        duration: '4 weeks',
        skills: ['Python', 'NumPy'],
        topics: ['Linear Algebra & Matrices', 'Probability & Statistics', 'NumPy & Array Operations', 'Data structures']
      },
      {
        title: 'Exploratory Data Analysis & Scikit-Learn',
        desc: 'Clean data and train classic regression and classification algorithms.',
        duration: '6 weeks',
        skills: ['Pandas', 'Scikit-Learn'],
        topics: ['Data Wrangling with Pandas', 'Supervised Learning', 'Feature scaling & Encoding', 'Hyperparameter tuning']
      },
      {
        title: 'Deep Learning & Neural Networks',
        desc: 'Build convolutional and recurrent neural networks from scratch.',
        duration: '6 weeks',
        skills: ['PyTorch', 'Feature Engineering'],
        topics: ['Neural Network Theory', 'Backpropagation', 'PyTorch Tensors & Modules', 'Training Optimizers']
      },
      {
        title: 'MLOps & Pipeline Deployment',
        desc: 'Automate model training and expose endpoints using REST APIs.',
        duration: '4 weeks',
        skills: ['MLOps', 'SQL'],
        topics: ['Database Pipelines', 'Model Registry with MLflow', 'FastAPI model endpoints', 'CI/CD for ML']
      }
    ])
  },
  {
    id: 'DATA_SCIENTIST',
    title: 'Data Scientist',
    shortDescription: 'Analyzes complex data to extract business insights and build models.',
    fullDescription: 'Data Scientists combine statistics, math, and coding to explore big datasets. They perform statistical testing, build predictive models, and create explanatory dashboards to guide business decision-making.',
    category: 'Data Science',
    requiredSkills: ['Python', 'R', 'SQL', 'Statistics', 'Pandas', 'Matplotlib', 'Tableau', 'Predictive Modeling'],
    beginnerSkills: ['Python', 'SQL', 'Matplotlib'],
    intermediateSkills: ['Pandas', 'Statistics', 'Tableau'],
    advancedSkills: ['Predictive Modeling', 'R'],
    salaryRange: { min: 95000, max: 175000, currency: 'USD' },
    growthTrend: 'High (Growth: +28% YoY)',
    remoteAvailability: 85,
    educationRequirement: "Bachelor's or Master's in Statistics, Data Science, Math, or Business Analytics",
    certifications: ['IBM Data Science Professional Certificate', 'Microsoft Certified: Power BI Data Analyst Associate'],
    tools: ['Jupyter Notebooks', 'Tableau', 'Microsoft Power BI', 'Anaconda'],
    technologies: ['SQL Server', 'PostgreSQL', 'Git', 'Excel'],
    difficulty: 'Intermediate',
    tags: ['Data Science', 'Analytics', 'Business Intelligence', 'Python'],
    roadmapTemplate: buildRoadmapTemplate('Data Scientist', [
      {
        title: 'SQL & Database Querying',
        desc: 'Extract and join datasets from relational databases.',
        duration: '4 weeks',
        skills: ['SQL'],
        topics: ['SELECT Queries & Joins', 'Aggregations & Group By', 'Subqueries & CTEs', 'Database Indexing']
      },
      {
        title: 'Python for Data Analysis',
        desc: 'Manipulate arrays and structure data using Pandas and NumPy.',
        duration: '5 weeks',
        skills: ['Python', 'Pandas'],
        topics: ['Pandas Series & DataFrames', 'Handling Missing Values', 'Filtering & Sorting', 'Visualizations with Seaborn']
      },
      {
        title: 'Practical Business Statistics',
        desc: 'Execute hypothesis testing, A/B tests, and probability models.',
        duration: '5 weeks',
        skills: ['Statistics', 'Matplotlib'],
        topics: ['Probability Distributions', 'P-values & T-tests', 'Linear & Logistic Regression', 'A/B Testing Analysis']
      },
      {
        title: 'Business Reporting & Predictive Analytics',
        desc: 'Create business reports and forecast trends with Tableau.',
        duration: '6 weeks',
        skills: ['Tableau', 'Predictive Modeling'],
        topics: ['Tableau Calculations & Filters', 'Dashboard Design', 'Time Series Forecasting', 'Executive Presentation']
      }
    ])
  },
  {
    id: 'DATA_ANALYST',
    title: 'Data Analyst',
    shortDescription: 'Gathers, cleans, and reports data to help teams make decisions.',
    fullDescription: 'Data Analysts transform raw numbers into clear explanations. They query relational databases, perform descriptive analytics, and design interactive dashboards to help team managers monitor core business KPIs.',
    category: 'Data Science',
    requiredSkills: ['SQL', 'Excel', 'Tableau', 'Power BI', 'Python', 'Data Cleaning', 'Data Visualization', 'Reporting'],
    beginnerSkills: ['Excel', 'SQL', 'Data Visualization'],
    intermediateSkills: ['Data Cleaning', 'Tableau', 'Reporting'],
    advancedSkills: ['Python', 'Power BI'],
    salaryRange: { min: 65000, max: 110000, currency: 'USD' },
    growthTrend: 'Steady (Growth: +18% YoY)',
    remoteAvailability: 90,
    educationRequirement: "Associate's or Bachelor's in Business, Finance, Info Systems, or Math",
    certifications: ['Google Data Analytics Professional Certificate', 'Tableau Desktop Specialist'],
    tools: ['Microsoft Excel', 'Tableau Desktop', 'Power BI Service', 'Jupyter'],
    technologies: ['PostgreSQL', 'MySQL', 'Pandas', 'Google Sheets'],
    difficulty: 'Beginner',
    tags: ['Data Analyst', 'Excel', 'SQL', 'Tableau', 'Analytics'],
    roadmapTemplate: buildRoadmapTemplate('Data Analyst', [
      {
        title: 'Advanced Microsoft Excel',
        desc: 'Master lookup formulas, pivot tables, and data formatting.',
        duration: '3 weeks',
        skills: ['Excel', 'Data Visualization'],
        topics: ['VLOOKUP & XLOOKUP', 'Pivot Tables & Charts', 'Conditional Formatting', 'Excel Data Cleaning']
      },
      {
        title: 'SQL Fundamentals for Querying',
        desc: 'Filter, sort, and join database tables.',
        duration: '4 weeks',
        skills: ['SQL'],
        topics: ['Filtering with WHERE', 'JOINing tables', 'GROUP BY & HAVING', 'Aggregations']
      },
      {
        title: 'Interactive Dashboard Design',
        desc: 'Build business reports in Tableau or Power BI.',
        duration: '5 weeks',
        skills: ['Tableau', 'Power BI'],
        topics: ['Data Connections', 'Calculated Fields', 'Building Charts', 'Publishing Dashboards']
      },
      {
        title: 'Python Basics for Data Cleaning',
        desc: 'Examine datasets and automate reports using Pandas.',
        duration: '4 weeks',
        skills: ['Python', 'Data Cleaning'],
        topics: ['Python Lists & Loops', 'Pandas Series', 'Dropping Duplicates', 'Exporting CSVs']
      }
    ])
  },
  {
    id: 'BACKEND_ENGINEER',
    title: 'Backend Developer',
    shortDescription: 'Builds application servers, databases, and core business APIs.',
    fullDescription: 'Backend Developers implement server-side logic, database storage structures, and API routes. They focus on security, data validations, API performance, background task processing, and database optimization.',
    category: 'Software Development',
    requiredSkills: ['Node.js', 'Express', 'SQL', 'PostgreSQL', 'REST APIs', 'TypeScript', 'Docker', 'Authentication'],
    beginnerSkills: ['Node.js', 'Express', 'SQL'],
    intermediateSkills: ['PostgreSQL', 'TypeScript', 'Authentication'],
    advancedSkills: ['Docker', 'REST APIs'],
    salaryRange: { min: 85000, max: 155000, currency: 'USD' },
    growthTrend: 'High (Growth: +22% YoY)',
    remoteAvailability: 95,
    educationRequirement: "Bachelor's in Computer Science or equivalent self-taught portfolio",
    certifications: ['Node.js Application Developer (LFNAD)', 'MongoDB Certified Developer'],
    tools: ['VS Code', 'Postman', 'Docker Desktop', 'PgAdmin'],
    technologies: ['Express.js', 'MongoDB', 'Redis', 'JWT Auth'],
    difficulty: 'Intermediate',
    tags: ['Backend', 'Developer', 'Node.js', 'API', 'Database'],
    roadmapTemplate: buildRoadmapTemplate('Backend Developer', [
      {
        title: 'Javascript & Node.js Basics',
        desc: 'Learn asynchronous JS and server-side runtimes.',
        duration: '4 weeks',
        skills: ['Node.js', 'TypeScript'],
        topics: ['Event Loop & Promises', 'NPM Package Manager', 'File System Modules', 'TypeScript Syntax']
      },
      {
        title: 'Express Server & REST APIs',
        desc: 'Create routers, routes, middleware, and request parsers.',
        duration: '4 weeks',
        skills: ['Express', 'REST APIs'],
        topics: ['HTTP verbs & Routes', 'Express Middleware', 'Validating payload bodies', 'Error Handling']
      },
      {
        title: 'Relational Database Integrations',
        desc: 'Connect your server to PostgreSQL databases.',
        duration: '5 weeks',
        skills: ['SQL', 'PostgreSQL'],
        topics: ['Relational Schema Design', 'SQL Queries & Joins', 'ORM Integrations (Prisma/Sequelize)', 'Query Optimization']
      },
      {
        title: 'Authentication & Containers',
        desc: 'Secure your routes with JWT tokens and dockerize the app.',
        duration: '4 weeks',
        skills: ['Authentication', 'Docker'],
        topics: ['Password Hashing with Bcrypt', 'JSON Web Tokens (JWT)', 'Dockerfiles & Compose', 'API Security Checklist']
      }
    ])
  },
  {
    id: 'FRONTEND_ENGINEER',
    title: 'Frontend Developer',
    shortDescription: 'Builds responsive user interfaces and client-side web apps.',
    fullDescription: 'Frontend Developers craft the visible portion of web applications. They specialize in layout structuring, styling, responsive design systems, component states, browser performance, and calling API endpoints.',
    category: 'Software Development',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'TailwindCSS', 'Vite', 'State Management'],
    beginnerSkills: ['HTML', 'CSS', 'JavaScript'],
    intermediateSkills: ['React', 'TypeScript', 'TailwindCSS'],
    advancedSkills: ['Vite', 'State Management'],
    salaryRange: { min: 80000, max: 145000, currency: 'USD' },
    growthTrend: 'Steady (Growth: +20% YoY)',
    remoteAvailability: 95,
    educationRequirement: "Associate's or Bachelor's in CS, Graphic Design, or web development bootcamps",
    certifications: ['Meta Front-End Developer Professional Certificate'],
    tools: ['Chrome DevTools', 'VS Code', 'Figma Viewer'],
    technologies: ['Next.js', 'Redux Toolkit', 'Axios', 'Jest'],
    difficulty: 'Intermediate',
    tags: ['Frontend', 'Developer', 'React', 'UI', 'CSS'],
    roadmapTemplate: buildRoadmapTemplate('Frontend Developer', [
      {
        title: 'HTML & CSS Layouts',
        desc: 'Build web pages with proper responsive CSS styling.',
        duration: '4 weeks',
        skills: ['HTML', 'CSS'],
        topics: ['HTML5 Semantic Elements', 'Flexbox & CSS Grid', 'Media Queries & Responsive layouts', 'CSS Variables']
      },
      {
        title: 'Modern Javascript Fundamentals',
        desc: 'Manipulate DOM structures and call API endpoints.',
        duration: '4 weeks',
        skills: ['JavaScript', 'Vite'],
        topics: ['ES6 Array methods', 'Async/Await & Fetch', 'Local Storage', 'Browser DOM Manipulation']
      },
      {
        title: 'React Components & Hooks',
        desc: 'Build reusable UI layouts using React and Tailwind.',
        duration: '6 weeks',
        skills: ['React', 'TailwindCSS'],
        topics: ['JSX & Props', 'useState & useEffect Hooks', 'Tailwind utility classes', 'Reusable Form Inputs']
      },
      {
        title: 'State Management & Typescript',
        desc: 'Organize global application state and implement type check systems.',
        duration: '4 weeks',
        skills: ['TypeScript', 'State Management'],
        topics: ['React Context API', 'TypeScript Interface declarations', 'Calling REST APIs with Axios', 'Client-side Routing']
      }
    ])
  },
  {
    id: 'FULL_STACK_DEVELOPER',
    title: 'Full Stack Developer',
    shortDescription: 'Builds complete end-to-end web applications (Frontend + Backend).',
    fullDescription: 'Full Stack Developers handle both the backend (server, databases, background processes) and the frontend (UI design, responsiveness, routing) of web applications. They are generalist software engineers capable of shipping complete features.',
    category: 'Software Development',
    requiredSkills: ['React', 'Node.js', 'Express', 'PostgreSQL', 'TypeScript', 'Docker', 'Authentication', 'Deployment'],
    beginnerSkills: ['React', 'Node.js', 'Express'],
    intermediateSkills: ['PostgreSQL', 'TypeScript', 'Authentication'],
    advancedSkills: ['Docker', 'Deployment'],
    salaryRange: { min: 95000, max: 170000, currency: 'USD' },
    growthTrend: 'High (Growth: +25% YoY)',
    remoteAvailability: 95,
    educationRequirement: "Bachelor's in CS, engineering, or extensive system deployment portfolio",
    certifications: ['AWS Certified Developer - Associate'],
    tools: ['VS Code', 'Docker Desktop', 'Postman', 'Git CLI'],
    technologies: ['Next.js', 'Prisma ORM', 'TailwindCSS', 'GitHub Actions'],
    difficulty: 'Advanced',
    tags: ['Full Stack', 'Developer', 'Node.js', 'React', 'Software Engineer'],
    roadmapTemplate: buildRoadmapTemplate('Full Stack Developer', [
      {
        title: 'HTML, CSS & Basic JavaScript',
        desc: 'Learn the foundational languages of the web.',
        duration: '4 weeks',
        skills: ['React', 'Express'],
        topics: ['HTML Semantic markup', 'CSS layout systems', 'ES6 Javascript', 'Node.js intro']
      },
      {
        title: 'Frontend Component Development',
        desc: 'Build client-side applications using React and Tailwind.',
        duration: '5 weeks',
        skills: ['React', 'TypeScript'],
        topics: ['React State & Props', 'Typescript typing', 'Tailwind responsive grids', 'Form validations']
      },
      {
        title: 'Backend API & Database Development',
        desc: 'Create secure Express routers connected to PostgreSQL.',
        duration: '5 weeks',
        skills: ['Express', 'PostgreSQL'],
        topics: ['REST API design', 'Relational database schema', 'JWT Authorization', 'Prisma ORM']
      },
      {
        title: 'Deployment & Continuous Integration',
        desc: 'Deploy full-stack web applications with Docker.',
        duration: '4 weeks',
        skills: ['Docker', 'Deployment'],
        topics: ['Docker Multi-stage builds', 'GitHub Actions CI/CD', 'Render/Heroku Deployment', 'Domain & SSL setup']
      }
    ])
  },
  {
    id: 'DEVOPS_ENGINEER',
    title: 'DevOps Engineer',
    shortDescription: 'Automates cloud infrastructure, deployments, and CI/CD pipelines.',
    fullDescription: 'DevOps Engineers bridge the gap between software development and system operations. They design automated build and test pipelines, configure cloud platforms, manage container networks, and monitor production app health.',
    category: 'Cloud & Infrastructure',
    requiredSkills: ['Git', 'CI/CD Pipelines', 'Docker', 'Kubernetes', 'Terraform', 'Linux Administration', 'Shell Scripting', 'Cloud Platforms'],
    beginnerSkills: ['Git', 'Linux Administration', 'Shell Scripting'],
    intermediateSkills: ['Docker', 'CI/CD Pipelines', 'Cloud Platforms'],
    advancedSkills: ['Kubernetes', 'Terraform'],
    salaryRange: { min: 100000, max: 180000, currency: 'USD' },
    growthTrend: 'Very High (Growth: +30% YoY)',
    remoteAvailability: 90,
    educationRequirement: "Bachelor's in CS, IT administration, or extensive systems portfolio",
    certifications: ['AWS Certified DevOps Engineer - Professional', 'Certified Kubernetes Administrator (CKA)'],
    tools: ['Jenkins', 'GitHub Actions', 'Terraform CLI', 'Prometheus'],
    technologies: ['Docker', 'Kubernetes', 'AWS', 'Grafana'],
    difficulty: 'Advanced',
    tags: ['DevOps', 'CI/CD', 'Docker', 'Kubernetes', 'Terraform'],
    roadmapTemplate: buildRoadmapTemplate('DevOps Engineer', [
      {
        title: 'Linux Commands & Shell Scripting',
        desc: 'Navigate Linux operating systems and write automations.',
        duration: '4 weeks',
        skills: ['Linux Administration', 'Shell Scripting'],
        topics: ['Linux File Permissions', 'Bash script loops & conditions', 'SSH keys & Remote administration', 'Process Management']
      },
      {
        title: 'Docker Containerization & Pipelines',
        desc: 'Dockerize applications and automate builds with GitHub Actions.',
        duration: '4 weeks',
        skills: ['Docker', 'CI/CD Pipelines'],
        topics: ['Dockerfiles & Layers', 'Docker networks & volumes', 'GitHub Actions workflow files', 'Automated testing stages']
      },
      {
        title: 'Infrastructure as Code (Terraform)',
        desc: 'Provision cloud platforms declaratively.',
        duration: '5 weeks',
        skills: ['Terraform', 'Cloud Platforms'],
        topics: ['Terraform providers & variables', 'State management', 'AWS IAM & VPC configurations', 'Module structuring']
      },
      {
        title: 'Kubernetes Orchestration & Monitoring',
        desc: 'Deploy and monitor microservices at scale.',
        duration: '6 weeks',
        skills: ['Kubernetes', 'Git'],
        topics: ['K8s Pods, Deployments & Services', 'ConfigMaps & Secrets', 'Prometheus Alerts', 'Grafana Dashboards']
      }
    ])
  },
  {
    id: 'CLOUD_ENGINEER',
    title: 'Cloud Engineer',
    shortDescription: 'Architects and manages cloud databases and compute instances.',
    fullDescription: 'Cloud Engineers focus on building and maintaining scalable systems on public cloud providers. They structure cloud storage solutions, coordinate migration strategies, configure network routing, and optimize cloud budget costs.',
    category: 'Cloud & Infrastructure',
    requiredSkills: ['Cloud Platforms', 'Linux', 'Network Security', 'Database Services', 'IAM Policies', 'Terraform', 'Docker', 'Python'],
    beginnerSkills: ['Linux', 'Python', 'Database Services'],
    intermediateSkills: ['Cloud Platforms', 'Docker', 'Network Security'],
    advancedSkills: ['Terraform', 'IAM Policies'],
    salaryRange: { min: 90000, max: 165000, currency: 'USD' },
    growthTrend: 'High (Growth: +26% YoY)',
    remoteAvailability: 90,
    educationRequirement: "Bachelor's in Information Technology, CS, or system management bootcamps",
    certifications: ['AWS Certified Solutions Architect - Associate', 'Google Cloud Associate Cloud Engineer'],
    tools: ['AWS Console', 'Google Cloud Console', 'Terraform CLI', 'AWS CLI'],
    technologies: ['Amazon EC2', 'Amazon S3', 'IAM', 'VPC'],
    difficulty: 'Intermediate',
    tags: ['Cloud', 'AWS', 'GCP', 'Infrastructure', 'Systems'],
    roadmapTemplate: buildRoadmapTemplate('Cloud Engineer', [
      {
        title: 'Linux Operations & Networking',
        desc: 'Learn system administration basics and basic networking.',
        duration: '4 weeks',
        skills: ['Linux', 'Network Security'],
        topics: ['Command Line basics', 'IP addressing & Subnetting', 'Firewalls & Ports', 'DNS resolution']
      },
      {
        title: 'Cloud Platform Architecture (AWS/GCP)',
        desc: 'Deploy instances and connect cloud resources.',
        duration: '5 weeks',
        skills: ['Cloud Platforms', 'Database Services'],
        topics: ['Compute Instances (EC2/VM)', 'Object Storage (S3/GCS)', 'Relational Databases (RDS)', 'Virtual Private Clouds (VPC)']
      },
      {
        title: 'Access Management & Security',
        desc: 'Write secure Identity and Access Management policies.',
        duration: '4 weeks',
        skills: ['IAM Policies', 'Python'],
        topics: ['IAM Users, Groups & Roles', 'JSON Policy syntax', 'Least Privilege principle', 'CloudTrail Auditing']
      },
      {
        title: 'Infrastructure Automation (Terraform)',
        desc: 'Provision resources using Terraform.',
        duration: '5 weeks',
        skills: ['Terraform', 'Docker'],
        topics: ['Terraform installations', 'Resource blocks', 'Deploying docker containers to cloud', 'Cloud Cost optimization']
      }
    ])
  },
  {
    id: 'CYBERSECURITY_ANALYST',
    title: 'Cybersecurity Analyst',
    shortDescription: 'Monitors, detects, and shields software systems from attacks.',
    fullDescription: 'Cybersecurity Analysts shield computer networks and applications from data leaks, ransomware, and digital threats. They perform logs auditing, install firewalls, coordinate penetration testing, and write company compliance reports.',
    category: 'Cybersecurity',
    requiredSkills: ['Linux', 'Network Security', 'SIEM Tools', 'Incident Response', 'Cryptography', 'Vulnerability Assessment', 'Python', 'Security Compliance'],
    beginnerSkills: ['Linux', 'Network Security', 'Cryptography'],
    intermediateSkills: ['SIEM Tools', 'Vulnerability Assessment', 'Security Compliance'],
    advancedSkills: ['Incident Response', 'Python'],
    salaryRange: { min: 80000, max: 145000, currency: 'USD' },
    growthTrend: 'Very High (Growth: +28% YoY)',
    remoteAvailability: 85,
    educationRequirement: "Associate's or Bachelor's in Cybersecurity, Networking, or Systems Admin",
    certifications: ['CompTIA Security+', 'Certified Information Systems Security Professional (CISSP)'],
    tools: ['Wireshark', 'Splunk', 'Nmap', 'Metasploit'],
    technologies: ['Firewalls', 'SIEM', 'IPsec VPN', 'Kali Linux'],
    difficulty: 'Intermediate',
    tags: ['Cybersecurity', 'Security', 'Network', 'Compliance', 'Cryptography'],
    roadmapTemplate: buildRoadmapTemplate('Cybersecurity Analyst', [
      {
        title: 'Networking & OS Basics',
        desc: 'Learn TCP/IP models, Linux ports, and terminal basics.',
        duration: '4 weeks',
        skills: ['Linux', 'Network Security'],
        topics: ['TCP/IP Protocol Suite', 'Port scanning with Nmap', 'Routing & Switching', 'Linux log directories']
      },
      {
        title: 'Security Foundations & Cryptography',
        desc: 'Understand threat classifications and encryption algorithms.',
        duration: '4 weeks',
        skills: ['Cryptography', 'Security Compliance'],
        topics: ['Symmetric vs Asymmetric encryption', 'Hashing (SHA-256)', 'Common attack vectors', 'Security Standards (ISO 27001)']
      },
      {
        title: 'Vulnerability Auditing & Packet Capture',
        desc: 'Scan networks and analyze packet flows using Wireshark.',
        duration: '5 weeks',
        skills: ['Vulnerability Assessment', 'SIEM Tools'],
        topics: ['Wireshark capture filters', 'Analyzing HTTP/DNS leaks', 'Vulnerability scanners (Nessus)', 'Log parsing']
      },
      {
        title: 'Incident Analysis & Incident Response',
        desc: 'Build defensive alerts and plan countermeasure strategies.',
        duration: '5 weeks',
        skills: ['Incident Response', 'Python'],
        topics: ['SIEM dashboard alerts (Splunk)', 'Python scripts for automation', 'Incident Response playbooks', 'Forensic basic steps']
      }
    ])
  },
  {
    id: 'UI_UX_DESIGNER',
    title: 'UI/UX Designer',
    shortDescription: 'Designs user interfaces and crafts intuitive user experiences.',
    fullDescription: 'UI/UX Designers create beautiful, user-centered digital interfaces. They conduct user research, construct wireframes and high-fidelity prototypes, build responsive visual design systems, and collaborate with developers.',
    category: 'Design & Creative',
    requiredSkills: ['Figma', 'UI Design', 'UX Research', 'Wireframing', 'Prototyping', 'Visual Design', 'Interaction Design', 'HTML/CSS'],
    beginnerSkills: ['Figma', 'UI Design', 'UX Research'],
    intermediateSkills: ['Wireframing', 'Prototyping', 'Visual Design'],
    advancedSkills: ['Interaction Design', 'HTML/CSS'],
    salaryRange: { min: 75000, max: 135000, currency: 'USD' },
    growthTrend: 'High (Growth: +22% YoY)',
    remoteAvailability: 95,
    educationRequirement: "Bachelor's in Design, Human-Computer Interaction, or equivalent bootcamp portfolio",
    certifications: ['Google Cloud UX Design Professional Certificate'],
    tools: ['Figma', 'Adobe XD', 'Sketch', 'Miro'],
    technologies: ['HTML', 'CSS', 'Storybook', 'Framer Motion'],
    difficulty: 'Intermediate',
    tags: ['Design', 'UI', 'UX', 'Figma', 'Prototype'],
    roadmapTemplate: buildRoadmapTemplate('UI/UX Designer', [
      {
        title: 'Design Fundamentals & Figma Basics',
        desc: 'Master visual hierarchy, typography, colors, and Figma tools.',
        duration: '4 weeks',
        skills: ['Figma', 'UI Design'],
        topics: ['Figma Vector Network', 'Typography & Grids', 'Color Theory', 'Component Variants']
      },
      {
        title: 'User Research & Wireframing',
        desc: 'Conduct interviews and map user journeys to wireframes.',
        duration: '4 weeks',
        skills: ['UX Research', 'Wireframing'],
        topics: ['User Personas', 'Journey Mapping', 'Low-fidelity wireframes', 'Information Architecture']
      },
      {
        title: 'High-Fidelity Prototyping',
        desc: 'Build interactive prototypes and design systems.',
        duration: '5 weeks',
        skills: ['Prototyping', 'Visual Design'],
        topics: ['Smart Animate in Figma', 'Design System tokens', 'Interactive components', 'Usability Testing']
      },
      {
        title: 'Developer Handoff & Front-end basics',
        desc: 'Export assets and learn basic HTML/CSS structure.',
        duration: '4 weeks',
        skills: ['Interaction Design', 'HTML/CSS'],
        topics: ['Figma Inspect Tool', 'HTML elements', 'CSS box model', 'Flexbox layout']
      }
    ])
  },
  {
    id: 'GAME_DEVELOPER',
    title: 'Game Developer',
    shortDescription: 'Builds interactive 2D and 3D games and simulated environments.',
    fullDescription: 'Game Developers implement interactive gameplay mechanics, write physics engine behaviors, structure 3D asset interfaces, and build engaging visual animations. They specialize in C#, Unity, Unreal Engine, and Blender modeling integrations.',
    category: 'Game Development',
    requiredSkills: ['C#', 'Unity', 'Blender', '3D Modeling', 'Unreal Engine', 'C++', 'Physics Engine', 'Game Design'],
    beginnerSkills: ['C#', 'Unity', 'Blender'],
    intermediateSkills: ['3D Modeling', 'Game Design', 'Physics Engine'],
    advancedSkills: ['Unreal Engine', 'C++'],
    salaryRange: { min: 70000, max: 140000, currency: 'USD' },
    growthTrend: 'High (Growth: +24% YoY)',
    remoteAvailability: 85,
    educationRequirement: "Bachelor's in Computer Science, Game Design, or equivalent practical portfolio",
    certifications: ['Unity Certified User: Programmer', 'Unreal Engine Developer Certification'],
    tools: ['Unity Editor', 'Unreal Editor', 'Blender', 'VS Code'],
    technologies: ['C#', 'C++', 'PhysX', 'OpenGL'],
    difficulty: 'Intermediate',
    tags: ['Game', 'Unity', 'Blender', '3D Modeling', 'C#', 'Game Development'],
    roadmapTemplate: buildRoadmapTemplate('Game Developer', [
      {
        title: 'Unity & C# Basics',
        desc: 'Master basic C# scripting and the Unity layout.',
        duration: '4 weeks',
        skills: ['C#', 'Unity'],
        topics: ['C# variables & loops', 'Unity game loop', 'Transform operations', 'Input management']
      },
      {
        title: '3D Modeling & Blender asset design',
        desc: 'Build, texture, and export 3D assets to Unity.',
        duration: '4 weeks',
        skills: ['Blender', '3D Modeling'],
        topics: ['Blender navigation', 'Low-poly mesh design', 'Materials & UV unwrapping', 'FBX export settings']
      },
      {
        title: 'Gameplay Mechanics & Physics Engine',
        desc: 'Implement game rules, collision checking, and motion control.',
        duration: '5 weeks',
        skills: ['Game Design', 'Physics Engine'],
        topics: ['Rigidbodies & Colliders', 'Raycasting', 'Score & UI updates', 'State machines']
      },
      {
        title: 'Advanced Engines & Shaders',
        desc: 'Build high-performance graphic systems using Unreal and C++.',
        duration: '5 weeks',
        skills: ['Unreal Engine', 'C++'],
        topics: ['Unreal Blueprint system', 'C++ memory management', 'Lighting & VFX', 'Build pipelines']
      }
    ])
  },
  {
    id: 'MOBILE_DEVELOPER',
    title: 'Mobile App Developer',
    shortDescription: 'Builds iOS and Android mobile applications.',
    fullDescription: 'Mobile App Developers design and implement client-side mobile applications. They specialize in responsive mobile layout screens, device native APIs (camera, location), state management, and mobile database synchronization.',
    category: 'Software Development',
    requiredSkills: ['Swift', 'Kotlin', 'React Native', 'Flutter', 'iOS SDK', 'Android SDK', 'API Integration', 'Mobile UI'],
    beginnerSkills: ['React Native', 'Swift', 'Kotlin'],
    intermediateSkills: ['iOS SDK', 'Android SDK', 'API Integration'],
    advancedSkills: ['Flutter', 'Mobile UI'],
    salaryRange: { min: 80000, max: 150000, currency: 'USD' },
    growthTrend: 'High (Growth: +22% YoY)',
    remoteAvailability: 90,
    educationRequirement: "Associate's or Bachelor's in CS, IT, or mobile bootcamps",
    certifications: ['Meta Android/iOS Developer Certificate', 'Associate Android Developer'],
    tools: ['Xcode', 'Android Studio', 'VS Code', 'Figma'],
    technologies: ['iOS SDK', 'Android SDK', 'SQLite', 'Firebase'],
    difficulty: 'Intermediate',
    tags: ['Mobile', 'iOS', 'Android', 'Swift', 'Kotlin', 'React Native'],
    roadmapTemplate: buildRoadmapTemplate('Mobile App Developer', [
      {
        title: 'Mobile UI Layout Basics',
        desc: 'Build mobile screens with UI elements.',
        duration: '4 weeks',
        skills: ['React Native', 'Mobile UI'],
        topics: ['React Native Views & Styles', 'Flexbox layouts', 'Text Inputs', 'Buttons']
      },
      {
        title: 'iOS & Android Native Tools',
        desc: 'Write Swift and Kotlin native codes.',
        duration: '4 weeks',
        skills: ['Swift', 'Kotlin'],
        topics: ['Swift UI basics', 'Kotlin Compose basics', 'Activities & Fragments', 'Native modules']
      },
      {
        title: 'API Connections & State Management',
        desc: 'Sync local mobile storage with REST APIs.',
        duration: '5 weeks',
        skills: ['API Integration', 'iOS SDK'],
        topics: ['Fetching remote data', 'JSON decoding', 'Redux Toolkit', 'SQLite integration']
      },
      {
        title: 'Flutter Deployments',
        desc: 'Deploy cross-platform applications to App Stores.',
        duration: '5 weeks',
        skills: ['Flutter', 'Android SDK'],
        topics: ['Dart programming language', 'Widget trees', 'Build configurations', 'App Store guidelines']
      }
    ])
  },
  {
    id: 'DATA_ENGINEER',
    title: 'Data Engineer',
    shortDescription: 'Constructs big data architectures and ETL pipelines.',
    fullDescription: 'Data Engineers set up databases, configure data streaming, write ETL (Extract, Transform, Load) pipelines, and architect data warehousing solutions to make raw data clean and accessible for analysis.',
    category: 'Data Science',
    requiredSkills: ['Python', 'SQL', 'Apache Spark', 'Hadoop', 'ETL Pipelines', 'Data Warehousing', 'Airflow', 'BigQuery'],
    beginnerSkills: ['Python', 'SQL', 'ETL Pipelines'],
    intermediateSkills: ['Data Warehousing', 'Airflow', 'BigQuery'],
    advancedSkills: ['Apache Spark', 'Hadoop'],
    salaryRange: { min: 95000, max: 175000, currency: 'USD' },
    growthTrend: 'Very High (Growth: +28% YoY)',
    remoteAvailability: 85,
    educationRequirement: "Bachelor's in CS, Mathematics, or Data Engineering bootcamps",
    certifications: ['Google Cloud Certified Professional Data Engineer', 'AWS Certified Data Analytics'],
    tools: ['Apache Airflow', 'Jupyter', 'Docker', 'PgAdmin'],
    technologies: ['Apache Spark', 'Hadoop', 'PostgreSQL', 'BigQuery'],
    difficulty: 'Advanced',
    tags: ['Data', 'ETL', 'Python', 'Spark', 'SQL', 'BigQuery'],
    roadmapTemplate: buildRoadmapTemplate('Data Engineer', [
      {
        title: 'Data Transformations with Python',
        desc: 'Write scripts to clean and transform datasets.',
        duration: '4 weeks',
        skills: ['Python', 'ETL Pipelines'],
        topics: ['Python file reading', 'Parsing CSV & JSON', 'Data transformation formulas', 'Error checking']
      },
      {
        title: 'Database Architecting with SQL',
        desc: 'Structure relational and analytical databases.',
        duration: '4 weeks',
        skills: ['SQL', 'BigQuery'],
        topics: ['Relational schemas', 'SQL Window functions', 'BigQuery table partitions', 'Indexing']
      },
      {
        title: 'Orchestrations & Warehousing',
        desc: 'Automate data sync flows using Airflow.',
        duration: '5 weeks',
        skills: ['Airflow', 'Data Warehousing'],
        topics: ['Airflow DAG files', 'Task scheduling', 'Star vs Snowflake schemas', 'Slowly Changing Dimensions']
      },
      {
        title: 'Big Data Processing with Spark',
        desc: 'Process millions of records in distributed clusters.',
        duration: '5 weeks',
        skills: ['Apache Spark', 'Hadoop'],
        topics: ['PySpark DataFrames', 'Distributed RDDs', 'HDFS commands', 'Spark optimization']
      }
    ])
  },
  {
    id: 'SYSTEMS_ADMIN',
    title: 'Systems Administrator',
    shortDescription: 'Maintains networks, servers, and system directory operations.',
    fullDescription: 'Systems Administrators manage and optimize company server infrastructures. They configure local networks, set up directories, manage system backup recoveries, write system automations, and defend against security leaks.',
    category: 'Cloud & Infrastructure',
    requiredSkills: ['Linux', 'Windows Server', 'Active Directory', 'Networking', 'Shell Scripting', 'Virtualization', 'Backup & Recovery', 'System Security'],
    beginnerSkills: ['Linux', 'Networking', 'Active Directory'],
    intermediateSkills: ['Windows Server', 'Shell Scripting', 'Virtualization'],
    advancedSkills: ['Backup & Recovery', 'System Security'],
    salaryRange: { min: 60000, max: 110000, currency: 'USD' },
    growthTrend: 'Steady (Growth: +10% YoY)',
    remoteAvailability: 70,
    educationRequirement: "Associate's or Bachelor's in Information Technology or Systems Administration",
    certifications: ['CompTIA Network+', 'Microsoft Certified: Windows Server Hybrid Administrator Associate'],
    tools: ['Active Directory Console', 'Hyper-V Manager', 'Putty', 'Wireshark'],
    technologies: ['Linux OS', 'Windows Server OS', 'VMware', 'DNS/DHCP'],
    difficulty: 'Beginner',
    tags: ['Systems', 'Linux', 'Network', 'Admin', 'Infrastructure'],
    roadmapTemplate: buildRoadmapTemplate('Systems Administrator', [
      {
        title: 'Network Setups & Directories',
        desc: 'Configure DNS, DHCP, and group directories.',
        duration: '3 weeks',
        skills: ['Networking', 'Active Directory'],
        topics: ['IP configurations', 'DNS records', 'DHCP leases', 'Active Directory users']
      },
      {
        title: 'Linux CLI Operations',
        desc: 'Navigate and manage Linux server directories.',
        duration: '4 weeks',
        skills: ['Linux', 'Shell Scripting'],
        topics: ['Linux CLI commands', 'Permissions & Ownership', 'Cron jobs', 'Bash automation scripts']
      },
      {
        title: 'Virtualization & Windows Servers',
        desc: 'Manage virtual server instances.',
        duration: '4 weeks',
        skills: ['Windows Server', 'Virtualization'],
        topics: ['Windows Server configurations', 'Hyper-V VM setups', 'IIS Web Servers', 'Remote desktop services']
      },
      {
        title: 'Security Auditing & Recovery backups',
        desc: 'Configure backups and log audits.',
        duration: '4 weeks',
        skills: ['Backup & Recovery', 'System Security'],
        topics: ['Backup policies', 'Vulnerability sweeps', 'System log audits', 'Disaster recovery drills']
      }
    ])
  },
  {
    id: 'PRODUCT_MANAGER',
    title: 'Product Manager',
    shortDescription: 'Defines product roadmaps and orchestrates release features.',
    fullDescription: 'Product Managers bridge software design, engineering, and business metrics. They conduct user research, define target roadmap milestones, write product requirement logs, and coordinate Agile sprint release schedules.',
    category: 'Design & Creative',
    requiredSkills: ['Product Strategy', 'Agile Methodology', 'User Research', 'Data Analytics', 'Roadmapping', 'Cross-functional Collaboration', 'UX/UI Principles', 'Market Analysis'],
    beginnerSkills: ['Agile Methodology', 'User Research', 'Data Analytics'],
    intermediateSkills: ['Product Strategy', 'Roadmapping', 'UX/UI Principles'],
    advancedSkills: ['Cross-functional Collaboration', 'Market Analysis'],
    salaryRange: { min: 90000, max: 160000, currency: 'USD' },
    growthTrend: 'High (Growth: +20% YoY)',
    remoteAvailability: 90,
    educationRequirement: "Bachelor's in Business, Computer Science, Design, or equivalent Agile experience",
    certifications: ['Certified Product Manager (CPM)', 'Professional Scrum Product Owner (PSPO)'],
    tools: ['Jira', 'Miro', 'Productboard', 'Google Analytics'],
    technologies: ['Agile Sprints', 'SQL', 'Figma Viewer', 'A/B Testing'],
    difficulty: 'Intermediate',
    tags: ['Product', 'Management', 'Agile', 'Strategy', 'Business'],
    roadmapTemplate: buildRoadmapTemplate('Product Manager', [
      {
        title: 'Agile & User Research basics',
        desc: 'Run Agile sprints and conduct client interviews.',
        duration: '4 weeks',
        skills: ['Agile Methodology', 'User Research'],
        topics: ['Agile Scrum principles', 'Writing user stories', 'Client interviews', 'Persona logs']
      },
      {
        title: 'Data & UX/UI Review',
        desc: 'Analyze user behavior metrics and design templates.',
        duration: '4 weeks',
        skills: ['Data Analytics', 'UX/UI Principles'],
        topics: ['Google Analytics metrics', 'Figma comment flows', 'A/B Test plans', 'User conversion rates']
      },
      {
        title: 'Product Roadmapping',
        desc: 'Define product roadmaps and release plans.',
        duration: '5 weeks',
        skills: ['Roadmapping', 'Product Strategy'],
        topics: ['Roadmap tools', 'Feature priority matrices', 'MVP definitions', 'Product KPIs']
      },
      {
        title: 'Market Analysis & Delivery coordination',
        desc: 'Coordinate with engineers to ship features.',
        duration: '5 weeks',
        skills: ['Cross-functional Collaboration', 'Market Analysis'],
        topics: ['Competitive landscape surveys', 'Developer handoff meetings', 'Release management', 'Product launch plans']
      }
    ])
  },
  {
    id: 'QA_ENGINEER',
    title: 'QA Engineer',
    shortDescription: 'Verifies software quality through manual and automated testing.',
    fullDescription: 'QA (Quality Assurance) Engineers design software test plans, write automated test scripts, verify API responses, execute regression suites, and track bugs on Jira boards to guarantee application stability.',
    category: 'Software Development',
    requiredSkills: ['Manual Testing', 'Automated Testing', 'Selenium', 'Playwright', 'Jira', 'Regression Testing', 'API Testing', 'SQL'],
    beginnerSkills: ['Manual Testing', 'Jira', 'Regression Testing'],
    intermediateSkills: ['Automated Testing', 'API Testing', 'SQL'],
    advancedSkills: ['Selenium', 'Playwright'],
    salaryRange: { min: 65000, max: 115000, currency: 'USD' },
    growthTrend: 'Steady (Growth: +12% YoY)',
    remoteAvailability: 95,
    educationRequirement: "Associate's or Bachelor's in CS, IT, or QA bootcamps",
    certifications: ['ISTQB Certified Tester Foundation Level', 'Selenium Certified Professional'],
    tools: ['Jira', 'Postman', 'Selenium IDE', 'Chrome DevTools'],
    technologies: ['JavaScript', 'Python', 'SQL', 'Git'],
    difficulty: 'Beginner',
    tags: ['QA', 'Testing', 'Automation', 'Selenium', 'Quality'],
    roadmapTemplate: buildRoadmapTemplate('QA Engineer', [
      {
        title: 'Manual Testing & Jira boards',
        desc: 'Write test cases and file bug tickets on Jira.',
        duration: '3 weeks',
        skills: ['Manual Testing', 'Jira'],
        topics: ['Writing test cases', 'Bug ticket lifecycle', 'Jira boards', 'Defect tracking']
      },
      {
        title: 'API checks & Regression suites',
        desc: 'Test API routes and execute regression tests.',
        duration: '4 weeks',
        skills: ['Regression Testing', 'SQL'],
        topics: ['HTTP request validation', 'Postman collections', 'Database data integrity checking', 'Regression plans']
      },
      {
        title: 'Automated Testing Basics',
        desc: 'Write automated browser script selectors.',
        duration: '4 weeks',
        skills: ['Automated Testing', 'API Testing'],
        topics: ['Locators & Selectors', 'Assertions', 'Test suites', 'Automated API checks']
      },
      {
        title: 'Advanced Selenium & Playwright',
        desc: 'Build automated e2e testing frameworks.',
        duration: '4 weeks',
        skills: ['Selenium', 'Playwright'],
        topics: ['Page Object Model (POM)', 'Parallel test executions', 'CI/CD pipeline test integrations', 'Flaky test debugging']
      }
    ])
  },
  {
    id: 'BLOCKCHAIN_DEVELOPER',
    title: 'Blockchain Developer',
    shortDescription: 'Builds decentralized smart contracts and crypto protocols.',
    fullDescription: 'Blockchain Developers write decentralized applications (dApps), build secure smart contracts, configure distributed systems, design cryptographic security structures, and deploy blockchain tokens.',
    category: 'Software Development',
    requiredSkills: ['Solidity', 'Ethereum', 'Smart Contracts', 'Cryptography', 'Go', 'Rust', 'Web3.js', 'Distributed Systems'],
    beginnerSkills: ['Solidity', 'Ethereum', 'Smart Contracts'],
    intermediateSkills: ['Web3.js', 'Cryptography', 'Distributed Systems'],
    advancedSkills: ['Go', 'Rust'],
    salaryRange: { min: 110000, max: 210000, currency: 'USD' },
    growthTrend: 'High (Growth: +25% YoY)',
    remoteAvailability: 95,
    educationRequirement: "Bachelor's or Master's in CS, Cryptography, or blockchain development portfolio",
    certifications: ['Certified Blockchain Developer (CBD)', 'Ethereum Solidity Developer'],
    tools: ['Hardhat', 'Truffle Suite', 'Remix IDE', 'Metamask'],
    technologies: ['Solidity', 'Ethereum', 'Web3.js', 'Go-Ethereum'],
    difficulty: 'Advanced',
    tags: ['Blockchain', 'Solidity', 'Web3', 'Ethereum', 'Crypto'],
    roadmapTemplate: buildRoadmapTemplate('Blockchain Developer', [
      {
        title: 'Solidity Smart Contracts',
        desc: 'Write Solidity smart contracts.',
        duration: '4 weeks',
        skills: ['Solidity', 'Smart Contracts'],
        topics: ['Solidity variable types', 'Smart contract state modifiers', 'Token transfers', 'Compilation flows']
      },
      {
        title: 'Ethereum Web3 Integrations',
        desc: 'Connect frontend to Ethereum wallets using Web3.js.',
        duration: '4 weeks',
        skills: ['Ethereum', 'Web3.js'],
        topics: ['Wallet login (MetaMask)', 'ABI interface configurations', 'Transaction gas estimations', 'Contract event listeners']
      },
      {
        title: 'Cryptographic Security & Networks',
        desc: 'Build secure, audit-compliant blockchain models.',
        duration: '5 weeks',
        skills: ['Cryptography', 'Distributed Systems'],
        topics: ['Public/Private key algorithms', 'Re-entrancy attack prevention', 'Consensus mechanisms', 'State channels']
      },
      {
        title: 'Distributed System optimizations',
        desc: 'Optimize node execution metrics using Go and Rust.',
        duration: '5 weeks',
        skills: ['Go', 'Rust'],
        topics: ['Go concurrency models', 'Rust memory safety properties', 'Custom node configurations', 'Deployment strategies']
      }
    ])
  },
  {
    id: 'EMBEDDED_ENGINEER',
    title: 'Embedded Systems Engineer',
    shortDescription: 'Designs firmware and microcontroller device drivers.',
    fullDescription: 'Embedded Systems Engineers write firmware code to run directly on microcontrollers. They write device drivers, manage real-time operating systems (RTOS), configure hardware sensors, and debug low-level hardware boards.',
    category: 'Cloud & Infrastructure',
    requiredSkills: ['C', 'C++', 'Microcontrollers', 'RTOS', 'Device Drivers', 'Embedded C', 'Debugging', 'Firmware Development'],
    beginnerSkills: ['C', 'Microcontrollers', 'Debugging'],
    intermediateSkills: ['Embedded C', 'Firmware Development', 'RTOS'],
    advancedSkills: ['C++', 'Device Drivers'],
    salaryRange: { min: 85000, max: 155000, currency: 'USD' },
    growthTrend: 'Steady (Growth: +15% YoY)',
    remoteAvailability: 60,
    educationRequirement: "Bachelor's in Electrical Engineering, Computer Engineering, or CS",
    certifications: ['Embedded Systems Certification', 'RTOS Developer Certificate'],
    tools: ['Oscilloscope', 'JTAG Debugger', 'STM32CubeIDE', 'Keil MDK'],
    technologies: ['ARM Cortex', 'RTOS (FreeRTOS)', 'I2C/SPI Protocols', 'C/C++'],
    difficulty: 'Intermediate',
    tags: ['Embedded', 'Firmware', 'C', 'Hardware', 'Systems'],
    roadmapTemplate: buildRoadmapTemplate('Embedded Systems Engineer', [
      {
        title: 'Microcontroller C Programming',
        desc: 'Write low-level C code to control hardware pins.',
        duration: '4 weeks',
        skills: ['C', 'Microcontrollers'],
        topics: ['GPIO pin controls', 'Registers & Bitwise arithmetic', 'Timer interrupts', 'Analog-to-Digital conversions']
      },
      {
        title: 'Low-Level Debugging & Protocols',
        desc: 'Read digital signals and configure bus protocols.',
        duration: '4 weeks',
        skills: ['Debugging', 'Embedded C'],
        topics: ['I2C communications', 'SPI bus protocols', 'UART interfaces', 'JTAG debugging controls']
      },
      {
        title: 'RTOS & Firmware Architectures',
        desc: 'Schedule concurrent tasks using FreeRTOS.',
        duration: '5 weeks',
        skills: ['RTOS', 'Firmware Development'],
        topics: ['Task priorities', 'Semaphores & Mutexes', 'Queue structures', 'Memory allocation schemes']
      },
      {
        title: 'Device Drivers & C++ optimizations',
        desc: 'Write optimized device drivers in C++.',
        duration: '5 weeks',
        skills: ['C++', 'Device Drivers'],
        topics: ['Custom hardware drivers', 'C++ template constraints', 'Power conservation policies', 'Interrupt service routines']
      }
    ])
  },
  {
    id: 'DATABASE_ADMIN',
    title: 'Database Administrator',
    shortDescription: 'Manages database configurations, tuning, and recovery backups.',
    fullDescription: 'Database Administrators ensure database availability, safety, and performance. They configure clusters, tune query executions, schedule automated backup recoveries, and manage access privileges across SQL and NoSQL engines.',
    category: 'Cloud & Infrastructure',
    requiredSkills: ['SQL', 'Database Design', 'Backup & Recovery', 'Performance Tuning', 'PostgreSQL', 'MongoDB', 'Oracle', 'MySQL'],
    beginnerSkills: ['SQL', 'Database Design', 'MySQL'],
    intermediateSkills: ['PostgreSQL', 'MongoDB', 'Oracle'],
    advancedSkills: ['Backup & Recovery', 'Performance Tuning'],
    salaryRange: { min: 75000, max: 130000, currency: 'USD' },
    growthTrend: 'Steady (Growth: +14% YoY)',
    remoteAvailability: 80,
    educationRequirement: "Associate's or Bachelor's in CS, IT, or database administration courses",
    certifications: ['Oracle Database Administration Certified Professional', 'AWS Certified Database - Specialty'],
    tools: ['PgAdmin', 'MongoDB Compass', 'Oracle Enterprise Manager', 'MySQL Workbench'],
    technologies: ['PostgreSQL', 'MongoDB', 'MySQL', 'Oracle DB'],
    difficulty: 'Intermediate',
    tags: ['Database', 'SQL', 'PostgreSQL', 'MongoDB', 'Admin'],
    roadmapTemplate: buildRoadmapTemplate('Database Administrator', [
      {
        title: 'SQL Schema Design & MySQL',
        desc: 'Structure relational tables and constraints.',
        duration: '3 weeks',
        skills: ['SQL', 'Database Design'],
        topics: ['Table normalization', 'Foreign key constraints', 'MySQL setups', 'Basic views']
      },
      {
        title: 'PostgreSQL & Oracle operations',
        desc: 'Manage users, tablespaces, and indexes.',
        duration: '4 weeks',
        skills: ['PostgreSQL', 'Oracle'],
        topics: ['PostgreSQL tablespaces', 'Oracle users & roles', 'Index creation models', 'Stored procedures']
      },
      {
        title: 'NoSQL Document stores (MongoDB)',
        desc: 'Configure replica sets and document lookups.',
        duration: '4 weeks',
        skills: ['MongoDB', 'MySQL'],
        topics: ['Document validation schemas', 'Replica sets configuration', 'Aggregation pipelines', 'Sharding']
      },
      {
        title: 'Performance tuning & Recovery backups',
        desc: 'Tune slow queries and configure cluster failover.',
        duration: '4 weeks',
        skills: ['Backup & Recovery', 'Performance Tuning'],
        topics: ['EXPLAIN query execution analysis', 'Point-in-Time Recovery (PITR)', 'Load balancing setups', 'Security auditing']
      }
    ])
  }
];
