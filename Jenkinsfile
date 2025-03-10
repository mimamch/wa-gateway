pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build & Deploy') {
            steps {
                sh '''
                    # Force remove existing containers and volumes
                    docker compose -f docker-compose.yml down -v --remove-orphans || true
                    
                    # Rebuild and start fresh containers
                    docker compose -f docker-compose.yml up --build -d
                '''
            }
        }
        stage('Cleanup Docker Images') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }
    post {
        failure {
            echo 'Build failed. Cleaning up workspace...'
            cleanWs() 
        }
        always {
            echo 'Pipeline finished.'
        }
    }
}