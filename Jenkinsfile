pipeline {
    agent any

    triggers {
        githubPush()
    }

    environement {
        DOCKER_IMAGE = "johin714/studybuddy"
        KUBE_DEPLOYMENT = "studybuddy"
        KUBE_NAMESPACE = "default"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: "https://github.com/Johin2/studybuddy.git"
            }
        }

        stage('Build Docker Image'){
            steps{
                echo "Building Docker Image..."
                sh 'docker build -t $DOCKER_IMAGE:latest'
            }
        }

        stage('Push Docker Image') {
            steps{
                echo "Pushing Docker Image to Docker Hub..."
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DCOKER_USER',passwordVariable: 'DOCKER_PASS')]) {
                    sh "docker login -u $DOCKER_USER -p $DOCKER_PASS"
                    sh "docker push $DOCKER_IMAGE:latest"
                }
            }
        }

        stage('Deploy to Kubernetes'){
            steps{
                echo "Deplotying to Kubernetes..."
                sh '''
                kubectl set image deployment/$KUBE_DEPLOYMENT studybuddy = $DOCKER_IMAGE:latest --namespace=$KUBE_NAMESPACE --record
                kubectl rollout status deployment/$KUBE_DEPLOYMENT --namespace=$KUBE_NAMESPACE
                '''
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo "Deployment failed. Check logs for details"
        }
    }

}