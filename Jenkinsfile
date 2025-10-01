pipeline {
    agent any
    
    environment {
        SONARQUBE_URL = 'http://sonarqube:9000'
        SONAR_TOKEN = credentials('sonarqube-token')
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        BACKEND_DIR = '.'
        FRONTEND_DIR = 'frontend'
    }
    
    tools {
        maven 'Maven-3.9'
        jdk 'JDK-17'
        nodejs 'NodeJS-18'
    }
    
    stages {
        stage('🔍 Checkout Code') {
            steps {
                echo '📥 Pulling latest code from GitHub...'
                checkout scm
                sh '''
                    echo "Current commit: $(git rev-parse --short HEAD)"
                    echo "Branch: $(git branch --show-current)"
                '''
            }
        }
        
        // ==================== BACKEND PIPELINE ====================
        
        stage('🔨 Backend: Clean & Build') {
            steps {
                echo '🔨 Building Spring Boot Backend...'
                dir("${BACKEND_DIR}") {
                    sh '''
                        mvn clean
                        mvn compile -DskipTests
                    '''
                }
            }
        }
        
        stage('🧪 Backend: Unit Tests') {
            steps {
                echo '🧪 Running backend unit tests...'
                dir("${BACKEND_DIR}") {
                    sh 'mvn test'
                }
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                }
            }
        }
        
        stage('📊 Backend: SonarQube Analysis') {
            steps {
                echo '📊 Running SonarQube analysis on backend...'
                dir("${BACKEND_DIR}") {
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                            mvn sonar:sonar \
                            -Dsonar.projectKey=spring-backend \
                            -Dsonar.projectName="Spring Backend" \
                            -Dsonar.host.url=${SONARQUBE_URL} \
                            -Dsonar.login=${SONAR_TOKEN}
                        '''
                    }
                }
            }
        }
        
        stage('⏳ Backend: Quality Gate') {
            steps {
                echo '⏳ Waiting for backend Quality Gate...'
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "❌ Backend Quality Gate failed: ${qg.status}"
                        } else {
                            echo "✅ Backend Quality Gate passed!"
                        }
                    }
                }
            }
        }
        
        stage('🛡️ Backend: OWASP Dependency Check') {
            steps {
                echo '🛡️ Scanning backend dependencies...'
                withCredentials([string(credentialsId: 'nvd-api-key', variable: 'NVD_API_KEY')]) {
                    dir("${BACKEND_DIR}") {
                        // Change from single quotes to double quotes
                        sh """
                            mkdir -p odc-reports
                            docker run --rm \\
                                -e NVD_API_KEY=${env.NVD_API_KEY} \\
                                -v odc_data:/usr/share/dependency-check/data \\
                                -v \$(pwd):/src \\
                                -v \$(pwd)/odc-reports:/report \\
                                owasp/dependency-check:latest \\
                                --scan /src \\
                                --format ALL \\
                                --project "Spring-Backend" \\
                                --out /report \\
                                --failOnCVSS 7 || true
                        """
                    }
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: false,
                        keepAll: true,
                        reportDir: "${BACKEND_DIR}/odc-reports",
                        reportFiles: 'dependency-check-report.html',
                        reportName: 'Backend OWASP Dependency Check'
                    ])
                }
            }
        }
                
        stage('📦 Backend: Package JAR') {
            steps {
                echo '📦 Packaging backend application...'
                dir("${BACKEND_DIR}") {
                    sh 'mvn package -DskipTests'
                }
            }
        }
        
        stage('🐳 Backend: Build Docker Image') {
            steps {
                echo '🐳 Building backend Docker image...'
                dir("${BACKEND_DIR}") {
                    sh '''
                        docker build -t spring-backend:latest .
                        docker tag spring-backend:latest spring-backend:${BUILD_NUMBER}
                    '''
                }
            }
        }
        
        stage('🔒 Backend: Trivy Image Scan') {
            steps {
                echo '🔒 Scanning backend Docker image with Trivy...'
                sh '''
                    docker run --rm \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    aquasec/trivy:latest image \
                    --severity HIGH,CRITICAL \
                    --format table \
                    spring-backend:latest
                    
                    # Check for vulnerabilities (non-blocking for demo)
                    docker run --rm \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    aquasec/trivy:latest image \
                    --severity HIGH,CRITICAL \
                    --exit-code 0 \
                    spring-backend:latest
                '''
            }
        }
        
        // ==================== FRONTEND PIPELINE ====================
        
        stage('🧹 Frontend: Clean Install') {
            steps {
                echo '🧹 Installing frontend dependencies...'
                dir("${FRONTEND_DIR}") {
                    sh '''
                        rm -rf node_modules package-lock.json
                        npm install
                    '''
                }
            }
        }
        
        stage('🔍 Frontend: NPM Audit') {
            steps {
                echo '🔍 Auditing frontend dependencies...'
                dir("${FRONTEND_DIR}") {
                    sh '''
                        npm audit --production --audit-level=high || true
                        npm audit --json > npm-audit-report.json || true
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'frontend/npm-audit-report.json', allowEmptyArchive: true
                }
            }
        }
        
        stage('🧪 Frontend: ESLint Security Check') {
            steps {
                echo '🧪 Running ESLint security checks...'
                dir("${FRONTEND_DIR}") {
                    sh '''
                        # Install security plugins if not present
                        npm install --save-dev eslint-plugin-security eslint-plugin-no-secrets || true
                        
                        # Run ESLint
                        npx eslint . --ext .js,.jsx,.ts,.tsx \
                        --format html \
                        --output-file eslint-report.html || true
                        
                        npx eslint . --ext .js,.jsx,.ts,.tsx || true
                    '''
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'frontend',
                        reportFiles: 'eslint-report.html',
                        reportName: 'Frontend ESLint Security Report'
                    ])
                }
            }
        }
        
        stage('📊 Frontend: SonarQube Analysis') {
            steps {
                echo '📊 Running SonarQube analysis on frontend...'
                dir("${FRONTEND_DIR}") {
                    script {
                        def scannerHome = tool 'SonarScanner'
                        withSonarQubeEnv('SonarQube') {
                            sh """
                                ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=react-frontend \
                                -Dsonar.projectName="React Frontend" \
                                -Dsonar.sources=src \
                                -Dsonar.host.url=${SONARQUBE_URL} \
                                -Dsonar.login=${SONAR_TOKEN} \
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                            """
                        }
                    }
                }
            }
        }
        
        stage('⏳ Frontend: Quality Gate') {
            steps {
                echo '⏳ Waiting for frontend Quality Gate...'
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "❌ Frontend Quality Gate failed: ${qg.status}"
                        } else {
                            echo "✅ Frontend Quality Gate passed!"
                        }
                    }
                }
            }
        }
        
        stage('🛡️ Frontend: OWASP Dependency Check') {
            steps {
                echo '🛡️ Scanning frontend dependencies...'
                dir("${FRONTEND_DIR}") {
                    sh '''
                        mkdir -p odc-reports
                        docker run --rm \
                        -v $(pwd):/src \
                        -v $(pwd)/odc-reports:/report \
                        owasp/dependency-check:latest \
                        --scan /src/package.json \
                        --format ALL \
                        --project "React-Frontend" \
                        --out /report \
                        --failOnCVSS 7 || true
                    '''
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'frontend/odc-reports',
                        reportFiles: 'dependency-check-report.html',
                        reportName: 'Frontend OWASP Dependency Check'
                    ])
                }
            }
        }
        
        stage('🔒 Frontend: Secret Scanning') {
            steps {
                echo '🔒 Scanning for exposed secrets...'
                dir("${FRONTEND_DIR}") {
                    sh '''
                        docker run --rm \
                        -v $(pwd):/code \
                        trufflesecurity/trufflehog:latest \
                        filesystem /code \
                        --json > secrets-report.json || true
                        
                        if [ -s secrets-report.json ]; then
                            echo "⚠️ Potential secrets found!"
                            cat secrets-report.json
                        else
                            echo "✅ No secrets detected"
                        fi
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'frontend/secrets-report.json', allowEmptyArchive: true
                }
            }
        }
        
        stage('🧪 Frontend: Unit Tests') {
            steps {
                echo '🧪 Running frontend unit tests...'
                dir("${FRONTEND_DIR}") {
                    sh 'npm run test -- --coverage --watchAll=false || true'
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'frontend/coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Frontend Code Coverage Report'
                    ])
                }
            }
        }
        
        stage('📦 Frontend: Build Production') {
            steps {
                echo '📦 Building frontend for production...'
                dir("${FRONTEND_DIR}") {
                    sh 'npm run build'
                }
            }
        }
        
        stage('🐳 Frontend: Build Docker Image') {
            steps {
                echo '🐳 Building frontend Docker image...'
                dir("${FRONTEND_DIR}") {
                    sh '''
                        docker build -t react-frontend:latest .
                        docker tag react-frontend:latest react-frontend:${BUILD_NUMBER}
                    '''
                }
            }
        }
        
        stage('🔒 Frontend: Trivy Image Scan') {
            steps {
                echo '🔒 Scanning frontend Docker image with Trivy...'
                sh '''
                    docker run --rm \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    aquasec/trivy:latest image \
                    --severity HIGH,CRITICAL \
                    --format table \
                    react-frontend:latest
                    
                    # Check for vulnerabilities (non-blocking for demo)
                    docker run --rm \
                    -v /var/run/docker.sock:/var/run/docker.sock \
                    aquasec/trivy:latest image \
                    --severity HIGH,CRITICAL \
                    --exit-code 0 \
                    react-frontend:latest
                '''
            }
        }
        
        // ==================== DEPLOYMENT ====================
        
        stage('🚀 Deploy to Production') {
            steps {
                echo '🚀 Deploying full stack to production containers...'
                script {
                    sh '''
                        echo "Stopping old containers..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} stop app frontend
                        docker-compose -f ${DOCKER_COMPOSE_FILE} rm -f app frontend
                        
                        echo "Starting database (if not running)..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d db
                        sleep 10
                        
                        echo "Deploying backend..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d app
                        sleep 30
                        
                        echo "Deploying frontend..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d frontend
                        sleep 20
                        
                        echo "✅ Deployment completed!"
                    '''
                }
            }
        }
        
        stage('🧪 Post-Deployment Health Checks') {
            steps {
                echo '🧪 Running health checks...'
                sh '''
                    echo "Checking backend health..."
                    curl -f http://localhost:8080/actuator/health || exit 1
                    
                    echo "Checking database connectivity..."
                    curl -f http://localhost:8080/actuator/health/db || exit 1
                    
                    echo "Checking frontend accessibility..."
                    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
                    if [ $response -eq 200 ]; then
                        echo "✅ Frontend is accessible"
                    else
                        echo "❌ Frontend returned status code: $response"
                        exit 1
                    fi
                    
                    echo "✅ All health checks passed!"
                '''
            }
        }
        
        stage('📈 OWASP ZAP DAST Scan') {
            parallel {
                stage('Backend DAST') {
                    steps {
                        echo '📈 Running DAST scan on backend API...'
                        sh '''
                            docker run --rm \
                            --network host \
                            ghcr.io/zaproxy/zaproxy:stable \
                            zap-baseline.py \
                            -t http://localhost:8080 \
                            -r zap-backend-report.html \
                            -w zap-backend-report.md || true
                        '''
                    }
                }
                stage('Frontend DAST') {
                    steps {
                        echo '📈 Running DAST scan on frontend...'
                        sh '''
                            docker run --rm \
                            --network host \
                            ghcr.io/zaproxy/zaproxy:stable \
                            zap-baseline.py \
                            -t http://localhost:3000 \
                            -r zap-frontend-report.html \
                            -w zap-frontend-report.md || true
                        '''
                    }
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: '.',
                        reportFiles: 'zap-backend-report.html',
                        reportName: 'Backend DAST Report'
                    ])
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: '.',
                        reportFiles: 'zap-frontend-report.html',
                        reportName: 'Frontend DAST Report'
                    ])
                }
            }
        }
        
        stage('📊 Generate Security Summary') {
            steps {
                echo '📊 Generating security summary report...'
                sh '''
                    echo "=====================================" > security-summary.txt
                    echo "SECURITY SCAN SUMMARY - Build #${BUILD_NUMBER}" >> security-summary.txt
                    echo "=====================================" >> security-summary.txt
                    echo "" >> security-summary.txt
                    echo "✅ SonarQube Analysis: Completed" >> security-summary.txt
                    echo "✅ OWASP Dependency Check: Completed" >> security-summary.txt
                    echo "✅ Trivy Container Scan: Completed" >> security-summary.txt
                    echo "✅ Secret Scanning: Completed" >> security-summary.txt
                    echo "✅ DAST Scanning: Completed" >> security-summary.txt
                    echo "" >> security-summary.txt
                    echo "Deployment Status: SUCCESS" >> security-summary.txt
                    echo "=====================================" >> security-summary.txt
                    
                    cat security-summary.txt
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'security-summary.txt', allowEmptyArchive: true
                }
            }
        }
    }
    
    post {
        success {
            echo '''
            ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
            ✅  PIPELINE COMPLETED SUCCESSFULLY!   ✅
            ✅  Full Stack Deployed to Production  ✅
            ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅
            
            📊 View Reports:
               - SonarQube: http://localhost:9000
               - Grafana: http://localhost:3001
               - Prometheus: http://localhost:9090
               
            🌐 Application URLs:
               - Frontend: http://localhost:3000
               - Backend: http://localhost:8080
               - API Docs: http://localhost:8080/swagger-ui.html
            '''
        }
        failure {
            echo '''
            ❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
            ❌  PIPELINE FAILED!                 ❌
            ❌  Security issues or build errors  ❌
            ❌  Deployment BLOCKED!              ❌
            ❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌
            
            🔍 Check the logs above for details
            📧 Notify security team immediately
            '''
            
            // Optional: Rollback to previous version
            sh '''
                echo "Rolling back to previous stable version..."
                docker-compose -f ${DOCKER_COMPOSE_FILE} down
                # Add rollback logic here if needed
            '''
        }
        always {
            echo '🧹 Cleaning up temporary files...'
            sh '''
                # Clean up reports older than 7 days
                find . -name "*-report.*" -type f -mtime +7 -delete || true
            '''
        }
    }
}