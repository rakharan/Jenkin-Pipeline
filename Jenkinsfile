// Jenkinsfile
pipeline {
    // 1. Specify the agent (where to run)
    agent any

    environment {
        // Define the Docker Hub credential ID and your username
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKER_HUB_USERNAME = 'rakhatf' // <== CHANGE THIS
        IMAGE_NAME = "${DOCKER_HUB_USERNAME}/my-typescript-app"
    }

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

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${IMAGE_NAME}:${env.BUILD_NUMBER}"
                
                // Use the Docker Pipeline plugin to build the image from our Dockerfile
                // The return value is an object representing the built image
                script {
                    def customImage = docker.build(IMAGE_NAME, ".")
                }
            }
        }

        stage('Push Docker Images') {
             // This stage will only run on the main branch, to avoid pushing
            // images from every single feature branch.
            when {
                branch 'main'
            }
            steps {
                echo "Pushing Docker image to Docker Hub..."
                
                // Jenkins will log in to Docker Hub using the credentials,
                // execute the push, and then log out.
                script {
                    docker.withRegistry("https://registry.hub.docker.com", DOCKER_CREDENTIALS_ID) {
                        
                        // Tag the image with the build number
                        def customImage = docker.image(IMAGE_NAME)
                        customImage.push("${env.BUILD_NUMBER}")
                        
                        // Also tag it with 'latest' for convenience
                        customImage.push("latest")
                    }
                }
            }
        }

        stage('Deploy') {
            // This 'when' block is the key. It tells Jenkins to only
            // execute this stage if the branch being built is 'main'.
            when {
                branch 'main'
            }
            
            steps {
                echo 'Deploying to staging environment...'
                // Here you would add your deployment script or command
                // For example, you might use a shell script or a specific deployment tool
                // bat 'deploy-staging.sh' // Uncomment and replace with your actual deployment command
            }
        }
    }

    // 4. Define actions to take after the pipeline completes
    post {
        always {
            echo 'Pipeline finished.'
            
            script {
                // Only send email on success if it was previously failing
                if (currentBuild.getPreviousBuild()?.result == 'FAILURE') {
                    emailext (
                        subject: "Build Fixed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: """
                        <h3>Build is now working!</h3>
                        <p><b>Job:</b> ${env.JOB_NAME}</p>
                        <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
                        <p><b>Branch:</b> ${env.GIT_BRANCH}</p>
                        <p><b>Duration:</b> ${currentBuild.durationString}</p>
                        
                        <p>The build that was previously failing is now successful.</p>
                        
                        <p><a href="${env.BUILD_URL}">View Build Details</a></p>
                        <p><a href="${env.BUILD_URL}console">View Console Output</a></p>
                        """,
                        mimeType: 'text/html',
                        to: "${env.DEV_EMAIL}"
                    )
                }
            }

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
            emailext (
                subject: "Build Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                <h3>Build Failed</h3>
                <p><b>Job:</b> ${env.JOB_NAME}</p>
                <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
                <p><b>Branch:</b> ${env.GIT_BRANCH}</p>
                <p><b>Duration:</b> ${currentBuild.durationString}</p>
                
                <p><b>What to do:</b></p>
                <ul>
                    <li>Check the console output for error details</li>
                    <li>Review recent commits that might have caused the issue</li>
                    <li>Run tests locally to reproduce the problem</li>
                </ul>
                
                <p><a href="${env.BUILD_URL}console">View Console Output</a></p>
                <p><a href="${env.BUILD_URL}">View Build Details</a></p>
                
                <p><b>Recent Changes:</b></p>
                <p>Commit: ${env.GIT_COMMIT}</p>
                """,
                mimeType: 'text/html',
                to: "${env.DEV_EMAIL}"
            )
        }

        unstable {
            echo 'Pipeline is unstable (tests failed but build succeeded)'
            emailext (
                subject: "Build Unstable - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                <h3>Build Unstable</h3>
                <p>The build completed but some tests failed or there are warnings.</p>
                
                <p><b>Job:</b> ${env.JOB_NAME}</p>
                <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
                <p><b>Branch:</b> ${env.GIT_BRANCH}</p>
                
                <p><a href="${env.BUILD_URL}console">View Console Output</a></p>
                <p><a href="${env.BUILD_URL}testReport">View Test Results</a></p>
                """,
                mimeType: 'text/html',
                to: "${env.DEV_EMAIL}"
            )
        }
    }
}