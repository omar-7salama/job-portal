FROM maven:3.9.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copy EVERYTHING (important)
COPY . .

# Build only job-service module
RUN mvn -pl job-service -am clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=build /app/job-service/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
