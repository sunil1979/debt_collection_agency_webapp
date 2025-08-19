# Debt Collection Agency Webapp

This is a web application for a debt collection agency, built with Next.js and MongoDB.

## Design

The application will have the following components:

- **Dashboard:** The main entry point of the application, providing navigation to other sections.
- **Customers Page:** This page will display a list of all customers from the MongoDB database. It will allow the user to:
  - View a list of customers.
  - Click on a customer to view their details.
  - Edit a customer's information.
  - Perform actions on one or more customers.
- **Customer Details Page:** This page will display the detailed information of a selected customer.
- **Customer Edit Page:** This page will provide a form to edit the details of a customer.

## Running the App

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
3.  **Open your browser** to [http://localhost:3000](http://localhost:3000) to see the application.

## MongoDB Connection

The application connects to a MongoDB database. The mongo url is in .env.local file. change the MONGO_URL appropriately:

Typical URL when connecting to a mongo instance on kubernetes cluster looks like : `mongodb://adminuser:password123@host.docker.internal:32000/?authSource=admin`
Typical URL when connecting to a mongo instance on local machine looks like : `mongodb://localhost:27017/`

## Settings

Make sure to visit the Settings and update values. Without updating settings, the application will not work.

## Running with Docker

This application can be containerized using Docker. The `Dockerfile` in the root directory defines the container image.

### Dockerfile Explained

- **`FROM node:20-slim`**: Starts with a lightweight Node.js 20 image.
- **`WORKDIR /app`**: Sets the working directory inside the container to `/app`.
- **`COPY package*.json ./`**: Copies the package manager files to the container.
- **`RUN npm install`**: Installs the project dependencies.
- **`COPY . .`**: Copies the rest of the application code into the container.
- **`RUN npm run build`**: Builds the Next.js application for production.
- **`EXPOSE 3000`**: Exposes port 3000 for the application.
- **`CMD ["npm", "start"]`**: Specifies the command to run when the container starts.

### Build and Run the Docker Container

1.  **Build the Docker image:**
    ```bash
    docker build -t debt-collection-webapp .
    ```
2.  **Run the Docker container:**
    ```bash
    docker run -p 3000:3000 debt-collection-webapp
    ```
3.  **Open your browser** to [http://localhost:3000](http://localhost:3000) to see the application.

## Deploying to Kubernetes

This application can be deployed to a Kubernetes cluster using the `deployment.yaml` file.

### Kubernetes Deployment Explained (`deployment.yaml`)

The `deployment.yaml` file defines two Kubernetes resources:

1.  **`Deployment`**: This resource manages the application pods.

    - `replicas: 2`: Ensures that two instances of the application are running.
    - `image: debt-collection-webapp:latest`: Specifies the Docker image to use for the pods.
    - `imagePullPolicy: IfNotPresent`: This policy tells Kubernetes to use a local image if it exists, rather than pulling from a remote registry. This is useful for local development with Minikube or Docker Desktop's Kubernetes cluster.
    - `containerPort: 3000`: The port that the application is listening on inside the container.
    - `resources`: Defines the CPU and memory requests and limits for the container.

2.  **`Service`**: This resource exposes the application to the network.
    - `type: LoadBalancer`: This service type creates an external load balancer to route traffic to the application. In a cloud environment, this will provision a cloud load balancer. For local development (e.g., with Minikube), you can use `minikube service debt-collection-webapp-service` to get an accessible URL.
    - `port: 80`: The port that the service will be available on.
    - `targetPort: 3000`: The port on the pods that the service will forward traffic to.

### Deploying to the Cluster

1.  **Apply the deployment configuration:**

    ```bash
    kubectl apply -f deployment.yaml
    ```

2.  **Check the status of the deployment:**

    ```bash
    kubectl get deployments
    ```

3.  **Check the status of the pods:**

    ```bash
    kubectl get pods
    ```

4.  **Check the status of the service and get the external IP:**

    ```bash
    kubectl get services
    ```

5.  **Access the application:**
    Once the service has an external IP, you can access the application in your browser at `http://<EXTERNAL-IP>`.
    If you are using Minikube, you can run the following command to get the URL:
    ```bash
    minikube service debt-collection-webapp-service
    ```
