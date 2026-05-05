FROM maven:3.9.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copy ONLY user-service project
COPY . .

# Build only this module (important fix)
RUN mvn -pl user-service -am clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
USER app

# Copy correct jar (adjust name if needed)
COPY --from=build /app/user-service/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
