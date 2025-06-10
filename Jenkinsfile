// Jenkinsfile
pipeline {
    // 1. Specify the agent (where to run)
    agent any

    // 2. Define the tools needed for the pipeline
    tools {
        // Use the NodeJS tool you configured in Jenkins Global Tool Configuration
        nodejs 'NodeJS-20'
    }

    // 3. Define the stages of your pipeline
    stages {

        stage('Checkout Code') {
            steps {
                // Cleans the workspace before checkout
                cleanWs()
                // Checks out the code from the repository configured in the Jenkins job
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                // This is a best practice for caching node_modules
                // It creates a cache that is invalidated only when package-lock.json changes.
                // This dramatically speeds up builds.
                cache(path: 'node_modules', key: "npm-${hashFiles('package-lock.json')}") {
                    // 'npm ci' is recommended for CI environments. It's faster and stricter than 'npm install'.
                    sh 'npm ci'
                }
            }
        }

        stage('Lint Code') {
            steps {
                echo 'Running linter...'
                // Executes the 'lint' script from your package.json
                sh 'npm run lint'
            }
        }

        stage('Run Unit Tests') {
            steps {
                echo 'Running unit tests...'
                // Executes the 'test' script and generates a JUnit XML report for Jenkins to display
                sh 'npm test -- --reporters=default --reporters=jest-junit'
            }
            post {
                // This 'always' block runs regardless of the stage's success or failure
                always {
                    // This step collects the test results and displays them in the Jenkins UI
                    junit 'junit.xml'
                }
            }
        }

        stage('Build Application') {
            steps {
                echo 'Building TypeScript to JavaScript...'
                // Executes the 'build' script from package.json (runs tsc)
                sh 'npm run build'
            }
        }

        stage('Archive Artifacts') {
            steps {
                echo 'Archiving build artifacts...'
                // This saves the 'dist' folder (your compiled JS) and other important files
                // as build artifacts, which can be downloaded or used by downstream jobs.
                archiveArtifacts artifacts: 'dist/**, package.json, package-lock.json', followSymlinks: false
            }
        }
    }

    // 4. Define actions to take after the pipeline completes
    post {
        always {
            echo 'Pipeline finished.'
            // Clean up the workspace to save disk space
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
            // You could add a notification step here (e.g., Slack or email)
        }
        failure {
            echo 'Pipeline failed!'
            // You could add a failure notification here
        }
    }
}
