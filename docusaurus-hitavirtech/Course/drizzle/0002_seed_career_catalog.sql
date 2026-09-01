-- Initial editable commercial catalog. Values live in D1 after migration and
-- can be changed by admin tooling without a frontend deployment.
INSERT OR IGNORE INTO users (id, email, display_name, role)
VALUES ('admin-system', 'catalog@system.invalid', 'Catalog System', 'admin');

INSERT OR IGNORE INTO career_domains (id, slug, name, description, `order`, active) VALUES
('domain-01','data-ai','Data & AI','Analytics, data platforms, machine learning and production AI systems.',1,1),
('domain-02','development','Development','Modern frontend, backend and full-stack software engineering.',2,1),
('domain-03','quality','Quality & Testing','Manual, API, automation and production quality engineering.',3,1);

INSERT OR IGNORE INTO subjects (id,slug,name,description,icon,difficulty,estimated_hours,status,created_by) VALUES
('subj-python','python','Python Programming','Python foundations, data structures, automation and production practices.','Code2','beginner',40,'published','admin-system'),
('subj-sql','sql','SQL & Databases','Reusable SQL curriculum for querying, modeling and optimizing relational data.','Database','beginner',30,'published','admin-system'),
('subj-excel','excel','Excel for Analytics','Analysis, modeling, automation and dashboard workflows in Excel.','Table2','beginner',25,'published','admin-system'),
('subj-git','git','Git & GitHub','Version control, collaboration and portfolio-ready repository practice.','GitBranch','beginner',10,'published','admin-system'),
('subj-statistics','statistics','Statistics & Probability','Descriptive statistics, probability, inference and regression foundations.','BarChart3','intermediate',35,'published','admin-system'),
('subj-pandas','pandas','Pandas & NumPy','Numerical computing, data manipulation and reproducible analysis.','Layers3','intermediate',30,'published','admin-system'),
('subj-eda','eda','Data Cleaning & EDA','Data quality, profiling, cleaning and exploratory analysis.','SearchCheck','intermediate',25,'published','admin-system'),
('subj-visualization','visualization','Data Visualization','Clear analytical charts, storytelling and dashboard design.','ChartNoAxesCombined','intermediate',20,'published','admin-system'),
('subj-powerbi','power-bi','Power BI','Data models, DAX and executive dashboards in Power BI.','ChartColumn','intermediate',30,'published','admin-system'),
('subj-tableau','tableau','Tableau','Interactive analysis and business storytelling in Tableau.','ChartSpline','intermediate',25,'published','admin-system'),
('subj-ml-fundamentals','machine-learning','Machine Learning','Supervised and unsupervised learning, evaluation and feature engineering.','BrainCircuit','intermediate',55,'published','admin-system'),
('subj-deep-learning','deep-learning','Deep Learning','Neural networks, training workflows and responsible evaluation.','Network','advanced',40,'published','admin-system'),
('subj-nlp','nlp','Natural Language Processing','Text processing, embeddings, transformers and evaluation.','Languages','advanced',35,'published','admin-system'),
('subj-genai','generative-ai','Generative AI','LLM fundamentals, prompting, structured outputs and AI APIs.','Sparkles','intermediate',35,'published','admin-system'),
('subj-rag','rag','Retrieval-Augmented Generation','Chunking, retrieval, reranking, grounding and RAG evaluation.','Search','advanced',35,'published','admin-system'),
('subj-agents','ai-agents','AI Agents','Tools, planning, memory, reflection and agent workflows.','Bot','advanced',45,'published','admin-system'),
('subj-mcp','mcp','Model Context Protocol','Secure tool integration and interoperable agent systems.','Cable','advanced',18,'published','admin-system'),
('subj-spark','spark','Apache Spark & PySpark','Distributed data processing and production Spark pipelines.','Gauge','advanced',40,'published','admin-system'),
('subj-airflow','airflow','Apache Airflow','Reliable orchestration, scheduling, testing and operations.','Workflow','advanced',25,'published','admin-system'),
('subj-kafka','kafka','Apache Kafka','Event streaming, delivery semantics and resilient consumers.','RadioTower','advanced',30,'published','admin-system'),
('subj-react','react','React','Accessible component architecture, state and testing.','PanelsTopLeft','intermediate',40,'published','admin-system'),
('subj-nextjs','nextjs','Next.js','Full-stack React, routing, rendering and deployment.','Boxes','intermediate',35,'published','admin-system'),
('subj-nodejs','nodejs','Node.js & Express','Backend APIs, authentication, validation and testing.','ServerCog','intermediate',40,'published','admin-system'),
('subj-postgres','postgresql','PostgreSQL','Relational design, queries, transactions and performance.','Database','intermediate',30,'published','admin-system'),
('subj-testing','software-testing','Software Testing','Manual, API, automation, performance and CI/CD testing.','TestTube2','beginner',60,'published','admin-system');

