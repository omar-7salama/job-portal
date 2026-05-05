FROM maven:3.9.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copy ONLY the service pom.xml (not root pom.xml)
COPY pom.xml .
COPY src ./src

# Build with explicit pom.xml reference
# This ensures Maven does NOT look for parent pom or modules
RUN mvn clean package -DskipTests -DskipDockerBuild=true -q

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
USER app

# Copy the built JAR from build stage
COPY --from=build /app/target/user-service-1.0.0.jar app.jar

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD java -cp app.jar org.springframework.boot.loader.JarLauncher || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
