pipeline {
  agent any
  environment {
    GEMINI_API_KEY = credentials('GEMINI_API_KEY')
    MISTRAL_API_KEY = credentials('MISTRAL_API_KEY')
    JWT_SECRET = credentials('jwt-secret')
    JWT_REFRESH_SECRET = credentials('jwt-refresh-secret')
    
    // Docker image name
    DOCKER_IMAGE = "johin714/studybuddy"
  }

  triggers {
    githubPush() // Listen for GitHub push events
  }

  stages {
    stage('Clone Repo') {
      steps {
        sh "rm -rf StudyBuddy || true"
        // Use GitHub credentials to clone the repo
        withCredentials([usernamePassword(credentialsId: 'github-credentials', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
          sh 'git clone https://$GIT_USER:$GIT_TOKEN@github.com/Johin2/StudyBuddy.git'
        }
      }
    }
    
    stage('Testing') {
      steps {
        dir('StudyBuddy') {
          sh 'npm ci'
          sh 'npm test'
        }
      }
    }
    
    stage('Build Docker Image') {
      steps {
        dir('StudyBuddy') {
          sh 'docker build -t $DOCKER_IMAGE:latest .'
        }
      }
    }
    
    stage('Push Docker Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
            docker push $DOCKER_IMAGE:latest
          '''
        }
      }
    }
        
  stage('Deploy to Kubernetes') {
    steps {
      sh '''
        export KUBECONFIG=/var/lib/jenkins/.kube/config

        # Set context to minikube
        kubectl config set-cluster minikube --server=https://192.168.49.2:8443 --insecure-skip-tls-verify=true
        kubectl config use-context minikube

        # Create or update the JWT secret (if needed)
        cat <<EOF | kubectl apply --validate=false -f -
        apiVersion: v1
        kind: Secret
        metadata:
          name: secrets
        type: Opaque
        data:
          JWT_SECRET: $(echo -n "$JWT_SECRET" | base64)
          JWT_REFRESH_SECRET: $(echo -n "$JWT_REFRESH_SECRET" | base64)
        EOF

        # Substitute the environment variables in the deployment YAML template.
        envsubst < studybuddy-deployment.yaml.template > studybuddy-deployment.yaml

        # Apply the MongoDB deployment.
        kubectl apply --validate=false -f mongodeployment.yaml

        # Apply the updated deployment.
        kubectl apply --validate=false -f studybuddy-deployment.yaml

        # Rollout restart and wait for it to complete.
        kubectl set image deployment/studybuddy studybuddy=$DOCKER_IMAGE:latest
        kubectl rollout restart deployment studybuddy
        kubectl rollout status deployment/studybuddy
      '''
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
