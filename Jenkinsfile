pipeline {
    agent any

    triggers {
        githubPush()  // 🔍 Ensures Jenkins listens for GitHub webhooks
    }

    environment {
        DOCKER_IMAGE = "johin714/studybuddy"
    }

    stages {
        stage('Clone Repo') {
            steps {
                sh "rm -rf StudyBuddy || true"
                withCredentials([usernamePassword(credentialsId: 'github-credentials', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                    sh 'git clone https://$GIT_USER:$GIT_TOKEN@github.com/Johin2/StudyBuddy.git'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE:latest .'
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push $DOCKER_IMAGE:latest
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                kubectl set image deployment/studybuddy studybuddy=$DOCKER_IMAGE:latest --record
                kubectl rollout status deployment/studybuddy
                """
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed. Check Jenkins logs.'
        }
    }
}
