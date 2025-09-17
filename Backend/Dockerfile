FROM gradle:8-jdk21-alpine as build

WORKDIR /workspace

COPY build.gradle settings.gradle ./
COPY gradlew ./gradlew
COPY gradle ./gradle
COPY src ./src

RUN chmod +x ./gradlew && ./gradlew build -x test

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=build /workspace/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]