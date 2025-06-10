// Jenkinsfile
pipeline {
    // 1. Specify the agent (where to run)
    agent any

    environment {
        // Define the Docker Hub credential ID and your username
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKER_HUB_USERNAME = 'rakhatf' // <== CHANGE THIS
        IMAGE_NAME = "${DOCKER_HUB_USERNAME}/my-typescript-app"
        DISCORD_WEBHOOK = credentials('DISCORD_WEBHOOK')
    }

    // 2. Define the tools needed for the pipeline
    tools {
        // Use the NodeJS tool you configured in Jenkins Global Tool Configuration
        nodejs 'NodeJS-20'
    }

    // 3. Define the stages of your pipeline
    stages {

         stage('Notify Discord') {
                steps {
                    script {
                        discordSend title: 'Deployment Status: STARTED',
                        description: "Deployment started", 
                        footer: "Deployment Status: STARTED", 
                        link: env.BUILD_URL, 
                        result: currentBuild.currentResult, 
                        webhookURL: env.DISCORD_WEBHOOK
                    }
                }
            }

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
            // Clean up the workspace to save disk space
            cleanWs()
        }

        success {
            echo 'Pipeline succeeded!'
            script {
                discordSend title: 'Deployment Status: SUCCESS',
                webhookURL: env.DISCORD_WEBHOOK,
                description: "Build #${env.BUILD_NUMBER} completed successfully.",
                link: env.BUILD_URL,
                footer: "Deployment Status: SUCCESS"
            }
        }

        failure {
            echo 'Pipeline failed!'
            script {
                discordSend title: "Build Failed: ${env.JOB_NAME}",
                webhookURL: env.DISCORD_WEBHOOK,
                description: "Build #${env.BUILD_NUMBER} failed. Please check the logs.",
                link: env.BUILD_URL,
                footer: "Deployment Status: FAILED"
            }
        }

        unstable {
            echo 'Pipeline is unstable (tests failed but build succeeded)'
            script {
                discordSend title: "Build Unstable: ${env.JOB_NAME}",
                webhookURL: env.DISCORD_WEBHOOK,
                description: "Build #${env.BUILD_NUMBER} completed, but tests failed.",
                link: env.BUILD_URL,
                footer: "Deployment Status: UNSTABLE"
            }
        }
    }
}