INSERT OR IGNORE INTO career_programs (id,slug,domain_id,name,subtitle,description,short_description,level,duration,estimated_hours,job_roles,outcomes,status,featured,created_by) VALUES
('prog-data-analyst','data-analyst','domain-01','Data Analyst Career Program','Master analytics from Excel to AI-powered dashboards.','Learn Excel, SQL, statistics, Python, Power BI and Tableau through business-focused analysis and portfolio projects.','Master Excel, SQL, Python, Power BI and Tableau through hands-on analytics projects.','beginner','20 weeks',280,'["Data Analyst","Business Intelligence Analyst"]','["Analyze real datasets","Query databases with SQL","Build decision-ready dashboards","Present business insights"]','published',1,'admin-system'),
('prog-data-scientist','data-scientist','domain-01','Data Science Career Program','Build evidence-driven models from data to deployment.','Progress through Python, SQL, statistics, data analysis, machine learning, deep learning and production projects.','Learn the complete data science workflow and build a rigorous project portfolio.','beginner','28 weeks',390,'["Data Scientist","Applied Scientist"]','["Explore and model data","Evaluate machine-learning systems","Communicate uncertainty","Build a production capstone"]','published',1,'admin-system'),
('prog-data-engineer','data-engineer','domain-01','Data Engineering Career Program','Design reliable batch, streaming and lakehouse platforms.','Master Python, advanced SQL, Spark, Airflow, Kafka, cloud data platforms and production operations.','Build reliable data pipelines, warehouses, streaming systems and lakehouse projects.','intermediate','28 weeks',420,'["Data Engineer","Analytics Engineer"]','["Design data models","Build batch and streaming pipelines","Orchestrate reliable workflows","Operate a cloud data platform"]','published',1,'admin-system'),
('prog-ml-engineer','machine-learning-engineer','domain-01','Machine Learning Engineer Program','Train, evaluate and ship dependable ML systems.','Combine Python, statistics, machine learning, deep learning and deployment practices in production projects.','Move from modeling fundamentals to evaluated, deployable machine-learning systems.','intermediate','24 weeks',340,'["Machine Learning Engineer","Applied ML Engineer"]','["Train robust models","Design evaluation suites","Package inference services","Monitor model behavior"]','published',1,'admin-system'),
('prog-genai-engineer','generative-ai-engineer','domain-01','Generative AI Engineer Program','Build grounded, evaluated and cost-aware LLM products.','Learn LLM APIs, structured outputs, embeddings, vector databases, RAG, guardrails and production evaluation.','Build production-minded LLM and RAG applications with measurable quality.','intermediate','18 weeks',240,'["Generative AI Engineer","LLM Engineer"]','["Integrate LLM APIs","Build advanced RAG","Evaluate grounded answers","Deploy guarded AI features"]','published',1,'admin-system'),
('prog-agentic-ai','agentic-ai-engineer','domain-01','Agentic AI Engineer Program','Design tool-using agents and multi-agent workflows.','Master agent architecture, LangGraph concepts, memory, MCP, multi-agent systems, guardrails and observability.','Build, evaluate and defend production agent workflows with secure tool use.','advanced','22 weeks',300,'["Agentic AI Engineer","AI Automation Engineer"]','["Design agent workflows","Integrate tools securely","Evaluate multi-agent behavior","Operate production agents"]','published',1,'admin-system'),
('prog-fullstack','full-stack-development','domain-02','Full Stack Development Program','Build accessible, secure and deployable web products.','Learn HTML, CSS, TypeScript, React, Next.js, Node.js, PostgreSQL, testing, Docker and system design.','Build complete web products across frontend, backend, data and deployment.','beginner','26 weeks',380,'["Full Stack Developer","Software Engineer"]','["Build accessible interfaces","Design secure APIs","Model relational data","Deploy tested applications"]','published',1,'admin-system'),
('prog-mern','mern-stack-development','domain-02','MERN Stack Developer Program','Ship production JavaScript applications end to end.','Build authentication, e-commerce, social, admin and SaaS applications with React, Node.js and document data.','Master the MERN workflow through five production-oriented applications.','beginner','20 weeks',300,'["MERN Developer","JavaScript Developer"]','["Build React applications","Create Node APIs","Implement authentication","Deploy tested products"]','published',0,'admin-system'),
('prog-testing','software-testing-engineer','domain-03','Software Testing Engineer Program','Build confidence from test design to automated delivery.','Practice manual testing, API and SQL validation, Playwright automation, performance, security fundamentals and CI/CD.','Learn realistic QA workflows through test plans, automation and release evidence.','beginner','18 weeks',260,'["QA Engineer","Test Automation Engineer"]','["Design effective test cases","Automate browser and API tests","Test non-functional requirements","Integrate quality gates into CI"]','published',1,'admin-system');

