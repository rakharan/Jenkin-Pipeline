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
                script {
                    echo 'Installing dependencies...'
                    
                    // Simple caching approach - check if node_modules exists and package-lock.json hasn't changed
                    def shouldInstall = true
                    
                    if (fileExists('node_modules') && fileExists('.deps-cache')) {
                        try {
                            // Get current package-lock.json hash
                            def currentHash = bat(
                                script: '@echo off && certutil -hashfile package-lock.json SHA256 | findstr /v "SHA256" | findstr /v "CertUtil"',
                                returnStdout: true
                            ).trim()
                            
                            // Get cached hash
                            def cachedHash = readFile('.deps-cache').trim()
                            
                            if (currentHash == cachedHash) {
                                echo "Dependencies cache hit - package-lock.json unchanged"
                                shouldInstall = false
                            } else {
                                echo "Dependencies cache miss - package-lock.json changed"
                            }
                        } catch (Exception e) {
                            echo "Cache check failed, will install dependencies: ${e.message}"
                        }
                    }
                    
                    if (shouldInstall) {
                        // 'npm ci' is recommended for CI environments. It's faster and stricter than 'npm install'.
                        bat 'npm ci'
                        
                        // Cache the hash for next build
                        try {
                            def newHash = bat(
                                script: '@echo off && certutil -hashfile package-lock.json SHA256 | findstr /v "SHA256" | findstr /v "CertUtil"',
                                returnStdout: true
                            ).trim()
                            writeFile file: '.deps-cache', text: newHash
                            echo "Dependencies cache updated"
                        } catch (Exception e) {
                            echo "Failed to update cache: ${e.message}"
                        }
                    }
                }
            }
        }

        stage('Lint Code') {
            steps {
                echo 'Running linter...'
                // Executes the 'lint' script from your package.json
                bat 'npm run lint'
            }
        }

        stage('Run Unit Tests') {
            steps {
                echo 'Running unit tests...'
                // Executes the 'test' script and generates a JUnit XML report for Jenkins to display
                bat 'npm test -- --reporters=default --reporters=jest-junit'
            }
            post {
                // This 'always' block runs regardless of the stage's success or failure
                always {
                    // This step collects the test results and displays them in the Jenkins UI
                    // Only publish if the junit.xml file exists
                    script {
                        if (fileExists('junit.xml')) {
                            junit 'junit.xml'
                        } else {
                            echo 'No junit.xml file found - skipping test result publishing'
                        }
                    }
                }
            }
        }

        stage('Build Application') {
            steps {
                echo 'Building TypeScript to JavaScript...'
                // Executes the 'build' script from package.json (runs tsc)
                bat 'npm run build'
            }
        }

        stage('Archive Artifacts') {
            steps {
                echo 'Archiving build artifacts...'
                // This saves the 'dist' folder (your compiled JS) and other important files
                // as build artifacts, which can be downloaded or used by downstream jobs.
                script {
                    if (fileExists('dist')) {
                        archiveArtifacts artifacts: 'dist/**, package.json, package-lock.json', followSymlinks: false
                    } else {
                        echo 'No dist folder found - skipping artifact archiving'
                    }
                }
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