INSERT OR IGNORE INTO program_pricing (id,program_id,base_price,sale_price,currency,discount_percentage,access_duration_days,pricing_type,installment_allowed,active) VALUES
('price-data-analyst','prog-data-analyst',899900,249900,'INR',72,NULL,'career_pack',1,1),
('price-data-scientist','prog-data-scientist',999900,349900,'INR',65,NULL,'career_pack',1,1),
('price-data-engineer','prog-data-engineer',1099900,449900,'INR',59,NULL,'career_pack',1,1),
('price-ml-engineer','prog-ml-engineer',999900,349900,'INR',65,NULL,'career_pack',1,1),
('price-genai-engineer','prog-genai-engineer',799900,249900,'INR',69,NULL,'career_pack',1,1),
('price-agentic-ai','prog-agentic-ai',899900,299900,'INR',67,NULL,'career_pack',1,1),
('price-fullstack','prog-fullstack',899900,299900,'INR',67,NULL,'career_pack',1,1),
('price-mern','prog-mern',799900,249900,'INR',69,NULL,'career_pack',1,1),
('price-testing','prog-testing',699900,199900,'INR',71,NULL,'career_pack',1,1);

INSERT OR IGNORE INTO program_subjects (program_id,subject_id,`order`,required) VALUES
('prog-data-analyst','subj-excel',1,1),('prog-data-analyst','subj-sql',2,1),('prog-data-analyst','subj-statistics',3,1),('prog-data-analyst','subj-python',4,1),('prog-data-analyst','subj-pandas',5,1),('prog-data-analyst','subj-eda',6,1),('prog-data-analyst','subj-powerbi',7,1),('prog-data-analyst','subj-tableau',8,1),
('prog-data-scientist','subj-python',1,1),('prog-data-scientist','subj-git',2,1),('prog-data-scientist','subj-sql',3,1),('prog-data-scientist','subj-statistics',4,1),('prog-data-scientist','subj-pandas',5,1),('prog-data-scientist','subj-eda',6,1),('prog-data-scientist','subj-ml-fundamentals',7,1),('prog-data-scientist','subj-deep-learning',8,0),
('prog-data-engineer','subj-python',1,1),('prog-data-engineer','subj-sql',2,1),('prog-data-engineer','subj-git',3,1),('prog-data-engineer','subj-spark',4,1),('prog-data-engineer','subj-airflow',5,1),('prog-data-engineer','subj-kafka',6,1),
('prog-ml-engineer','subj-python',1,1),('prog-ml-engineer','subj-statistics',2,1),('prog-ml-engineer','subj-ml-fundamentals',3,1),('prog-ml-engineer','subj-deep-learning',4,1),
('prog-genai-engineer','subj-python',1,1),('prog-genai-engineer','subj-genai',2,1),('prog-genai-engineer','subj-rag',3,1),('prog-genai-engineer','subj-nlp',4,0),
('prog-agentic-ai','subj-python',1,1),('prog-agentic-ai','subj-genai',2,1),('prog-agentic-ai','subj-agents',3,1),('prog-agentic-ai','subj-rag',4,1),('prog-agentic-ai','subj-mcp',5,1),
('prog-fullstack','subj-git',1,1),('prog-fullstack','subj-react',2,1),('prog-fullstack','subj-nextjs',3,1),('prog-fullstack','subj-nodejs',4,1),('prog-fullstack','subj-postgres',5,1),
('prog-mern','subj-git',1,1),('prog-mern','subj-react',2,1),('prog-mern','subj-nodejs',3,1),
('prog-testing','subj-testing',1,1),('prog-testing','subj-sql',2,1);
